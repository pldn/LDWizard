import bgImage from "postcss-bgimage";
import HtmlWebpackPlugin from "html-webpack-plugin";
import * as webpack from "webpack";
import * as path from "path";
const isProd = process.env.NODE_ENV === "production";
const isDev = !isProd;
import autoprefixer from "autoprefixer";
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import { compact } from "lodash";
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
    template: path.resolve(__dirname, "index.html"),
    // filename: "index.html"
    favicon: "",
  })
);

plugins.push(new webpack.ProvidePlugin({ Buffer: ["buffer", "Buffer"] }));

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
                    targets: ["last 3 versions", "> 1%"],
                  },
                ],
              ],
              plugins: compact([
                isDev ? require.resolve("react-refresh/babel") : undefined,
                "@babel/plugin-transform-runtime",
              ]),
            },
          },
          {
            loader: "ts-loader",
            options: {
              configFile: path.resolve(__dirname, `../tsconfig-build.json`),
              compilerOptions: {
                rootDir: process.cwd(),
              },
            },
          },
        ],
      },
      {
        test: /\.js$/,
        include: [/query-string/, /strict-uri-encode/, /superagent/, /n3/, /split-on-first/],
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    targets: ["last 3 versions", "> 1%"],
                  },
                ],
              ],
            },
          },
        ],
      },
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
            ? path.resolve(__dirname, "../node_modules/rdf-data-factory")
            : path.resolve(__dirname, "../node_modules"),
          path.resolve(__dirname, "../node_modules/@triply/utils"),
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
      url: path.resolve(__dirname, "/node_modules/url/url.js"),
    },
  },
  plugins: plugins,
};

const config: webpack.Configuration = {
  ...genericConfig,
  output: {
    path: path.resolve("lib"),
    filename: "[name].min.js",
    libraryTarget: "umd",
  },
  entry: {
    config: [path.resolve(__dirname, "./runtimeConfig.ts")],
    "LDWizard-base": [path.resolve(__dirname, "./../src/index.tsx")],
  },
  externals: {
    pumpify: "pumpify",
    "fs-extra": "fs-extra",
    "global-agent": "global-agent",
    querystring: "querystring",
  },
  ignoreWarnings: [/Failed to parse source map/],
};

export default config;
