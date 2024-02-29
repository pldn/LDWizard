# Contributing

[![Build](https://github.com/pldn/LDWizard/actions/workflows/build.yml/badge.svg)](https://github.com/pldn/LDWizard/actions/workflows/build.yml)

Welcome to our LDWizard Community and many thanks for taking the time to contribute!.

In this document you find guidance on how you can contribute to our community activities by Developing local LDWizard code.

Our development activities follow the general development guidelines from another project on GitHub as much as possible, as described in the [Software and Service Requirements](https://github.com/CLARIAH/clariah-plus/blob/main/requirements/software-requirements.pdf) document from the CLARIAH Plus project.

Additional guidance about the governance of our activities, how we have implemented a gatekeeper role and how we work with development bonuses for certain issues can be found in the BOUNTIES and GOVERNANCE document. Information on how to configure a new variant of the LDWizard can be found in the CONFIGURING document.
We also have a CODE OF CONDUCT that gives some additional guidance on how we would like to interact with each other in a positive and respectful way.

## Report bugs or request new features

The easiest way to contribute to the LDWizard codebase is by reporting bugs and by requesting new features or enhancements. Both should be done via GitHub issues.

- **Avoid duplicates**: Check the [current issue list](https://github.com/pldn/LDWizard/issues) first whether  a bug has already been reported or a new feature or enhancement has already been requested;
- Add new issues with a clear title, describe only one issue per issue and describe an issue as descriptive as possible (e.g. via Who, What, Where, When and Why).

## Local development and maintenance

[![Build](https://github.com/pldn/LDWizard/actions/workflows/build.yml/badge.svg)](https://github.com/pldn/LDWizard/actions/workflows/build.yml)

### Installation guide

Install [Node.js](https://nodejs.org) and [Yarn](https://yarnpkg.com). The Node.js has [a page how to install Node using a package manager](https://nodejs.org/en/download/package-manager/). Once you have installed Node.js, use the npm package manager that comes bundled with Node.js to install Yarn, the package manager for LDWizard:

```bash
npm install --global yarn
```

### Pull Request process

Perform the following steps in order to develop LD Wizard Core locally:

1. Clone this repository and go into its root directory.

2. Run `yarn` to install the dependencies.

3. Run `yarn dev` to start the LD-wizard in local development with the default configuration.

4. Visit <http://localhost:4000> in a web browser.

5. Publish a new version of the LDWizard core via the following command.

```sh
yarn build && yarn publish
```

### Write documentation

Writing documentation follows the same process as writing code. Always accompany your code with good documentation for other developers.
