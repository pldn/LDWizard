export declare type PublishElement = "download" | "triplyDB";
export declare type PrefixEntry = {
  prefixLabel: string;
  iri: string;
};
export declare type TriplyDbReference = {
  label: string;
  link: string;
};
export interface ColumnRefinement {
  label: string;
  description: string;
  transformation: (value: string) => Promise<string | undefined>;
}
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
}
