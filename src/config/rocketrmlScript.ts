import { ApplyTransformation } from "../Definitions.ts";
import getRmlTransformationScript from "./rmlScript.ts";
import { matrixToCsv } from "../utils/helpers.ts";
import parser from "rocketrml";
import lodash from "lodash";
import { Parser, Writer } from "n3";

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
    let result = await parser.parseFileLive(rmlMappings.toString(), inputFiles, options).catch((err) => { console.log(err); });
    // Convert ntriples to turtle
    const rdfParser = new Parser();
    const prefixes = {
      '': opts.config.baseIri,
      ldwid: opts.config.baseIri + "id/",
      ldwdef: opts.config.baseIri + "def/",
      ...opts.prefixes.reduce((obj, item) => {
        obj[item.prefixLabel] = item.iri;
        return obj
      }, {} as Record<string, string>)
    }
    const quads = rdfParser.parse(result, null, (prefix, namespace) => {
      prefixes[prefix] = namespace['id']
    })
    const serializer = new Writer({ format: 'Turtle', prefixes: prefixes });
    serializer.addQuads(quads);
    serializer.end((error, turtleData) => {
      // This block runs synchronously and populates the result variable
      if (!error) {
        result = turtleData
      }
    });
    return result
  } else {
    throw new Error("Not supported");
  }
};
export default applyTransformation;
