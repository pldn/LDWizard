/**
 * This file is a placeHolder to be used during development. The LDWizard-build script will replace the config file
 * It uses a detailed LDWizard config with column refinments and using the LOV to propose classes and predicates
 */
//ts-ignores needed due to differing ts-configs in webpack vs src directory
//@ts-ignore
import WizardConfig from "../src/config/WizardConfig.js";
//@ts-ignore
import exampleCSV from "../src/config/assets/example.csv";
//@ts-ignore
import shapeFile from "../public/Person.ttl";
//@ts-ignore
import bulkSparql from "../src/utils/bulkSparql.js";
import { DataFactory } from "n3";

// Turn this to "true" to enable this configuration (for development purposes)
const useRuntimeConfigFile = false;

let wizardConfig: WizardConfig;

// NOTE: Example of detailed LDWizard config with column refinements
let runtimeConfig: WizardConfig = {
  appName: "LDWizard - example",
  defaultBaseIri: "https://w3id.org/my-wizard/",
  primaryColor: "#4caf50", // green
  secondaryColor: "#1565c0", // blue
  exampleCSV,

  homepageMarkdown: `Example LDWizard for development, a tool to easily map CSV to RDF.`,
  publishOrder: [ "download" as const ],
  newDatasetAccessLevel: "internal" as const,
  repositoryLink: "https://github.com/pldn/LDWizard",
  documentationLink: "https://github.com/pldn/LDWizard/blob/main/CONFIGURING.md",
  dataplatformLink: "https://lov.linkeddata.es/dataset/lov/sparql",

  classConfig: {
      method: "sparql" as const,
      endpoint: "https://lov.linkeddata.es/dataset/lov/sparql"
  },
  predicateConfig: {
      method:"sparql" as const,
      endpoint: "https://lov.linkeddata.es/dataset/lov/sparql"
  },

  columnRefinements: [
    {
      label: "Use bulk processing: add '-processed-in-bulk' at the end of literal",
      type: "single",
      description: "This transformation uses bulk processing",
      batchSize: 10,
      bulkTransformation: async (columnValues: string[]) => {
        const results: string[] = [];
        for (const value of columnValues) {
          results.push(`${value}-processed-in-bulk`);
        }
        return results;
      },
      yieldsLiteral: true,
      keepOriginalValue: {
        keepValue: true,
        keepAsLiteral: true,
        customPredicateIRI: "https://www.exampleBulk.com"
      }
    },
    {
      label: "Use bulk processing: SPARQL bulk refinement for street names",
      type: "single",
      description: "This transformation uses bulk processing",
      bulkTransformation: async (columnValues: string[]) => {
        const rq = `
prefix skos: <http://www.w3.org/2004/02/skos/core#>
prefix sor: <https://data.kkg.kadaster.nl/sor/model/def/>
select ?transformed ?obj where {
  ?transformed skos:prefLabel ?obj; a sor:OpenbareRuimte
  filter(sameTerm(?obj, ?searchValue))
}
`;
        const sparqlEndpoint = "https://api.labs.kadaster.nl/datasets/dst/kkg/services/default/sparql";
        const transformer = (value: string) => DataFactory.literal(value, "nl");
        return bulkSparql(rq, columnValues, { sparqlEndpoint, transformer });
      },
      yieldsIri: true
    },
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
      label: "Example: return base IRI + value",
      type: "single",
      description: "In this transformation the returned value is the base IRI + value from CSV file",
      transformation: async (term: string) => {
        return `${term}`;
      },
    },
    {
      label: "Example: expect to return IRI in transformation",
      type: "single",
      description:
        "In this transformation the returned value should be an IRI, this can be applied to the 'IRIs' column in the example.csv file",
      transformation: async (term: string) => {
        return `${term}`;
      },
      yieldsIri: true,
    },
    {
      label: "Example: expect to return literal in transformation",
      type: "single",
      description: "In this transformation the returned value should be a literal",
      transformation: async (term: string) => {
        return `${term}`;
      },
      yieldsLiteral: true,
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
        keepValue: true,
        owlSameAsRelationship:true
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
        customPredicateIRI: "https://myCustomPredicate.org",
      },
    },
  ],
  requireShaclShape: true,
  shaclShapes: [
    {
      url: shapeFile,
      targetShape: "http://pldn.nl/ldwizard/Philosopher",
    },
  ],


  getAllowedPrefixes: async () => {
    return [
      {
          "prefixLabel": "dc",
          "iri": "http://purl.org/dc/elements/1.1/"
      },
      {
          "prefixLabel": "dcat",
          "iri": "http://www.w3.org/ns/dcat#"
      },
      {
          "prefixLabel": "dct",
          "iri": "http://purl.org/dc/terms/"
      },
      {
          "prefixLabel": "foaf",
          "iri": "http://xmlns.com/foaf/0.1/"
      },
      {
          "prefixLabel": "owl",
          "iri": "http://www.w3.org/2002/07/owl#"
      },
      {
          "prefixLabel": "prov",
          "iri": "http://www.w3.org/ns/prov#"
      },
      {
          "prefixLabel": "pav",
          "iri": "http://purl.org/pav/"
      },
      {
          "prefixLabel": "rdf",
          "iri": "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
      },
      {
          "prefixLabel": "rdfa",
          "iri": "http://www.w3.org/ns/rdfa#"
      },
      {
          "prefixLabel": "rdfs",
          "iri": "http://www.w3.org/2000/01/rdf-schema#"
      },
      {
          "prefixLabel": "schema",
          "iri": "https://schema.org/"
      },
      {
          "prefixLabel": "skos",
          "iri": "http://www.w3.org/2004/02/skos/core#"
      },
      {
          "prefixLabel": "void",
          "iri": "http://rdfs.org/ns/void#"
      },
      {
          "prefixLabel": "xsd",
          "iri": "http://www.w3.org/2001/XMLSchema#"
      },
    ]
  },
};

useRuntimeConfigFile ? (wizardConfig = runtimeConfig) : (wizardConfig = {});

export default globalThis.wizardConfig = wizardConfig;