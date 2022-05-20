<img src="https://github.com/netwerk-digitaal-erfgoed/LDWizard-HelloWorld/raw/master/img/LDWizard-square.png" align="right" height="150">

# LD Wizard Core

This repository implements the [LD Wizard design document](https://github.com/netwerk-digitaal-erfgoed/LDWizard/blob/master/docs/design.md). This repository is intended for LD Wizard Core developers. **Users that want to configure their own LD Wizard application should follow [these instructions](https://github.com/netwerk-digitaal-erfgoed/LDWizard#2-create-your-own-ld-wizard).**

## 1. Develop the code locally

Perform the following steps in order to develop LD Wizard Core locally:

1. Install [Node.js](https://nodejs.org) and [Yarn](https://yarnpkg.com).

   On Ubuntu this is done with the following commands. Check the project
   websites for installation on other operating systems.

   ```sh
   curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
   curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
   echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
   sudo apt update
   sudo apt install nodejs yarn
   ```

2. Clone this repository and go into its root directory.

3. Run `yarn` to install the dependencies.

4. Run `yarn dev` to start the LD-wizard in local development with the default configuration.

5. Visit <http://localhost:4000> in a web browser.

## 2. Publish a new version

The following command publishes a new version of the LD Wizard Core:

```sh
yarn build && yarn publish
```
