import { createStore, combineReducers, applyMiddleware } from "redux";
import { createMiddleware } from "xstream-redux-observable";
import { getContents } from "./api";
import xs from "xstream";

export const ACTIONS = {
    loaded: "chapters-loaded",
    load: "load-chapters"
};
const defaultState = {
    chapters: ["yolo"]
};
function book ( state = defaultState, action ) {
    const { type, data } = action
    switch ( type ) {

        case ACTIONS.loaded:
            return {
                ...state,
                chapters: data
            };

        default:
            return state;

    }

}

const loadBook = () => {

    return xs.fromPromise(getContents({
        author: "sjl",
        repo: "learnvimscriptthehardway",
        path: "chapters"
    }));

};

const middleware = createMiddleware( action$ => {

    const chapters$ = loadBook()
        .debug("chapters")
        .map( chapters => ({
            type: ACTIONS.loaded,
            data: chapters
        }) );

    return chapters$;
});

export const store = createStore(
    combineReducers({
        book
    }),
    applyMiddleware(middleware)
);
