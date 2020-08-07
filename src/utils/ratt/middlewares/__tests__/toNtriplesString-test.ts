import * as chai from "chai";
import { Store, DataFactory } from "n3";
import Ratt, { Middleware } from "@triply/ratt";
import { addQuad } from "@triply/ratt/lib/middlewares/transforming";
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
    const app = new Ratt();
    app.use(getDummyMiddleware());
    app.use(addQuad(DataFactory.namedNode("ex:1"), DataFactory.namedNode("ex:2"), (ctx) => ctx.record.id));

    const { mw, end } = toNtriplesString();
    app.use(mw);
    await app.run();

    const result = await end();
    expect(result.split("\n")).to.have.lengthOf(11);
  });
});
