import { createStore, combineReducers, applyMiddleware } from "redux";
import { createMiddleware } from "xstream-redux-observable";
import { getContents } from "./api";
import xs, { merge } from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import delay from "xstream/extra/delay";

export const ACTIONS = {
    loaded: "chapters-loaded",
    load: "load-chapters",
    contentLoaded: "chapter-content-loaded"
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
        case ACTIONS.contentLoaded:
            return {
                ...state,
                chapters: state.chapters.map(( current ) => {
                    if( current.path === data.path ) {
                        return {
                            ...current,
                            ...data
                        };
                    } else return current;
                })
            };

        default:
            return state;

    }

}

const author= "sjl";
const repo= "learnvimscriptthehardway";
const loadBook = () => {

    const chapters$ = xs.fromPromise(getContents({
        author,
        repo,
        path: "chapters"
    }));

    const data$ = chapters$
        .map( chapters => {

            const period = 1000;
            const chaptersArr$ = chapters.map( (c, index) => {
                return xs.of(c)
                    .compose(delay(index * period))
                    .map(c => xs.fromPromise(getContents({
                        author,
                        repo,
                        path: c.path
                    })))
                    .flatten();
            } );

            return xs.merge.apply(
                null,
                chaptersArr$
            )
                .replaceError( e => {
                    console.error(e);
                    return xs.empty();
                });
        })
        .flatten()
        .debug("chapter");

    return {
        chapters$,
        data$
    };
};

const middleware = createMiddleware( action$ => {

    const { chapters$, data$ } = loadBook()

    const loaded$ = chapters$
        .debug("chapters")
        .map( chapters => ({
            type: ACTIONS.loaded,
            data: chapters
        }) );


    const content$ = data$
        .debug("content")
        .map(chapter => ({
            type: ACTIONS.contentLoaded,
            data: chapter
        }))
        .replaceError(e => {
            console.error(e);
            return xs.empty();
        });

    return xs.merge(loaded$, content$);
});

export const store = createStore(
    combineReducers({
        book
    }),
    applyMiddleware(middleware)
);
