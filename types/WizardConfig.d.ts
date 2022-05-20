export declare type PublishElement = "download" | "triplyDB";
export declare type PrefixEntry = {
  prefixLabel: string;
  iri: string;
};
export declare type TriplyDbReference = {
  label: string;
  link: string;
};
export declare type ColumnRefinementType = "single" | "double-column";
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
export declare type ColumnRefinement = SingleColumnRefinement | DoubleColumnRefinement;
export default interface WizardConfig {
  appName?: string;
  dataplatformLink?: string;
  documentationLink?: string;
  repositoryLink?: string;
  primaryColor?: string;
  secondaryColor?: string;
  icon?: string;
  favIcon?: string;
  homepageMarkdown?: string;
  defaultBaseIri?: string;
  publishOrder?: PublishElement[];
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
  columnRefinements?: ColumnRefinement[];
  exampleCSV?: string;
  newDatasetAccessLevel?: "private" | "internal" | "public";
}
