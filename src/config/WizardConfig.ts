/**
 * Standalone typings for the LD-Wizard config files
 */
export type PublishElement = "download" | "triplyDB";
export type PrefixEntry = { prefixLabel: string; iri: string };

export type TriplyDbReference = {
  label: string;
  link: string;
};
export type ColumnRefinementType = "single" | "double-column" | "single-param";

export interface BaseColumnRefinement {
  label: string;
  description: string;
  type: ColumnRefinementType;
  transformation: unknown;
}
export interface SingleColumnRefinement extends BaseColumnRefinement {
  type: "single";
  transformation: (value: string) => Promise<string | undefined>;
}
export interface DoubleColumnRefinement extends BaseColumnRefinement {
  type: "double-column";
  transformation: (firstColumn: string, selectedColumn: string) => Promise<string | undefined>;
}
export interface SingleColumnParamRefinement extends BaseColumnRefinement {
  type: "single-param";
  transformation: (value: string, iriPrefix: string) => Promise<string | undefined>;
}
export type ColumnRefinement = SingleColumnRefinement | DoubleColumnRefinement | SingleColumnParamRefinement;
export type ShaclShapeSetting = {
  url: string,
  targetShape?: string
};
export default interface WizardConfig {
  /**
   * Branding
   */
  appName?: string;
  dataplatformLink?: string;
  documentationLink?: string;
  repositoryLink?: string;
  primaryColor?: string;
  secondaryColor?: string;
  icon?: string;
  favIcon?: string;
  homepageMarkdown?: string;
  /**
   * App settings
   */
  defaultBaseIri?: string;
  publishOrder?: PublishElement[];
  /**
   * Helper Settings
   */
  predicateConfig?: {
    method: "elastic" | "sparql";
    endpoint: string;
  };
  classConfig?: {
    method: "elastic" | "sparql";
    endpoint: string;
  };
  triplyDbInstances?: TriplyDbReference[];
  getAllowedPrefixes?: () => Promise<PrefixEntry[]>;
  /**
   * Refinement options
   */
  columnRefinements?: ColumnRefinement[];
  exampleCSV?: string;

  newDatasetAccessLevel?: "private" | "internal" | "public";

  shaclShapes?: ShaclShapeSetting[]
}
