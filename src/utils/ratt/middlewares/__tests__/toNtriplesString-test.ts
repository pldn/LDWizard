import * as chai from "chai";
import { DataFactory } from "n3";
import Ratt, { Middleware, Store } from "@triply/ratt";
import { addQuad, toLiteral } from "@triply/ratt/lib/middlewares/store";
import toNtriplesString from "../toNtriplesString";
var expect = chai.expect;

function getDummyMiddleware(): Middleware {
  return async function (_ctx, next) {
    for (let i = 0; i < 10; i++) {
      await next({ id: i }, new Store());
    }
  };
}
describe("Ratt - ToNtriplesString", function () {
  it("ToNtriplesString", async function () {
    const app = new Ratt({ prefixes: { ex: "https://ex.com/" } });
    app.use(getDummyMiddleware());
    app.use(addQuad(app.prefix.ex("1"), app.prefix.ex("2"), toLiteral("id")));

    const { mw, end } = toNtriplesString();
    app.use(mw);
    await app.run();

    const result = await end();
    expect(result.split("\n")).to.have.lengthOf(11);
  });
});
