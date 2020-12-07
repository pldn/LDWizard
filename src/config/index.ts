import {
  ApplyTransformation,
  GetClassSuggestions,
  GetPropertySuggestions,
  GetTransformationScript,
} from "../Definitions";
import getRattTransformationScript from "../utils/ratt/getTransformation";
import getCowTransformationScript from "./cowScript";
import applyTransformation from "./rattScript";
import getRmlTransformationScript from "./rmlScript";
import {
  getClassSuggestions as getElasticClassSuggestions,
  getPropertySuggestions as getElasticPropertySuggestions,
} from "./elasticSearch";
import {
  getClassSuggestions as getSparqlClassSuggestions,
  getPropertySuggestions as getSparqlPropertySuggestions,
} from "./sparqlSearch";
import config from "./wizardConfigDefaults";
import defaultImage from "./assets/LDWizard.png";
import defaultFavIcon from "./assets/favIcon.svg";
import { PrefixesArray } from "@triply/utils/lib/prefixUtils";
const defaultEndpoint = "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ld-wizard/sdo/services/sparql/sparql";

export interface WizardAppConfig {
  /**
   * Branding
   */
  primaryColor: string;
  secondaryColor: string;
  brandLogo: string;
  appName: string;
  favIcon: string;
  documentationLink: string;
  repositoryLink: string;
  dataplatformLink: string;
  homepageMarkdown: string | undefined;
  /**
   * App functions
   */
  defaultBaseIri: string;
  getPrefixes: () => Promise<PrefixesArray>;
  publishOrder: PublishElement[];
  getClassSuggestions: GetClassSuggestions;
  getPropertySuggestions: GetPropertySuggestions;
  getTransformationScript: GetTransformationScript;
  applyTransformation: ApplyTransformation;
}
export type PublishElement = "download" | "triplyDB";

export const wizardAppConfig: WizardAppConfig = {
  /**
   * Branding
   */
  appName: config.appName || "LD-Wizard",
  dataplatformLink: config.dataplatformLink || "https://triplydb.com/",
  documentationLink: config.documentationLink || "https://github.com/netwerk-digitaal-erfgoed/LDWizard",
  repositoryLink: config.repositoryLink || "https://github.com/netwerk-digitaal-erfgoed/LDWizard-HelloWorld",
  primaryColor: config.primaryColor || "#6d1e70",
  secondaryColor: config.secondaryColor || "#a90362",
  brandLogo: config.icon || defaultImage,
  favIcon: config.favIcon || defaultFavIcon,
  homepageMarkdown: config.homepageContent || undefined,
  /** App
   *
   */
  publishOrder: ["download", "triplyDB"],
  defaultBaseIri: config.defaultBaseIri || "https://ldwizard.triply.cc/",

  /**
   * Search and IRI Processing
   */
  /**
   * Transformation
   */
  applyTransformation: applyTransformation,
  getClassSuggestions: (term) =>
    config.classConfig?.method === "elastic"
      ? getElasticClassSuggestions(term, config.classConfig.endpoint)
      : getSparqlClassSuggestions(term, config.classConfig?.endpoint || defaultEndpoint),
  getPropertySuggestions: (term) =>
    config.predicateConfig?.method === "elastic"
      ? getElasticPropertySuggestions(term, config.predicateConfig.endpoint)
      : getSparqlPropertySuggestions(term, config.predicateConfig?.endpoint || defaultEndpoint),
  getPrefixes:
    config.getAllowedPrefixes ||
    (async () => [
      {
        iri: "https://schema.org/",
        prefixLabel: "schema",
      },
    ]),
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

export default wizardAppConfig;
