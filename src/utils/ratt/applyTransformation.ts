import Ratt from "@triply/ratt";
import fromArray from "@triply/ratt/lib/middlewares/reading/fromArray";
import { Util, NamedNode } from "n3";
import toNtriplesString from "./middlewares/toNtriplesString";
import { ApplyTransformation } from "../../Definitions";
import { cleanCSVValue, getBaseIdentifierIri, getBasePredicateIri } from "../helpers";
/**
 * This file serves as the base template for a Ratt transformation script
 * See `../../config/rattScript.ts` for the current transformation script
 */
const applyTransformation: ApplyTransformation = async (opts) => {
  if (opts.type === "ratt" && Array.isArray(opts.source)) {
    const baseDefIri = Util.prefix(getBasePredicateIri(opts.config.baseIri.toString()));
    const baseInstanceIri = Util.prefix(getBaseIdentifierIri(opts.config.baseIri.toString()));
    const app = new Ratt();

    const getColumnConfig = (colName: string) =>
      opts.config.columnConfiguration.find((col) => col.columnName === colName);

    // Load from supplied array
    app.use(fromArray(opts.source));

    let rowCount = 0;
    const keyColumn = opts.config.key && opts.config.columnConfiguration[opts.config.key].columnName;
    app.use((ctx, next) => {
      const subject = baseInstanceIri(!!keyColumn ? cleanCSVValue(ctx.record[keyColumn].value) : "" + rowCount);

      for (const col in ctx.record) {
        if (col === keyColumn) continue;
        if (ctx.record[col] && ctx.record[col].value.length > 0) {
          const colConf = getColumnConfig(col);
          if (!colConf) continue;
          const predicate = colConf.propertyIri ? new NamedNode(colConf.propertyIri) : baseDefIri(cleanCSVValue(col));
          ctx.store.addQuad(subject, predicate, ctx.record[col]);
        }
      }
      ctx.store.addQuad(
        subject,
        ctx.app.prefix["rdf"]("type"),
        typeof opts.config.baseIri === "string" ? new NamedNode(opts.config.resourceClass) : opts.config.baseIri
      );
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
// Disabled export as this is a base template file
// export default applyTransformation;
