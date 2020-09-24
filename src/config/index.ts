import { GetTransformationScript, ApplyTransformation } from "Definitions";
import getRattTransformationScript from "utils/ratt/getTransformation";
import getCowTransformationScript from "./cowScript";
import applyTransformation from "./rattScript";
import getRmlTransformationScript from "./rmlScript";

export interface WizardConfig {
  applyTransformation: ApplyTransformation;
  defaultBaseIri: string;
  publishOrder: PublishElement[];
  getTransformationScript: GetTransformationScript;
}
export type PublishElement = "download" | "triplyDB";

export const wizardConfig: WizardConfig = {
  applyTransformation: applyTransformation,
  defaultBaseIri: "https://ldwizard.triply.cc/",
  publishOrder: ["triplyDB"],
  getTransformationScript: (config, type) => {
    switch (type) {
      case "cow":
        return getCowTransformationScript(config);
      case "ratt":
        return getRattTransformationScript(config);
      case "rml":
        return getRmlTransformationScript(config);
      default:
        throw new Error(`Script ${type} has not been implemented yet`);
    }
  },
};
