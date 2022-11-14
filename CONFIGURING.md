# Configuring

In this document you can find all necessary guidance to create your own LD Wizard application.

We encourage new users who are working in other domains to create new LDWizard variants that can be used to create and publish linked data more easily using e.g. the vocabularies that are relevant for their domain. Working this way we expect that a large family of LDWizard applications can evolve towards the future (and create and publish more and more linkable and reusable linked data that can be seamlessly used in new, innovative end user applications).

## 1. Configuring your own LDWizard

You can create your own LD Wizard application by following these steps:

1. Install [Node.js](https://nodejs.org) and [Yarn](https://yarnpkg.com).

   On Ubuntu this is done with the following commands. Check the project
   websites for installation on other operating systems.

   ```sh
   curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
   echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
   sudo apt update
   sudo apt install nodejs yarn
   ```

2. Create a directory for your application:

   ```sh
   mkdir my-wizard
   cd my-wizard
   ```

3. Create a `.yarnrc` file

   ```yarnrc
   --ignore-engines true
   ```

4. Add the LD Wizard dependency:

   ```sh
   yarn add @pldn/ldwizard
   ```

5. Create a configuration file called `config.ts` and enter the following content:

   ```ts
   // This is a template file
   import WizardConfig from "@pldn/ldwizard/types/WizardConfig";
   const wizardConfig: WizardConfig = {};

   window.config = wizardConfig;
   ```

6. Run the following command to build your application:

   ```sh
   yarn exec ldwizard-build config.ts
   ```

Your LD Wizard application can now be found inside the `lib/` directory.

### 1a. Run locally

You can upload your LD Wizard application to an online location and use it there. But you can also run the application locally by starting an HTTP server. If you do not yet have an HTTP server installed, run the following command:

```sh
npm install -g http-server
```

With this particular HTTP server the LDWizard can be started in the following way:

```sh
cd lib
http-server .
```

Open <http://localhost:8080> in a web browser.

### 1b. Configuration options

You can customize your LD Wizard application by adding the following configuration options to your configuration file (`config.ts`).

| setting                 | type                                                 | default                                                                                                                                 | description                                                                                                                                                |
| ----------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `appName`               | `string`                                             | LD Wizard                                                                                                                               | The name of the LD Wizard instance.                                                                                                                        |
| `icon`                  | `string`                                             | <img src="https://github.com/netwerk-digitaal-erfgoed/LDWizard-Core/raw/master/src/config/assets/LDWizard.png" height="50">             | The icon that is used inside the application.                                                                                                              |
| `favIcon`               | `string`                                             | <img src="https://github.com/netwerk-digitaal-erfgoed/LDWizard-Core/raw/master/src/config/assets/favIcon.svg" height="50">              | The icon that is used as the 'favicon'. This icon commonly appears in web browser tabs.                                                                    |
| `primaryColor`          | `string`                                             | #6d1e70 <svg height="20" viewBox="0 -10 20 30" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" fill="#6d1e70" r="10"/></svg> | The primary color that is used in the application.                                                                                                         |
| `secondaryColor`        | `string`                                             | #a90362 <svg height="20" viewBox="0 -10 20 30" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" fill="#a90362" r="10"/></svg> | The secondary color that is used in the application.                                                                                                       |
| `homepageMarkdown`      | `string`                                             | `undefined`                                                                                                                             | Optional name of a Markdown file that acts as the homepage for the LD Wizard application.                                                                  |
| `defaultBaseIri`        | `string`                                             | <https://data.netwerkdigitaalerfgoed.nl/>                                                                                               | The default base IRI that is used for linked data transformations.                                                                                         |
| `classConfig`           | `{method: "elastic" \| "sparql"; endpoint: string;}` | `{method:"sparql"; endpoint: "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ld-wizard/sdo/services/sparql/sparql"}`               | The service that is used for giving class suggestions.                                                                                                     |
| `predicateConfig`       | `{method: "elastic" \| "sparql"; endpoint: string;}` | `{method:"sparql"; endpoint: "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ld-wizard/sdo/services/sparql/sparql"}`               | The service that is used for giving property suggestions.                                                                                                  |
| `getAllowedPrefixes`    | `() => Promise<{prefixLabel:string; iri:string}[]>`  | `() => []`                                                                                                                              | A function that is used to return prefix declarations.                                                                                                     |
| `publishOrder`          | `("download" \| "triplydb")[]`                       | `["download","triplydb"]`                                                                                                               | The order in which publishing options are shown in the 'publish' step. It is also possible to exclude publication options by removing them from this list. |
| `dataplatformLink`      | `string`                                             | <https://data.netwerkdigitaalerfgoed.nl>                                                                                                | Link to the data platform that is used in the footer. This data platform is also used for creating API tokens during the 'publish' step.                   |
| `documentationLink`     | `string`                                             | <https://github.com/netwerk-digitaal-erfgoed/LDWizard>                                                                                  | Link to the generic LD Wizard project.                                                                                                                     |
| `repositoryLink`        | `string`                                             | <https://github.com/netwerk-digitaal-erfgoed/LDWizard-Core>                                                                             | Link to the specific LD Wizard configuration.                                                                                                              |
| `newDatasetAccessLevel` | `"public" \| "internal" \| "private"`                | `"private"`                                                                                                                             | The access level to use for new datasets                                                                                                                   |

### 1c. Building your own Docker container

You can create a Docker container for your LD Wizard application by running the following command (this assumes that you have a LDWizard configuration file called `./config.ts` in the root of this repository):

```sh
docker build -f ./docker/Dockerfile -t "my-tag" --build-arg CONFIG_FILE=config.ts .
```

This container includes the LDWizard web assets (images, javascript and css), hosted via NGINX on port 80.

## 2. Explanation of backend services

LD Wizard runs entirely within the web browser, making it a client-side application. In order to give the user sugesstions about their data, LD Wizard sends/reveives requests to/from external linked data services. This section describes some of the external services that can be used by LD Wizard.

### 2a. Suggestions with SPARQL

When `classConfig` and/or `predicateConfig` are set to `sparql`, LD Wizard uses one or two SPARQL endpoints to retrieve suggestions for classes and properties, respectively. The SPARQL queries that are used can be found [in the LD Wizard Core repository](https://github.com/netwerk-digitaal-erfgoed/LDWizard-Core/blob/master/src/config/sparqlSearch.ts).

These queries support class and property descriptions that follow linked data standards and best practices:

- Use [`owl:Class`](https://triplydb.com/w3c/owl/browser?resource=http%3A%2F%2Fwww.w3.org%2F2002%2F07%2Fowl%23Class) or [`rdfs:Class`](https://triplydb.com/w3c/rdfs/browser?resource=http%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23Class) to declare that something is a class.
- Use [`owl:DatatypeProperty`](https://triplydb.com/w3c/owl/browser?resource=http%3A%2F%2Fwww.w3.org%2F2002%2F07%2Fowl%23DatatypeProperty), [`owl:ObjectProperty`](https://triplydb.com/w3c/owl/browser?resource=http%3A%2F%2Fwww.w3.org%2F2002%2F07%2Fowl%23ObjectProperty), or [`rdf:Property`](https://triplydb.com/w3c/rdf/browser?resource=http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23Property) to declare that something is a property.
- Use [`rdfs:label`](https://triplydb.com/w3c/rdfs/browser?resource=http%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23label) for human-readable labels.
- Use [`rdfs:comment`](https://triplydb.com/w3c/rdfs/browser?resource=http%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23comment) for human-readable descriptions.

### 2b. Suggestions with ElasticSearch

When `classConfig` and/or `preficateConfig` are set to `elastic`, LD Wizard uses generic ElasticSearch text queries to retrieve suggestions for classes and properties. The ElasticSearch queries that are used can be found [in the LD Wizard Core repository](https://github.com/netwerk-digitaal-erfgoed/LDWizard-Core/blob/master/src/config/elasticSearch.ts).

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
