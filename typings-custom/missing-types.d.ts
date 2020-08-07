/**
 * Just a collection of declarations for modules where we have no types for
 * This way, we can still import them using the `import` syntax
 */
declare module "webpack-livereload-plugin" {
  const content: any; //use any as well, otherwise we can't use the dot notation
  export = content;
}
declare module "postcss-bgimage" {
  const content: any; //use any as well, otherwise we can't use the dot notation
  export = content;
}
declare module "@pmmmwh/react-refresh-webpack-plugin" {
  const content: any; //use any as well, otherwise we can't use the dot notation
  export = content;
}
