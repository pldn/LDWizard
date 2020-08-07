import { TransformationScript, TransformationConfiguration } from "Definitions";
import transformScript from "./applyTransformation.txt";

async function getRattTransformationScript(configuration: TransformationConfiguration): Promise<TransformationScript> {
  // TODO: Actually use the transformation
  return transformScript;
}

export default getRattTransformationScript;
