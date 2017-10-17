declare var require: (s: string) => any;
/*
 * Provides a ts only ( no tsx ) of a function tested with jest
 * in a js environment.
 *
 */
export type flags = "ok" | "nok";



interface Action {
  type: flags;
  payload: any
}

interface Ok extends Action {
  type: "ok";
  payload: any;
}

interface NOk extends Action {
  type: "nok";
  payload: any;
}

export function move ( dir: "up" | "down" ): number {
  return dir === "up" ?
    1:
    0;
}

export function maybeThrow ( a: string ):never {
  if ( a === "boom" ) {
    throw new Error("BOOM");
  }
}

const s: string = maybeThrow("");


// function nS ( s: string ): any {
//   return "lol";
// }

// nS(s);
