export declare type PublishElement = "download" | "triplyDB";
export declare type PrefixEntry = {
  prefixLabel: string;
  iri: string;
};
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
  getAllowedPrefixes?: () => Promise<PrefixEntry[]>;
}
