/**
 * This file is a placeHolder to be used during development. The LDWizard-build script will replace the config file
 */
//@ts-ignore
import WizardConfig from "../src/config/WizardConfig.js";
//@ts-ignore
import exampleCSV from "../src/config/assets/example.csv";

// Turn this to "true" to enable this configuration (for development purposes)
const useRuntimeConfigFile = true;

let wizardConfig: WizardConfig;

// NOTE: Example of detailed LDWizard config with column refinements
let runtimeConfig: WizardConfig = {
  appName: "LDWizard - example",
  defaultBaseIri: "https://w3id.org/my-wizard/",
  primaryColor: "#4caf50", // green
  secondaryColor: "#1565c0", // blue
  exampleCSV,
  columnRefinements: [
    {
      label: "Convert lang ISO to Lexvo URIs",
      type: "single",
      description:
        "This transformation will take lang ISO (e.g. fr or fra) and convert it to a Lexvo URI: http://lexvo.org/id/iso639-3/eng",
      transformation: async (searchTerm: string) => {
        // const sources = ["http://vocab.getty.edu/aat/sparql"];
        // return getUriOfSearchTerm(sources, searchTerm);
        if (searchTerm.length == 3) {
          return `http://lexvo.org/id/iso639-3/${searchTerm}`;
        }
        if (searchTerm.length == 2) {
          return `http://lexvo.org/id/iso639-1/${searchTerm}`;
        }
        return searchTerm;
      },
    },
    {
      label: "Example: return IRI from input",
      type: "single",
      description: "In this transformation the returned value is the original IRI",
      transformation: async (term: string) => {
        return `${term}`;
      },
      yieldsIri: true
    },
    {
      label: "Example: return value as literal",
      type: "single",
      description: "In this transformation the returned value is turned into a literal",
      transformation: async (term: string) => {
        return `${term}`;
      },
      yieldsLiteral: true
    },
    {
      label: "Example keepOriginalValue option: owl:sameAs",
      type: "single",
      description:
        "In this transformation the original value is kept with the transformed value (creates OWL:sameAs predicate)",
      transformation: async (term: string) => {
        return `${term}-copy`;
      },
      keepOriginalValue: {
        keepValue: true
      },
    },
    {
      label: "Example keepOriginalValue option: custom predicate IRI",
      type: "single",
      description:
        "In this transformation the original value is kept with the transformed value (creates custom predicate)",
      transformation: async (term: string) => {
        return `${term}-copy`;
      },
      keepOriginalValue: {
        keepValue: true,
        customPredicateIRI: "https://myCustomPredicate.org"
      },
    },
  ],
  requireShaclShape: true,
  shaclShapes: [{
      url: '/Person.ttl',
      targetShape: 'http://pldn.nl/ldwizard/Philosopher'
  }]
};

useRuntimeConfigFile ? (wizardConfig = runtimeConfig) : (wizardConfig = {});

export default globalThis.wizardConfig = wizardConfig;
