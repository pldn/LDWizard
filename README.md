<img src="img/LDWizard-square.png" align="right" height="150">

# “Hello world” Wizard

A minimal yet functional implementation of the [LD Wizard
Interface](https://github.com/netwerk-digitaal-erfgoed/LDWizard).

You can clone this repository in order to build your own LD Wizard Application.

See the [LD Wizard design document](https://github.com/netwerk-digitaal-erfgoed/LDWizard/blob/master/docs/design.md) for more information about the LD Wizard framework.

See the [Cultural Heritage
Wizard](https://github.com/netwerk-digitaal-erfgoed/LDWizard-ErfgoedWizard) for
an example of a fully configured implementation for a specific domain.

## 1. Installation

The following steps are necessary in order to install the “Hello world” Wizard:

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

## 2. Usage

The following steps allow you to run the “Hello world” Wizard locally:

1. Run `yarn dev` to start the LD Wizard application.

2. Go to <http://localhost:4000> in your favorite web browser.

## 3. Development

This section contains information about developing the “Hello world” Wizard.

### 3.1 Used dependencies

This LD Wizard Application makes use of the following modern web libraries:

- [Font Awesome](https://fontawesome.com)
- [Material-UI](https://material-ui.com)
- [React](https://reactjs.org)
- [Recoil](https://recoiljs.org)

## 4. Deployment

This section contains information about deploying the “Hello world” Wizard.

### 4.1 Docker

1. Build the Docker image:

```bash
docker-compose -f ./docker/docker-compose.yml build
```

2. Start the service:

```bash
docker-compose -f ./docker/docker-compose.yml up
```

3. Go to <http://localhost:4000> in your favorite web browser.

### 4.2 Releasing

To mark a version as stable, run `yarn run util:markStable`.
