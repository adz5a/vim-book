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
});
