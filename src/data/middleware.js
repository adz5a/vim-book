import { createMiddleware } from "xstream-redux-observable";
import { getContents } from "./api";
import { ACTIONS, withType, asType, makeReducer } from "./actions";
import xs from "xstream";
import delay from "xstream/extra/delay";

const author= "sjl";
const repo= "learnvimscriptthehardway";
const PouchDB = global.PouchDB;
const db = new PouchDB("book");

const fetchTOC = () => xs.fromPromise(getContents({
    author,
    repo,
    path: "chapters"
}));

export const middleware = createMiddleware( action$ => {

    const loadTOC$ = action$.filter(withType(ACTIONS.loadTOC))
        .map(() => xs.fromPromise(db.get("toc")
            .then(doc => doc.toc)))
        .flatten()
        .map(asType(ACTIONS.tocLoaded))
        .replaceError(e => {
            return xs.of({
                type: "toc-cache-error",
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

    const loadChapters$ = action$.filter(withType(ACTIONS.tocLoaded))
        .map(({ type, data: chapters }) => {
            /*
              Array<Stream<Chapter>>
            */
            const chapters$Array = chapters.map((chapter, index) => xs
                .of(chapter)
                .compose(delay(1000 * index))
                .map(chapter => xs.fromPromise(getContents({
                    author,
                    repo,
                    path: chapter.path
                }))));

            return xs.merge.apply(null, chapters$Array).flatten();
        })
        .flatten()
        .map(asType(ACTIONS.chapterContentLoaded));

    return xs.merge(
        loadTOC$,
        fetchMissingTOC$,
        saveFetchedTOC$,
        loadChapters$,
        xs.of({ type: ACTIONS.loadTOC })
    )
        .replaceError(e => {
            console.error(e);
            return xs.empty();
        });
});
