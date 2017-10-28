import { createMiddleware, toArray } from "xstream-redux-observable";
import { ACTIONS, withType, asType, makeReducer } from "./actions";
import xs from "xstream";
import flattenConcurrently from "xstream/extra/flattenConcurrently";
import delay from "xstream/extra/delay";
import PouchDB from "pouchdb-browser";
import { getContents } from "./api";
import { saveToc, loadToc, loadChapters } from "./middleware";


describe("pouchdb", () => {
  describe("get", () => {

    test("404", async function () {
      expect.hasAssertions();
      const db = new PouchDB("db-test");


      try {
        const response = await db.get("toc")
      } catch ( e ) {
        expect(e.status).toBe(404);
      }
      return await db.destroy();
    });

    test("200", async function () {
      expect.hasAssertions();
      const db = new PouchDB("db-test");
      const data = {
        foo: "bar"
      };

      await db.put({
        _id: "lol",
        data
      });


      try {
        const response = await db.get("lol");
        const { _id, _rev, data } = response;
        expect(_id).toBe("lol");
        expect(typeof _rev).toBe("string");
        expect(data).toEqual(data);
      } catch ( e ) {
        expect(e.status).toBe(404);
      }
      return await db.destroy();
    });

  });

  describe("put", () => {


    test("200", async function () {
      expect.hasAssertions();
      const db = new PouchDB("db-test");
      const data = {
        foo: "bar"
      };

      const response = await db.put({
        _id: "lol",
        data
      });

      const { ok, id, rev } = response;
      expect(ok).toBe(true);
      expect(id).toBe("lol");
      expect(typeof rev).toBe("string");

      return await db.destroy();
    });

    test("conflict", async function () {

      expect.hasAssertions();
      const db = new PouchDB("db-test");
      const data = {
        foo: "bar"
      };

      await db.put({
        _id: "lol",
        data
      });

      try {
        const response = await db.put({
          _id: "lol",
          data
        });
      } catch ( e ) {
        const { status, error, id } = e;
        expect({ status, error, id }).toEqual({
          status: 409,
          error: true,
          id: "lol"
        });
      }


      return await db.destroy();


    });

    test("update", async function () {

      expect.hasAssertions();
      const db = new PouchDB("db-test");
      const data = {
        foo: "bar"
      };

      const response = await db.put({
        _id: "lol",
        data
      });


      try {
        const final = await db.put({
          _id: response.id,
          _rev: response.rev,
          data: {
            foo: "baz"
          }
        });

        const { ok, rev, id } = final;
        expect(ok).toBe(true);
        expect(id).toBe("lol");
        expect(typeof rev).toBe("string");

      } catch ( e ) {
        console.log(e);
      }

      return await db.destroy();
    });

    describe("bulk add", () => {

      test("200", async function () {

        expect.hasAssertions();

        const messages = [ "bar", "baz", "boz" ].map(( m, i ) => ({
          _id: i + "_doc",
          data: {
            foo: m
          }
        }));

        const db = new PouchDB("db-test");

        try {
          const response = await db.bulkDocs(messages);

          response.forEach(({ ok, id, rev }) => {
            expect(ok).toBe(true);
            expect(typeof id).toBe("string");
            expect(typeof rev).toBe("string");
          });

        } catch ( e ) {
          console.log(e);
        }

        return await db.destroy();

      });

      test("update - with errors", async function () {

        expect.hasAssertions();

        const messages = [ "bar", "baz" ].map(( m, i ) => ({
          _id: i + "_doc",
          data: {
            foo: m
          }
        }));

        const db = new PouchDB("db-test");

        try {
          const response = await db.bulkDocs(messages);

          const updates = messages.map(( m, i ) => ({
            _id: response[i].id,
            _rev: i !== 1 ? "" : response[i].rev,
            data: {
              foo: "bar"
            }
          }));

          const final = await db.bulkDocs(updates);
          const [ r1, r2 ] = final;

          expect(r1.status).toEqual(409);
          expect(r1.error).toEqual(true);
          expect(r1.id).toEqual(messages[0]._id);

          expect(r2).toMatchObject({
            ok: true,
            id: messages[1]._id
          });

        } catch ( e ) {
          console.log(e);
        }

        return await db.destroy();

      });
    });
  });
});


describe("tocs", () => {

  const author= "sjl";
  const repo= "learnvimscriptthehardway";


  test("load toc - with empty db toc", async function () {
    expect.hasAssertions(); 

    const db = new PouchDB("toc-test");
    const res$ = await loadToc(db);

    const actions = await toArray(res$);
    // console.log(actions);

    const types = actions.map( a => a.type );
    expect(types).toMatchSnapshot();

    const toc = await db.get("toc");

    return await db.destroy();
  });

  test("load toc - with non-empty db toc", async function () {
    expect.hasAssertions(); 

    const db = new PouchDB("toc-test");
    await db.put({
      _id: "toc",
      toc: {
        foo: "bar"
      }
    });
    
    const res$ = await loadToc(db);
    const actions = await toArray(res$);
    // console.log(actions);

    const types = actions.map( a => a.type );
    expect(types).toMatchSnapshot();
    const [ action ] = actions;

    expect(action.data).toEqual({
      foo: "bar"
    });

    return await db.destroy();
  });


  test("load chapter", async function () {
    expect.hasAssertions();
    const db = new PouchDB("load-chapter-test");

    const toc = await getContents({
      author,
      repo,
      path: "chapters"
    });
    console.log("response");
    const res$ = loadChapters(toc.slice(0, 3));
    const final = await toArray(res$);

    const types = final.map( a => a.type )
      .forEach(t => expect(t).toBe(ACTIONS.chapterLoaded));

    return await db.destroy();

  });
});
