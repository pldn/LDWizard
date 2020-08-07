import { Middleware } from "@triply/ratt";
import { Writer } from "n3";

export default function toNtriplesString(): { mw: Middleware; end: () => Promise<string> } {
  const writer = new Writer({ format: "ntriples" });
  return {
    mw: async function (ctx, next) {
      writer.addQuads(ctx.store.getQuads(null, null, null, null));

      return next(ctx.record, ctx.store);
    },
    end: () => {
      return new Promise<string>((resolve, reject) => {
        writer.end((e, result) => {
          if (e) return reject(e);
          resolve(result);
        });
      });
    },
  };
}
