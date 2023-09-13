/**
 * This file is a placeHolder to be used during development. The LDWizard-build script will replace the config file
 */
const wizardConfig = {
    requireShaclShape: true,
    shaclShapes: [{
        url: '/Person.ttl',
        targetShape: 'http://pldn.nl/ldwizard/Philosopher'
    }]
};
// declare global { interface Window {wizardConfig: any}}

// NOTE: Example of detailed LDWizard config with column refinements
// const wizardConfig = {
//    appName: "LDWizard - example",
//    defaultBaseIri: "https://w3id.org/my-wizard/",
//    primaryColor: "#4caf50", // green
//    secondaryColor: "#1565c0", // blue
//    columnRefinements: [
//       {
//          label: "Convert lang ISO to Lexvo URIs",
//          type: "single" as const,
//          description:
//             "This transformation will take lang ISO (e.g. fr or fra) and convert it to a Lexvo URI: http://lexvo.org/id/iso639-3/eng",
//          transformation: async (searchTerm: string) => {
//             // const sources = ["http://vocab.getty.edu/aat/sparql"];
//             // return getUriOfSearchTerm(sources, searchTerm);
//             if (searchTerm.length == 3) {
//                return `http://lexvo.org/id/iso639-3/${searchTerm}`
//             }
//             if (searchTerm.length == 2) {
//                return `http://lexvo.org/id/iso639-1/${searchTerm}`
//             }
//             return searchTerm
//          },
//       },
//    ],
// };
export default globalThis.wizardConfig = wizardConfig

