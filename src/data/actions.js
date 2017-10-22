export const ACTIONS = {
    chapterContentLoaded: "chapter-content-loaded",
    loadedCachedChaptersContent: "loaded-cached-chapter-contents",
    chapterContentSaved: "chapter-content-saved",
    chapterContentMissing: "chapter-content-missing",
    missingChaptersContent: "missing-chapters-content",
    tocLoaded: "toc-loaded",
    loadTOC: "load-toc",
    tocCacheError: "toc-cache-error",
    fetchTOC: "fetch-toc",
    fetchedTOC: "fetched-toc",
    savedTOC: "saved-toc"
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
