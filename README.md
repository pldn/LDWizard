# LD Wizard Application: Hello world

A minimal yet functional implementation of the [LD Wizard
Interface](https://github.com/netwerk-digitaal-erfgoed/LDWizard).

You can clone this repository in order to build your own LD Wizard Application.

See the [LD Wizard design document](https://github.com/netwerk-digitaal-erfgoed/LDWizard/blob/master/docs/design.md) for more information.

See the [LD Wizard Application for Cultural
Heritage](https://github.com/netwerk-digitaal-erfgoed/LDWizard-ErfgoedWizard)
for an example of a fully configured implementation for a specific domain.

## Prerequisites / Getting started

1. Install [Node.js](https://nodejs.org) and [Yarn](https://yarnpkg.com).

   On Ubuntu this is done with the following commands.  Check the project
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

## Local use / development

1. Run `yarn dev` to start the LD Wizard application.

2. Go to <http://localhost:4000> in your favorite web browser.

## Releasing

To mark a version as 'stable', run `yarn run util:markStable`.
