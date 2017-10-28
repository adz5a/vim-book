import { createMiddleware } from "xstream-redux-observable";
import { ACTIONS, withType, asType, makeReducer } from "./actions";
import xs from "xstream";
import delay from "xstream/extra/delay";
import PouchDB from "pouchdb-browser";

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
