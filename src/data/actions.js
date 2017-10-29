export const ACTIONS = {
  tocLoaded: "toc-loaded",
  tocSaved: "toc-saved",
  errorTocSave: "error-toc-save",
  tocUnavailable: "toc-unavailable",
  chapterLoaded: "chapter-loaded",
  chapterFetched: "chapter-fetched",
  chaptersNotCached: "chapter-not-cached",
  chapterUnavailable: "chapter-unavailable",
  chapterSaved: "chapter-saved",
  chapterSaveError: "chapter-save-error",
  start: "book-start"
};


export const withType = type => action => action.type === type;
export const asType = type => data => ({
    type,
    data
});

export const makeReducer = (options, defaultState = {}) => {
    const reduce = ( state = defaultState, action ) => {
        const { type, data } = action;
        if ( options[type] ) {
            return options[type](state, data);
        } else return state;
    };
    return reduce;
};
