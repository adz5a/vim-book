import xs, { Stream } from "xstream";


interface Options {
  repo: string;
  author: string;
  path?: string;
}

/*
 * https://developer.github.com/v3/repos/contents/
 */
interface ApiResponse {
  type: "file"| "dir";
  encoding: "base64" | null;
  size: number;
  name: string;
  path: string;
  content: string;
  sha: string;
  url: string;
  git_url: string;
  html_url: string;
  download_url: string;
  _links: {
    git: string;
    self: string;
    html: string;
  }
}

interface ApiPartialResponse {
  type: "file" | "dir";
  size: number;
  name: string;
  path: string;
  sha: string;
  url: string;
  git_url: string;
  html_url: string;
  download_url: string | null;
  _links: {
    self: string;
    git: string;
    html: string;
  }
}

const baseURL = "https://api.github.com";

export const makeURL = ( options: Options ) => {
  if (options.path !== undefined) {
    return `${baseURL}/repos/${options.author}/${options.repo}/contents/${options.path}`;
  } else {
    return `${baseURL}/repos/${options.author}/${options.repo}`;
  }
};

export const getContents = ( options: Options ): Promise<ApiResponse | ApiPartialResponse[]> => {
  return fetch(makeURL(options))
    .then( response => {
      return response.json()
        .then( data => {
          if ( response.status !== 200 ) {
            throw data;
          } else {
            return data;
          }
        });
    }) as Promise<ApiResponse>;
};

export const getContents$ = ( options: Options ): Stream<ApiResponse | ApiPartialResponse[]> => {
  return xs.fromPromise(getContents(options));
};
