import bgImage from "postcss-bgimage";
import HtmlWebpackPlugin from "html-webpack-plugin";
import webpack from "webpack";
import * as path from "path";
const isProd = process.env.NODE_ENV === "production";
const isDev = !isProd;
import autoprefixer from "autoprefixer";
import  MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import { compact } from "lodash-es";
import { Renderer as MarkdownRenderer } from "marked";

export const analyzeBundle = process.env["ANALYZE_BUNDLE"] === "true";
const plugins: webpack.WebpackPluginInstance[] = [
  new webpack.DefinePlugin({
    __DEVELOPMENT__: isDev,
  }),
];

// Ignore optional dependency from RocketRML
plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^/u, contextRegExp: /xpath-iterator/u }));

if (isDev) {
  plugins.push(new ReactRefreshWebpackPlugin());
  //ignore these, to avoid infinite loops while watching
  plugins.push(new webpack.WatchIgnorePlugin({ paths: [/\.js$/, /\.d\.ts$/] }));
} else {
  plugins.push(
    new MiniCssExtractPlugin({
      filename: "[name].min.css",
      chunkFilename: "[id].css",
    })
  );
}
plugins.push(
  new HtmlWebpackPlugin({
    template: path.resolve("./webpack/index.html"),
    favicon: "",
  })
);

plugins.push(new webpack.ProvidePlugin({ Buffer: ["buffer", "Buffer"] }));

//@ts-ignore
if (analyzeBundle) plugins.push(new BundleAnalyzerPlugin());

export const genericConfig: webpack.Configuration = {
  //We cannot use all source map implementations because of the terser plugin
  //See https://webpack.js.org/plugins/terser-webpack-plugin/#sourcemap
  devtool: isDev ? "inline-source-map" : false,
  cache: isDev,
  optimization: {
    minimize: true, //If you're debugging the production build, set this to false
    //that'll speed up the build process quite a bit
    minimizer: isDev ? [] : [new TerserPlugin({}), new CssMinimizerPlugin({})],
  },
  performance: {
    maxEntrypointSize: 3000000,
    maxAssetSize: 3000000,
  },
  mode: isDev ? "development" : "production",
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.tsx?$/,
        rules: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    modules: false,
                    targets: {browsers: ["last 3 versions", "> 1%"]}
                  },
                ],
                "@babel/preset-react",
              ],
              plugins: compact([
                isDev ? path.resolve("./node_modules/react-refresh/babel.js") : undefined,
                // "@babel/plugin-transform-runtime",
              ]),
            },
          },
          { 
            loader: "ts-loader",
            options: {
              configFile: path.resolve(`./tsconfig-build.json`),
              transpileOnly: true
            },
          },
        ],
      },
      // {
      //   test: /\.js$/,
      //   include: [/query-string/, /strict-uri-encode/, /superagent/, /n3/, /split-on-first/],
      //   use: [
      //     {
      //       loader: "babel-loader",
      //       options: {
      //         presets: [
      //           [
      //             "@babel/preset-env",
      //             {
      //               targets: ["last 3 versions", "> 1%"],
      //             },
      //           ],
      //         ],
      //       },
      //     },
      //   ],
      // },
      {
        test: /\.(woff2?|ttf)$/,
        type: "asset",
      },
      {
        test: /\.txt$/,
        loader: "raw-loader",
      },
      {
        test: /\.scss$/,
        use: [
          isDev ? "style-loader" : MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 2,

              modules: { localIdentName: "[name]--[local]--[hash:base64:8]" },
            },
          },
          {
            loader: "postcss-loader",
            options: { postcssOptions: { plugins: [autoprefixer()] } },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        exclude: [
          // These packages have issues with their sourcemaps
          isDev
            ? path.resolve("../node_modules/rdf-data-factory")
            : path.resolve("../node_modules"),
          path.resolve("../node_modules/@triply/utils"),
        ],
        enforce: "pre",
      },
      {
        test: /\.svg$/i,
        type: "asset",
        resourceQuery: { not: [/react/] }, // exclude react component if *.svg?url
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: /react/, // *.svg?url
        use: ["@svgr/webpack"],
      },
      {
        test: /\.css$/,
        use: [
          isDev ? "style-loader" : MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { importLoaders: 1 } },
          {
            loader: "postcss-loader",
            //Remove background image. We're often including css from node_modules, and
            //libs like leaflet have a url reference to a png in their css
            //Dont want this in there, to avoid external deps
            options: { postcssOptions: { plugins: () => [bgImage({ mode: "cutter" })] } },
          },
        ],
      },
      {
        test: /\.png$/,
        loader: "file-loader",
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: "html-loader",
          },
          {
            loader: "markdown-loader",
            options: {
              pedantic: true,
              renderer: new MarkdownRenderer(),
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".json", ".js", ".ts", ".tsx", ".scss"],
    modules: ["node_modules", path.resolve("./src")],
    fallback: {
      fs: false,
      path: false,
      zlib: false,
      os: false,
      url: path.resolve("/node_modules/url/url.js"),
    },
  },
  plugins: plugins,
};

const config: webpack.Configuration = {
  ...genericConfig,
  output: {
    path: path.resolve(process.cwd(), "lib"),
    filename: "[name].min.js", 
    scriptType: 'text/javascript'
  },
  experiments:{
    outputModule: true,
    topLevelAwait: true 
  },
  entry: {
    config: [path.resolve("./webpack/runtimeConfig.ts")],
    "LDWizard-base": [path.resolve("./src/index.tsx")],
  },
  externals: {
    // pumpify: "pumpify",
    // "fs-extra": "fs-extra",
    // "global-agent": "global-agent",
    // querystring: "querystring",
  },
  ignoreWarnings: [/Failed to parse source map/],
};

export default config;
