import { ApplyTransformation } from "../Definitions.ts";
import getRmlTransformationScript from "./rmlScript.ts";
import { matrixToCsv } from "../utils/helpers.ts";
import parser from "rocketrml";

/**
 * Different from the other transformation script, as it is also used in the wizard to transform the data.
 */

/**
 * Applies the transformation using RocketRML
 * @param opts
 */
const applyTransformation: ApplyTransformation = async (opts) => {
  if (opts.type === "rml" && Array.isArray(opts.source)) {
    const rmlMappings = await getRmlTransformationScript(opts.config)
    const inputFiles={
      [opts.config.sourceFileName]: matrixToCsv(opts.source),
    };
    const options = {
      toRDF: true,
      verbose: false,
      xmlPerformanceMode: false,
      replace: false,
    };
    const result = await parser.parseFileLive(rmlMappings.toString(), inputFiles, options).catch((err) => { console.log(err); });
    return result
  } else {
    throw new Error("Not supported");
  }
};
export default applyTransformation;
