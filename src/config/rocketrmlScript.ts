import { ApplyTransformation } from "../Definitions";
import getRmlTransformationScript from "./rmlScript";
import { matrixToCsv } from "../utils/helpers";
import parser from "rocketrml";

/**
 * Different from the other transformation script, as it is also used in the wizard to transform the data.
 */

/**
 * Applies the transformation using RocketRML
 * @param opts
 */
const applyTransformation: ApplyTransformation = async (opts) => {
  console.log('🪵  | file: rocketrmlScript.ts:15 | applyTransformation | opts:', opts)
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
    console.log(123, inputFiles, 456, result)
    return result
  } else {
    throw new Error("Not supported");
  }
};
export default applyTransformation;
