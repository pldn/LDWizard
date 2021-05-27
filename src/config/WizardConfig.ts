/**
 * Standalone typings for the LD-Wizard config files
 */
export type PublishElement = "download" | "triplyDB";
export type PrefixEntry = { prefixLabel: string; iri: string };

export type TriplyDbReference = {
  label: string;
  link: string;
};
export type ColumnRefinementType = "single" | "double-column";

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
export type ColumnRefinement = SingleColumnRefinement | DoubleColumnRefinement;
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
}
