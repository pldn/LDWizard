import { ApplyTransformation } from "../Definitions";
import getRmlTransformationScript from "./rmlScript";
import { matrixToCsv } from "../utils/helpers";
import parser from "rocketrml";

/**
 * Different from the other transformation script, as it is also used in the wizard to transform the data.
 * See `/src/utils/ratt/getTransformation.ts` to get the transformation script itself
 * When making changes to this file make sure to copy the result to `/src/utils/ratt/applyTransformation.txt`
 */

/**
 * Applies the transformation using RATT
 * @param opts
 */
const applyTransformation: ApplyTransformation = async (opts) => {
  if (opts.type === "rml" && Array.isArray(opts.source)) {
    // Use RocketRML to generate RDF from RML mappings
    const rmlMappings = await getRmlTransformationScript(opts.config)
    const inputFiles={
      [opts.config.sourceFileName]: matrixToCsv(opts.source),
    };
    const options = {
      toRDF: true,
      verbose: true,
      xmlPerformanceMode: false,
      replace: false,
      // xpathLib: "fontoxpath",
    };
    const result = await parser.parseFileLive(rmlMappings.toString(), inputFiles, options).catch((err) => { console.log(err); });
    return result
  } else {
    throw new Error("Not supported");
  }
};
export default applyTransformation;
