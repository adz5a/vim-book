import { createMiddleware } from "xstream-redux-observable";
import { getContents$ } from "./api";
import { ACTIONS, withType, asType, makeReducer } from "./actions";
import xs from "xstream";
import delay from "xstream/extra/delay";

const author= "sjl";
const repo= "learnvimscriptthehardway";
const PouchDB = global.PouchDB;
const db = new PouchDB("book");
global.bookDB = db;

const fetchTOC = () => getContents$({
  author,
  repo,
  path: "chapters"
});

const updateCachedChapter = chapter => db.get(chapter.path)
  .then(doc => db.put({
    _id: chapter.path,
    _rev: doc._rev,
    chapter
  }), error => {
    if ( error.status === 404 ) {
      return db.put({
        _id: chapter.path,
        chapter
      });
    } else throw error;
  });

export const middleware = createMiddleware( action$ => {

  const loadTOC$ = action$.filter(withType(ACTIONS.loadTOC))
    .map(() => xs.fromPromise(db.get("toc")
      .then(doc => doc.toc)))
    .flatten()
    .map(asType(ACTIONS.tocLoaded))
    .replaceError(e => {
      return xs.of({
        type: ACTIONS.tocCacheError,
        data: e
      }); 
    });

  const fetchMissingTOC$ = action$
    .filter(action => {
      const { type, data: error } = action;
      return type === ACTIONS.tocCacheError && error.status === 404;
    })
    .map(fetchTOC)
    .flatten()
    .map(asType(ACTIONS.fetchedTOC));

  const saveFetchedTOC$ = action$.filter(withType(ACTIONS.fetchedTOC))
    .map(({ data: toc }) => xs.fromPromise(db.put({
      _id: "toc",
      toc
    })))
    .flatten()
    .map(toc => xs.of({
      type: ACTIONS.tocLoaded,
      data: toc
    }, {
      type: ACTIONS.savedTOC,
      data: toc
    }))
    .flatten();

  const fetchAllChapter$ = action$.filter(withType(ACTIONS.missingChaptersContent))
    .map(({ type, data: chapters }) => {
      /*
       * Array<Stream<Chapter>>
       */
      const chapters$Array = chapters.map((chapter, index) => xs
        .of(chapter)
        .compose(delay(1000 * index))
        .map(chapter => getContents$({
          author,
          repo,
          path: chapter.path
        })));

      return xs.merge.apply(null, chapters$Array).flatten();
    })
    .flatten()
    .map(asType(ACTIONS.chapterContentLoaded));

  // hwen tocs are loaded
  // look up in the db db for correspdongi chatpers
  const loadAllChapterFormCache$ = action$
    .filter(withType(ACTIONS.tocLoaded))
    .map(({ data: chapters }) => {

      /*
       * TODO: add test for this tiny tiny logic
       */
      return xs
        .fromPromise(db.bulkGet({
          docs: chapters.map(chapter => ({ id: chapter.path }))
        }))
        .map(response => {
          console.log(response);

          const {
            missing,
            found
          } = response.results
            .reduce((results, item) => {
              const OKs = item.docs
                .filter(({ ok = {} }) => {
                  return ok.chapter;
                } );

              if ( OKs.length > 0 ) {
                results.found.push(OKs[0].ok.chapter);
              } else {
                results.missing.push({
                  path: item.id
                });
              }
              return results;
            }, {
              missing: [],
              found: []
            });

          return xs.of(
            { 
              type: ACTIONS.loadedCachedChaptersContent,
              data: found
            },
            {
              type: ACTIONS.missingChaptersContent,
              data: missing
            }
          );
        })
        .flatten();

    })
    .flatten();

  // each time a chapter is loaded, save it in the local db
  const saveChapterContent$ = action$
    .filter(withType(ACTIONS.chapterContentLoaded))
    .map(({ data: chapter }) => xs
      .fromPromise(updateCachedChapter(chapter))
      .map(() => ({
        type: ACTIONS.chapterContentSaved,
        data: chapter
      })))
    .flatten();


  return xs.merge(
    loadTOC$,
    fetchMissingTOC$,
    saveFetchedTOC$,
    loadAllChapterFormCache$,
    fetchAllChapter$,
    saveChapterContent$,
    xs.of({ type: ACTIONS.loadTOC })
  )
    .replaceError(e => {
      console.error(e);
      return xs.empty();
    });
});
