import Ratt from "@triply/ratt";
import toNtriplesString from "../utils/ratt/middlewares/toNtriplesString";
import { ApplyTransformation } from "../Definitions";
import { cleanCsvValue, getBaseIdentifierIri, getBasePredicateIri } from "../utils/helpers";
import fromArray from "../utils/ratt/middlewares/fromArray";
import { NamedNode } from "n3";
import * as RDF from "rdf-js";
/**
 * Different from the other transformation script, as it is also used in the wizard to transform the data. See `/src/utils/ratt/getTransformation.ts` to get the transformation script itself
 * When making changes to this file make sure to copy the result to `/src/utils/ratt/applyTransformation.txt`
 */

/**
 * Applies the transformation using RATT
 * @param opts
 */
const applyTransformation: ApplyTransformation = async (opts) => {
  if (opts.type === "ratt" && Array.isArray(opts.source)) {
    const app = new Ratt({
      defaultGraph: "",
      prefixes: {
        baseDefIri: Ratt.prefixer(getBasePredicateIri(opts.config.baseIri.toString())),
        baseInstanceIri: Ratt.prefixer(getBaseIdentifierIri(opts.config.baseIri.toString())),
      },
    });

    const getColumnConfig = (colName: string) =>
      opts.config.columnConfiguration.find((col) => col.columnName === colName);

    app.use(fromArray(opts.source));

    const keyColumn =
      typeof opts.config.key === "number" &&
      opts.config.key >= 0 &&
      opts.config.columnConfiguration[opts.config.key].columnName;
    app.use((ctx, next) => {
      const keyVal = keyColumn && ctx.record[keyColumn] ? ctx.record[keyColumn] : ctx.recordId;
      const subject = app.prefix.baseInstanceIri(keyVal ? cleanCsvValue(keyVal) : "" + ctx.recordId);

      for (const [col, value] of Object.entries(ctx.record)) {
        if (col === keyColumn) continue;
        if (ctx.record[col] && typeof value === "string") {
          const colConf = getColumnConfig(col);
          if (!colConf) continue;
          const predicate = colConf.propertyIri
            ? ctx.store.iri(colConf.propertyIri)
            : app.prefix.baseDefIri(cleanCsvValue(col));
          let object: NamedNode | RDF.Literal;
          try {
            object = ctx.store.literal(ctx.record[col]);
          } catch (e) {
            // Create a nicely formatted error letting the user know that his CSV has empty values
            if ((e as any)?.expected === "non-empty-string") {
              continue;
            }
            throw e;
          }
          if (colConf.columnRefinement?.type === "to-iri") {
            object = ctx.store.iri(`${colConf.columnRefinement.data.iriPrefix}${cleanCsvValue(value)}`);
          } else if (colConf.columnRefinement !== undefined) {
            if (ctx.record[col + "-refined"] === undefined || ctx.record[col + "-refined"] === "") continue;
            object = ctx.store.iri(ctx.record[col + "-refined"]);
          }

          ctx.store.addQuad(subject, predicate, object);
        }
      }
      ctx.store.addQuad(
        subject,
        app.prefix.rdf("type"),
        typeof opts.config.baseIri === "string" ? ctx.store.iri(opts.config.resourceClass) : opts.config.baseIri
      );
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
