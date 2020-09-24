import Ratt from "@triply/ratt";
import fromArray from "@triply/ratt/lib/middlewares/reading/fromArray";
import { Util } from "n3";
import toNtriplesString from "utils/ratt/middlewares/toNtriplesString";
import { ApplyTransformation } from "Definitions";

const applyTransformation: ApplyTransformation = async (opts) => {
  if (opts.type === "ratt" && Array.isArray(opts.source)) {
    const baseIri = Util.prefix(opts.config.baseIri);
    const app = new Ratt();

    app.use(fromArray(opts.source));

    let rowCount = 0;
    app.use((ctx, next) => {
      const subject = baseIri("" + rowCount);
      for (const col in ctx.record) {
        if (ctx.record[col]) {
          ctx.store.addQuad(subject, baseIri(col), ctx.record[col]);
        }
      }
      ctx.store.addQuad(subject, ctx.app.prefix["rdf"]("type"), ctx.app.prefix["rdfs"]("Resource"));
      rowCount++;
      return next(ctx.record, ctx.store);
    });
    const { mw, end } = toNtriplesString();
    app.use(mw);
    await app.run();
    return end();
  } else {
    throw new Error("Not supported");
  }
};
export default applyTransformation;
