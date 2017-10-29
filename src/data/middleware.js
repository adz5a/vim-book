import { createMiddleware, ofType } from "xstream-redux-observable";
import { getContents } from "./api";
import { ACTIONS, makeReducer } from "./actions";
import xs from "xstream";
import delay from "xstream/extra/delay";
import PouchDB from "pouchdb-browser";
import flattenConcurrently from "xstream/extra/flattenConcurrently";

const author= "sjl";
const repo= "learnvimscriptthehardway";
const db = new PouchDB("book");

export function fetchChapter$ ( toc ) {

  /*
   * fires a request every second * returns a stream of actions
   */
  return xs.periodic(1000)
    .take(toc.length)
    .map( index => {
      return getContents({
        author,
        repo,
        path: toc[index].path
      })
        .then(chapter => {
          return {
            type: ACTIONS.chapterFetched,
            data: chapter
          }
        }, error => {
          return {
            type: ACTIONS.chapterUnavailable,
            data: {
              chapter: toc[index],
              error
            }
          }; 
        })
    })
    .map(xs.fromPromise)
    .compose(flattenConcurrently);
}

async function loadChaptersFromCache$ ( db, toc ) {

  const response = await db.allDocs({
    keys: toc.map(chapter => {
      return chapter.path
    }),
    include_docs: true
  });

  const availables = response.rows
    .filter(row => {
      return !row.error;
    })
    .map(row => {
      return row.doc.chapter;
    });
  const unavailables = response.rows
    .filter(row => {
      return row.error;
    })
    .map(row => ({
      path: row.key
    }));

  return xs.of({
    type: ACTIONS.chapterLoaded,
    data: availables
  }, {
    type: ACTIONS.chaptersNotCached,
    data: unavailables
  });

}
export async function saveToc ( db, toc ) {

  try {
    const res = await db.put({
      _id: "toc",
      toc
    });
    return xs.of({
      type: ACTIONS.tocSaved,
      data: res
    });
  } catch ( e ) {
    return xs.of({
      type: ACTIONS.errorTocSave,
      data: e
    });
  }
}
export async function loadToc ( db ) {

  try {

    // if cached, fetch and return
    const doc = await db.get("toc");
    return xs.of({
      type: ACTIONS.tocLoaded,
      data: doc.toc
    });

  } catch ( e ) {

    // if not cached ( ie : e.status === 404 )
    // fetch remotely
    try {
      const toc = await getContents({
        author,
        repo,
        path: "chapters"
      });

      return xs.merge(
        xs.of({
          type: ACTIONS.tocLoaded,
          data: toc
        }),
        await saveToc(db, toc)
      );

    } catch (e) {
      return xs.of({
        type: ACTIONS.tocUnavailable,
        data: e
      }); 
    }

  }

}
export function saveChapter$ ( db, chapter ) {

  return xs.fromPromise(db.put({
    _id: chapter.path,
    chapter
  })
    .then(() => ({
      type: ACTIONS.chapterSaved,
      data: chapter
    }), error => ({
      type: ACTIONS.chapterSaveError,
      data: {
        chapter,
        error
      }
    })));

}

export const middleware = createMiddleware( raw$ => {

  const actions$ = raw$.debug("actions");
  const loadToc$ =  actions$
    .filter(ofType(ACTIONS.start))
    .map(() => xs.fromPromise(loadToc(db)))
    .flatten()
    .flatten();

  const chapterLoaded$ = actions$
    .filter(ofType(ACTIONS.tocLoaded))
    .map(action => xs.fromPromise(loadChaptersFromCache$(db, action.data)))
    .flatten()
    .flatten();

  const chapterFetched$ = actions$
    .filter(ofType(ACTIONS.chaptersNotCached))
    .map(action => fetchChapter$(action.data))
    .flatten();

  const chapterSaved$ = actions$
    .filter(ofType(ACTIONS.chapterFetched))
    .map(action => saveChapter$(db, action.data))
    .flatten();

  console.log(chapterLoaded$);
  return xs.merge(
    loadToc$,
    chapterLoaded$,
    chapterFetched$,
    chapterSaved$
  );
});
