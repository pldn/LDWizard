import WizardConfig from "./WizardConfig";
/**
 * This file is a placeHolder to be used during development. The LDWizard-build script will replace the config file
 */

export const wizardConfig: WizardConfig = {
  columnRefinements: [
    {
      description: "Use this transformation when your data already contains links",
      label: "As IRI",
      transformation: (value) => Promise.resolve(value),
    },
  ],
};
export default wizardConfig;
