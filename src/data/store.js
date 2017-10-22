import { createStore, combineReducers, applyMiddleware } from "redux";
import { ACTIONS, withType, asType, makeReducer } from "./actions";
import { middleware } from "./middleware";
export * from "./actions";





const toc = makeReducer({
    [ACTIONS.loaded]: (toc, chapters) => chapters
},[]);

const chapters = makeReducer({
    [ACTIONS.chapterContentLoaded]: (chapters, chapter) => ({
        ...chapters,
        [chapter.path]: chapter
    })
},[]);

const book = combineReducers({
    toc,
    chapters
});



/**
 * @returns TOC[]
 */

export const store = createStore(
    combineReducers({
        book
    }),
    applyMiddleware(middleware)
);
