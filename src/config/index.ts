import {
  ApplyTransformation,
  GetClassSuggestions,
  GetPropertySuggestions,
  GetTransformationScript,
  ColumnRefinements,
  ShaclShapeMeta
} from "../Definitions";
import getCowTransformationScript from "./cowScript";
import applyTransformation from "./rocketrmlScript";
import getRmlTransformationScript from "./rmlScript";
import {
  getClassSuggestions as getElasticClassSuggestions,
  getPropertySuggestions as getElasticPropertySuggestions,
} from "./elasticSearch";
import {
  getClassSuggestions as getSparqlClassSuggestions,
  getPropertySuggestions as getSparqlPropertySuggestions,
} from "./sparqlSearch";
import getShaclShapes from "./shaclShapes";
import defaultImage from "./assets/LDWizard.png";
import defaultFavIcon from "./assets/favIcon.svg";
import { PrefixesArray } from "@triply/utils/lib/prefixUtils";
import { AccessLevel as DatasetAccessLevel } from "@triply/utils/lib/Models";
import WizardConfig from "./WizardConfig";
const defaultEndpoint = "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ld-wizard/sdo/services/sparql/sparql";

declare global {
  interface Window {
    wizardConfig: WizardConfig;
  }
}

export type TriplyDbReference = {
  label: string;
  link: string;
};

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
  triplyDbInstances: TriplyDbReference[];
  requireShaclShape: boolean,
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
  refinementOptions: ColumnRefinements;
  exampleCsv: string | undefined;

  newDatasetAccessLevel: DatasetAccessLevel;

  getShaclShapes: (resourceClass?: string) => Promise<ShaclShapeMeta[]>
}
export type PublishElement = "download" | "triplyDB";

const config = window.wizardConfig;

export const wizardAppConfig: WizardAppConfig = {
  /**
   * Branding
   */
  appName: config.appName || "LD-Wizard",
  dataplatformLink: config.dataplatformLink || "https://data.netwerkdigitaalerfgoed.nl/",
  documentationLink: config.documentationLink || "https://github.com/netwerk-digitaal-erfgoed/LDWizard",
  repositoryLink: config.repositoryLink || "https://github.com/netwerk-digitaal-erfgoed/LDWizard-Core",
  primaryColor: config.primaryColor || "#6d1e70",
  secondaryColor: config.secondaryColor || "#a90362",
  brandLogo: config.icon || defaultImage,
  favIcon: config.favIcon || defaultFavIcon,
  homepageMarkdown: config.homepageMarkdown || undefined,
  /** App
   *
   */
  publishOrder: ["download", "triplyDB"],
  triplyDbInstances: config.triplyDbInstances || [],
  defaultBaseIri: config.defaultBaseIri || "https://data.netwerkdigitaalerfgoed.nl/",
  exampleCsv: config.exampleCSV || undefined,

  requireShaclShape: !!config.requireShaclShape,

  /**
   * Search and IRI Processing
   */
  getClassSuggestions: async (term) => {
    const suggestions = await (config.classConfig?.method === "elastic"
    ? getElasticClassSuggestions(term, config.classConfig.endpoint)
    : getSparqlClassSuggestions(term, config.classConfig?.endpoint || defaultEndpoint))

    if (config.requireShaclShape) {
      const allowedIris = (await wizardAppConfig.getShaclShapes()).flatMap(shaclShapeMeta => shaclShapeMeta.targetClasses)
      return suggestions.filter(suggestion => allowedIris.includes(suggestion.iri))
    }

    return suggestions
  },
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
  /**
   * Transformation
   */
  applyTransformation: applyTransformation,
  getTransformationScript: (config, type) => {
    switch (type) {
      case "cow":
        return getCowTransformationScript(config);
      case "rml":
        return getRmlTransformationScript(config);
      default:
        throw new Error(`Script ${type} has not been implemented yet`);
    }
  },
  /**
   * RefinementOptions
   */
  refinementOptions: config.columnRefinements || [],

  newDatasetAccessLevel: config.newDatasetAccessLevel || "private",

  getShaclShapes: async (resourceClass?: string) => {
    const shaclShapeMetas = await getShaclShapes(config.shaclShapes ?? [])

    const filteredShaclShapeMetas = shaclShapeMetas
      .filter(shaclShapeMeta => resourceClass ? shaclShapeMeta.targetClasses.includes(resourceClass) : true)

    return filteredShaclShapeMetas
  }
};

export default wizardAppConfig;
