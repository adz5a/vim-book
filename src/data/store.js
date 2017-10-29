import { createStore, combineReducers, applyMiddleware } from "redux";
import { ACTIONS, withType, asType, makeReducer } from "./actions";
import { middleware } from "./middleware";
export * from "./actions";



const indexBy = key => ( state = {}, data ) =>  {

  const index = data[key];
  return data.reduce(( state, data ) => {
    state[index] = data;
    return state;
  }, { ...state });

};


const toc = makeReducer({
    [ACTIONS.tocLoaded]: (toc, chapters) => chapters
},[]);

const chapters = makeReducer({
  [ACTIONS.chapterLoaded]: indexBy("name"),
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
