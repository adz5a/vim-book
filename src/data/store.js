import { createStore, combineReducers, applyMiddleware } from "redux";
import { ACTIONS, withType, asType, makeReducer } from "./actions";
import { middleware } from "./middleware";
export * from "./actions";



const indexBy = key => ( state = {}, data ) =>  {

  return data.reduce(( state, item ) => {
    const index = item[key];
    state[index] = item;
    return state;
  }, { ...state });

};


const toc = makeReducer({
    [ACTIONS.tocLoaded]: (toc, chapters) => chapters
},[]);

const chapters = makeReducer({
  [ACTIONS.chapterContentLoaded]: indexBy("path"),
  [ACTIONS.loadedCachedChaptersContent]: indexBy("path")
}, {});

const book = combineReducers({
    toc,
    chapters
});



/**
 * @returns TOC[]
 */

export const store = createStore(
    combineReducers({
      book,
    }),
    applyMiddleware(middleware)
);
