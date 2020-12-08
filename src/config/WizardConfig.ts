/**
 * Standalone typings for the LD-Wizard config files
 */
export type PublishElement = "download" | "triplyDB";
export type PrefixEntry = { prefixLabel: string; iri: string };
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
  getAllowedPrefixes?: () => Promise<PrefixEntry[]>;
}
