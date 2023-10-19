import { ApplyTransformation } from "../Definitions.ts";
import getRmlTransformationScript from "./rmlScript.ts";
import { matrixToCsv } from "../utils/helpers.ts";
import parser from "rocketrml";
import lodash from "lodash";

/**
 * Different from the other transformation script, as it is also used in the wizard to transform the data.
 */

/**
 * Applies the transformation using RocketRML
 * @param opts
 */
const applyTransformation: ApplyTransformation = async (opts) => {
  if (opts.type === "rml" && Array.isArray(opts.source)) {
    const rmlMappings = await getRmlTransformationScript(opts.config);
    // Since RML does not allow us to add row numbers in the mapping file, we temporarily add rowNumbers to the csv Matrix
    const sourceData = lodash.cloneDeep(opts.source);
    for (let index = 0; index < sourceData.length; index++) {
      const element = sourceData[index];
      if (index > 0) {
        element.unshift(index.toString());
      } else {
        element.unshift("_rowNumber");
      }
    }
    const inputFiles = {
      [opts.config.sourceFileName]: matrixToCsv(sourceData),
    };
    const options = {
      toRDF: true,
      verbose: false,
      xmlPerformanceMode: false,
      replace: false,
    };
    const result = await parser.parseFileLive(rmlMappings.toString(), inputFiles, options).catch((err) => {
      console.error(err);
      throw(err)
    });
    return result;
  } else {
    throw new Error("Not supported");
  }
};
export default applyTransformation;
