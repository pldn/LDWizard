# Configuring

In this document you can find all necessary guidance to create your own LD Wizard application.

We encourage new users who are working in other domains to create new LDWizard variants that can be used to create and publish linked data more easily using e.g. the vocabularies that are relevant for their domain. Working this way we expect that a large family of LDWizard applications can evolve towards the future (and create and publish more and more linkable and reusable linked data that can be seamlessly used in new, innovative end user applications).

## 1. Configuring your own LDWizard

You can create your own LD Wizard application by following these steps:

1. Install [Node.js](https://nodejs.org) and [Yarn](https://yarnpkg.com). The Node.js has [a page how to install Node using a package manager](https://nodejs.org/en/download/package-manager/). Once you have installed Node.js, use the npm package manager that comes bundled with Node.js to install Yarn, the package manager for LDWizard:

   ```bash
   npm install --global yarn
   ```

2. Create a directory for your application:

   ```sh
   mkdir my-wizard
   cd my-wizard
   ```

3. Start a typescript project:

   ```sh
   yarn init
   yarn add typescript http-server --dev
   yarn tsc --init
   ```

   The `tsconfig.json` file should have the following contents:

      ```json
      {
         "compilerOptions": {
            "target": "ES2020",
            "module": "nodenext",
            "moduleResolution": "nodenext",
            "lib": ["ES2020", "DOM", "DOM.Iterable"],
            "useDefineForClassFields": false,
            "experimentalDecorators": true,
            "composite": false,
            "allowImportingTsExtensions": true,
            "declaration": false,
            "strict": false,
            "noEmit": true,
            "noImplicitAny": false,
            "noImplicitThis": false,
            "noUnusedLocals": false,
            "skipLibCheck": true
         }
      }
      ```

   Add the following to the `package.json` file:

      ```json
      {  //... rest of package.json
         "scripts": {
            "build": "ldwizard-build ./src/config.ts",
            "start": "yarn build && http-server -c-1 ./lib"
         }
      }

      ```

4. Create a `.yarnrc` file with:

   ```yarnrc
   --ignore-engines true
   ```

5. Add the LD Wizard dependency:

   ```sh
   yarn add @pldn/ldwizard
   ```

6. Create a configuration file called `config.ts` in the `./src` directory and enter the following content:
   * 6.1. Run the command:

      `mkdir src`

   * 6.2. Create the [`config.ts`](https://github.com/pldn/LDWizard/blob/main/webpack/runtimeConfig.ts) file in the created `src` directory with the contents:

      ```ts
      // This is a template file
      import WizardConfig from "@pldn/ldwizard/types/WizardConfig";
      const wizardConfig: WizardConfig = {
         // Your custom configuration comes here - see 1b. Configuration options mentioned below
      };
      export default globalThis.wizardConfig = wizardConfig;
      ```

7. Run the following command to build your application:

   ```sh
   yarn build
   ```

Your LD Wizard application can now be found inside the `lib/` directory.

### 1a. Run locally

You can upload your LD Wizard application to an online location and use it there. But you can also run the application locally by starting an HTTP server. If you do not yet have an HTTP server installed, run the following command:

```sh
yarn add --dev http-server
```

With this particular HTTP server the LDWizard can be started in the following way:

```sh
yarn http-server ./lib
```

Open <http://localhost:8080> in a web browser.

To build your app and start it in one command, use:

```bash
yarn start
```

### 1b. Configuration options

You can customize your LD Wizard application by adding the following configuration options to your configuration file (`config.ts`).

| setting                 | type                                                 | default                                                                                                                                 | description                                                                                                                                                |
| ----------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `appName`               | `string`                                             | LD Wizard                                                                                                                               | The name of the LD Wizard instance.                                                                                                                        |
| `icon`                  | `string`                                             | <img src="https://github.com/pldn/LDWizard/blob/main/src/config/assets/LDWizard.png?raw=true" height="50">             | The icon that is used inside the application.                                                                                                              |
| `favIcon`               | `string`                                             | <img src="https://github.com/pldn/LDWizard/blob/main/src/config/assets/favIcon.svg?raw=true" height="50">              | The icon that is used as the 'favicon'. This icon commonly appears in web browser tabs.                                                                    |
| `primaryColor`          | `string`                                             | #6d1e70 <svg height="20" viewBox="0 -10 20 30" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" fill="#6d1e70" r="10"/></svg> | The primary color that is used in the application.                                                                                                         |
| `secondaryColor`        | `string`                                             | #a90362 <svg height="20" viewBox="0 -10 20 30" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" fill="#a90362" r="10"/></svg> | The secondary color that is used in the application.                                                                                                       |
| `homepageMarkdown`      | `string`                                             | `undefined`                                                                                                                             | Optional name of a Markdown file that acts as the homepage for the LD Wizard application.                                                                  |
| `defaultBaseIri`        | `string`                                             | <https://data.pldn.nl/>                                                                                               | The default base IRI that is used for linked data transformations.                                                                                         |
| `classConfig`           | `{method: "elastic" \| "sparql"; endpoint: string;}` | `{method:"sparql"; endpoint: "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ld-wizard/sdo/services/sparql/sparql"}`               | The service that is used for giving class suggestions.                                                                                                     |
| `predicateConfig`       | `{method: "elastic" \| "sparql"; endpoint: string;}` | `{method:"sparql"; endpoint: "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ld-wizard/sdo/services/sparql/sparql"}`               | The service that is used for giving property suggestions.                                                                                                  |
| `getAllowedPrefixes`    | `() => Promise<{prefixLabel:string; iri:string}[]>`  | `() => []`                                                                                                                              | A function that is used to return prefix declarations.                                                                                                     |
| `publishOrder`          | `("download" \| "triplydb")[]`                       | `["download","triplydb"]`                                                                                                               | The order in which publishing options are shown in the 'publish' step. It is also possible to exclude publication options by removing them from this list. |
| `dataplatformLink`      | `string`                                             | <https://data.pldn.nl>                                                                                                | Link to the data platform that is used in the footer. This data platform is also used for creating API tokens during the 'publish' step.                   |
| `documentationLink`     | `string`                                             | <https://github.com/pldn/LDWizard>                                                                                  | Link to the generic LD Wizard project documentation.                                                                                                                     |
| `repositoryLink`        | `string`                                             |  <https://github.com/pldn/LDWizard>                                                                             | Link to the specific LD Wizard repository implementation/configuration.                                                                                                              |
| `newDatasetAccessLevel` | `"public" \| "internal" \| "private"`                | `"private"`                                                                                                                             | The access level to use for new datasets.                                                                                                                   |

### 1c. Building your own Docker container

You can create a Docker container for your LD Wizard application by running the following command (this assumes that you have a LDWizard configuration file called `./config.ts` in the root of this repository):

```sh
docker build -f ./docker/Dockerfile -t "my-tag" --build-arg CONFIG_FILE=config.ts .
```

This container includes the LDWizard web assets (images, javascript and css), hosted via NGINX on port 80.

## 2. Explanation of backend services

LD Wizard runs entirely within the web browser, making it a client-side application. In order to give the user sugesstions about their data, LD Wizard sends/reveives requests to/from external linked data services. This section describes some of the external services that can be used by LD Wizard.

### 2a. Suggestions with SPARQL

When `classConfig` and/or `predicateConfig` are set to `sparql`, LD Wizard uses one or two SPARQL endpoints to retrieve suggestions for classes and properties, respectively. The SPARQL queries that are used can be found [in the LD Wizard repository](https://github.com/pldn/LDWizard/blob/main/src/config/sparqlSearch.ts).

These queries support class and property descriptions that follow linked data standards and best practices:

- Use [`owl:Class`](https://triplydb.com/w3c/owl/browser?resource=http%3A%2F%2Fwww.w3.org%2F2002%2F07%2Fowl%23Class) or [`rdfs:Class`](https://triplydb.com/w3c/rdfs/browser?resource=http%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23Class) to declare that something is a class.
- Use [`owl:DatatypeProperty`](https://triplydb.com/w3c/owl/browser?resource=http%3A%2F%2Fwww.w3.org%2F2002%2F07%2Fowl%23DatatypeProperty), [`owl:ObjectProperty`](https://triplydb.com/w3c/owl/browser?resource=http%3A%2F%2Fwww.w3.org%2F2002%2F07%2Fowl%23ObjectProperty), or [`rdf:Property`](https://triplydb.com/w3c/rdf/browser?resource=http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23Property) to declare that something is a property.
- Use [`rdfs:label`](https://triplydb.com/w3c/rdfs/browser?resource=http%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23label) for human-readable labels.
- Use [`rdfs:comment`](https://triplydb.com/w3c/rdfs/browser?resource=http%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23comment) for human-readable descriptions.

### 2b. Suggestions with ElasticSearch

When `classConfig` and/or `preficateConfig` are set to `elastic`, LD Wizard uses generic ElasticSearch text queries to retrieve suggestions for classes and properties. The ElasticSearch queries that are used can be found [in the LD Wizard Core repository](https://github.com/pldn/LDWizard/blob/main/src/config/elasticSearch.ts).

These queries support class and property descriptions that follow linked data standards and best practices. See [Section 3a](#3a-suggestions-with-sparql) for details.

In order to create an ElasticSearch service that can be queried in this way, your linked dataset must be indexed as a collection of JSON files. The most standards-compatible way of doing this is to create one [JSON-LD](https://www.w3.org/TR/json-ld11/) file per non-trivial node. A JSON-LD file contains the [Concise Bounded Description (CBD)](https://www.w3.org/Submission/CBD/) for a particular node. Trivial nodes are nodes that are already included in the CBD (e.g., blank nodes). These trivial nodes should not be indexed separately.

### 2c. IRI prefix completion

There is not currently a strandard way of exposing IRI prefixes in RDF. However, there is [an initiative](https://github.com/w3c/sparql-12/issues/134) to potentially add this feature to a future version of SPARQL.

In the meantime, programmers can configure `getAllowedPrefixes` to anything that returns a list of IRI prefix objects. The following example does this for the TriplyDB backend:

```typescript
getAllowedPrefixes: async () => {
  const response = await fetch("https://api.data.netwerkdigitaalerfgoed.nl/datasets/ld-wizard/sdo/prefixes");
  if (response.ok) {
    const prefixes: PrefixEntry[] = await response.json();
    return prefixes;
  }
};
```

### Column enrichment & SHACL Shape Validation

You can define functions the LDWizard users can use to refine the values in a column. You can define those functions with the wizard config:

```typescript
const wizardConfig: WizardConfig = {
  appName: "LDWizard - example",
  defaultBaseIri: "https://w3id.org/my-wizard/",
  primaryColor: "#4caf50", // green
  secondaryColor: "#1565c0", // blue
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
};
export default globalThis.wizardConfig = wizardConfig
```
