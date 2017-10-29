import { createStore, combineReducers, applyMiddleware } from "redux";
import { ACTIONS, withType, asType, makeReducer } from "./actions";
import { middleware } from "./middleware";
export * from "./actions";



const updateBy = key => ( state = {}, data ) =>  {

  const index = data[key];
  return {
    ...state,
    [index]: data
  };


};

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
  [ACTIONS.chapterFetched]: updateBy("name"),
  [ACTIONS.chapterLoaded]: indexBy("name")
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
