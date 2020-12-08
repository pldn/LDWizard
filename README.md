<img src="https://github.com/netwerk-digitaal-erfgoed/LDWizard-HelloWorld/raw/master/img/LDWizard-square.png" align="right" height="150">

# LDWizard-Core

The core functional implementation of the [LD Wizard
Interface](https://github.com/netwerk-digitaal-erfgoed/LDWizard).

You can use this package in order to build your own LD Wizard Application.

See the [LD Wizard design document](https://github.com/netwerk-digitaal-erfgoed/LDWizard/blob/master/docs/design.md) for more information about the LD Wizard framework.

See the [Cultural Heritage
Wizard](https://github.com/netwerk-digitaal-erfgoed/LDWizard-ErfgoedWizard) for
an example of a fully configured implementation for a specific domain.

# LDWizard configuration options

You only need to specify which settings which you want to change.

| setting              | type                                                | default                                                                                                                                 | description                                                                                                                                                |
| -------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `appName`            | `string`                                            | LD Wizard                                                                                                                               | The name of the LD Wizard instance.                                                                                                                        |
| `icon`               | `string`                                            | ![default icon]("./src/config/assets/LDWizard.png")                                                                                     | The icon that is used inside the application.                                                                                                              |
| `favIcon`            | `string`                                            | ![default favIcon]("./src/config/assets/favIcon.svg")                                                                                   | The icon that is used as the 'favicon'. This icon commonly appears in web browser tabs.                                                                    |
| `primaryColor`       | `string`                                            | #6d1e70 <svg height="20" viewBox="0 -10 20 30" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" fill="#6d1e70" r="10"/></svg> | The primary color that is used in the application.                                                                                                         |
| `secondaryColor`     | `string`                                            | #a90362 <svg height="20" viewBox="0 -10 20 30" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" fill="#a90362" r="10"/></svg> | The secondary color that is used in the application.                                                                                                       |
| `homepageMarkdown`   | `string`                                            | `undefined`                                                                                                                             | Optional name of a Markdown file that acts as the homepage for the LD Wizard application.                                                                  |
| `defaultBaseIri`     | `string`                                            | <https://data.netwerkdigitaalerfgoed.nl/>                                                                                               | The default base IRI that is used for linked data transformations.                                                                                         |
| `classConfig`        | `{method: "elastic" | "sparql"; endpoint: string;}` | `{method:"sparql"; endpoint: "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ld-wizard/sdo/services/sparql/sparql"}`               | The service that is used for giving class suggestions.                                                                                                     |
| `predicateConfig`    | `{method: "elastic" | "sparql"; endpoint: string;}` | `{method:"sparql"; endpoint: "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ld-wizard/sdo/services/sparql/sparql"}`               | The service that is used for giving property suggestions.                                                                                                  |
| `getAllowedPrefixes` | `() => Promise<{prefixLabel:string; iri:string}[]>` | `() => []`                                                                                                                              | A function that is used to return prefix declarations.                                                                                                     |
| `publishOrder`       | `("download" | "triplydb")[]`                       | `["download","triplydb"]`                                                                                                               | The order in which publishing options are shown in the 'publish' step. It is also possible to exclude publication options by removing them from this list. |
| `dataplatformLink`   | `string`                                            | <https://data.netwerkdigitaalerfgoed.nl>                                                                                                | Link to the data platform that is used in the footer. This data platform is also used for creating API tokens during the 'publish' step.                   |
| `documentationLink`  | `string`                                            | <https://github.com/netwerk-digitaal-erfgoed/LDWizard>                                                                                  | Link to the generic LD Wizard project.                                                                                                                     |
| `repositoryLink`     | `string`                                            | <https://github.com/netwerk-digitaal-erfgoed/LDWizard-Core>                                                                             | Link to the specific LD Wizard configuration.                                                                                                              |

# Building your own LDWizard package

1. Install [Node.js](https://nodejs.org) and [Yarn](https://yarnpkg.com).

   On Ubuntu this is done with the following commands. Check the project
   websites for installation on other operating systems.

   ```sh
   curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
   curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
   echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
   sudo apt update
   sudo apt install nodejs yarn
   ```

2. Add this package to your dependencies via

   - Yarn

     ```sh
     yarn add @netwerkdigitaalerfgoed/ldwizard
     ```

   - NPM

     ```sh
     npm install @netwerkdigitaalerfgoed/ldwizard
     ```

3. Create a configuration file

   ```ts
   // This is a template file
   import WizardConfig from "@netwerkdigitaalerfgoed/ldwizard/types/WizardConfig";
   const wizardConfig: WizardConfig = {};
   export default wizardConfig;
   ```

4. Run the script to create you local instance

   - Yarn

     ```sh
     yarn exec ldwizard-build path/to/configFile.ts
     ```

   Your package should now be available in the lib directory

# Building your own LDWizard container

- Follow the steps from [Building your own LDWizard package]
- Run `docker build -f ./docker/Dockerfile -t "my-docker-tag" --build-arg CONFIG_FILE=path/to/configFile.ts.`

# Local use / development

To start using a local instance for testing/development follow these steps

1. Install [Node.js](https://nodejs.org) and [Yarn](https://yarnpkg.com).

   On Ubuntu this is done with the following commands. Check the project
   websites for installation on other operating systems.

   ```sh
   curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
   curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
   echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
   sudo apt update
   sudo apt install nodejs yarn
   ```

2. Clone this repository and go into its root directory.
3. Run `yarn` to install the dependencies.
4. Run `yarn dev` to start the LD-wizard in local development with the default configuration.
5. Go to <http://localhost:4000> in your favorite web browser.

# Creating a new version

```sh
yarn build && yarn publish
```
