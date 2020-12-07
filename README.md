<img src="https://github.com/netwerk-digitaal-erfgoed/LDWizard-HelloWorld/raw/master/img/LDWizard-square.png" align="right" height="150">

# LDWizard-Core

The core functional implementation of the [LD Wizard
Interface](https://github.com/netwerk-digitaal-erfgoed/LDWizard).

You can use this package in order to build your own LD Wizard Application.

See the [LD Wizard design document](https://github.com/netwerk-digitaal-erfgoed/LDWizard/blob/master/docs/design.md) for more information about the LD Wizard framework.

See the [Cultural Heritage
Wizard](https://github.com/netwerk-digitaal-erfgoed/LDWizard-ErfgoedWizard) for
an example of a fully configured implementation for a specific domain.

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
     yarn add @triply/ldwizard-core
     ```

   - NPM

     ```sh
     npm install @triply/ldwizard-core
     ```

3. Create a configuration file

   ```ts
   // This is a template file
   import WizardConfig from @triply/ldwizard-core/lib/WizardConfig;
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
