declare module "*.scss" {
  const content: { [key: string]: any } | any; //use any as well, otherwise we can't use the dot notation
  export = content;
}
declare module "*.css" {
  const content: { [key: string]: any } | any; //use any as well, otherwise we can't use the dot notation
  export = content;
}
declare module "*.jpg" {
  const content: string;
  export = content;
}
declare module "*.png" {
  const content: string;
  export = content;
}
declare module "*.svg" {
  const content: string;
  export = content;
}
declare module "*.txt" {
  const content: string;
  export = content;
}
