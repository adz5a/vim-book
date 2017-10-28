import { createMiddleware } from "xstream-redux-observable";
import { getContents } from "./api";
import { ACTIONS, withType, asType, makeReducer } from "./actions";
import xs from "xstream";
import delay from "xstream/extra/delay";
import PouchDB from "pouchdb-browser";
import flattenConcurrently from "xstream/extra/flattenConcurrently";

const author= "sjl";
const repo= "learnvimscriptthehardway";
const db = new PouchDB("book");

export function loadChapters ( toc ) {

  /*
   * fires a request every second
   * returns a stream of actions
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
            type: ACTIONS.chapterLoaded,
            data: chapter
          }
        }, error => {
          return {
            type: ACTIONS.chapterUnavailable,
            data: error
          }; 
        })
    })
    .map(xs.fromPromise)
    .compose(flattenConcurrently);
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

export const middleware = createMiddleware( raw$ => {

});
