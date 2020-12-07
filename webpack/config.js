"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.genericConfig = exports.analyzeBundle = void 0;
const postcss_bgimage_1 = __importDefault(require("postcss-bgimage"));
const html_webpack_plugin_1 = __importDefault(require("html-webpack-plugin"));
const webpack = __importStar(require("webpack"));
const path = __importStar(require("path"));
const isProd = process.env.NODE_ENV === "production";
const isDev = !isProd;
const autoprefixer_1 = __importDefault(require("autoprefixer"));
const mini_css_extract_plugin_1 = __importDefault(require("mini-css-extract-plugin"));
const optimize_css_assets_webpack_plugin_1 = __importDefault(require("optimize-css-assets-webpack-plugin"));
const terser_webpack_plugin_1 = __importDefault(require("terser-webpack-plugin"));
const react_refresh_webpack_plugin_1 = __importDefault(require("@pmmmwh/react-refresh-webpack-plugin"));
const svgo_1 = __importDefault(require("@triply/utils/lib/svgo"));
const webpack_bundle_analyzer_1 = require("webpack-bundle-analyzer");
const lodash_1 = require("lodash");
const marked_1 = require("marked");
exports.analyzeBundle = process.env["ANALYZE_BUNDLE"] === "true";
const plugins = [
  new webpack.DefinePlugin({
    __DEVELOPMENT__: isDev,
  }),
];
if (isDev) {
  plugins.push(new react_refresh_webpack_plugin_1.default());
  plugins.push(new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/]));
} else {
  plugins.push(
    new mini_css_extract_plugin_1.default({
      filename: "[name].min.css",
      chunkFilename: "[id].css",
    })
  );
}
plugins.push(
  new html_webpack_plugin_1.default({
    template: path.resolve(__dirname, "index.html"),
    favicon: "",
  })
);
if (exports.analyzeBundle) plugins.push(new webpack_bundle_analyzer_1.BundleAnalyzerPlugin());
exports.genericConfig = {
  devtool: isDev ? "inline-source-map" : false,
  cache: isDev,
  optimization: {
    minimize: true,
    minimizer: isDev
      ? []
      : [
          new terser_webpack_plugin_1.default({
            sourceMap: true,
          }),
          new optimize_css_assets_webpack_plugin_1.default({}),
        ],
  },
  performance: {
    maxEntrypointSize: 3000000,
    maxAssetSize: 3000000,
  },
  mode: isDev ? "development" : "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: [
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
              plugins: lodash_1.compact([
                isDev ? require.resolve("react-refresh/babel") : undefined,
                "@babel/plugin-transform-runtime",
              ]),
            },
          },
          {
            loader: "ts-loader",
            options: {
              configFile: `tsconfig-build.json`,
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
        loader: "url-loader",
        options: {
          emitFile: true,
          limit: 1000,
        },
      },
      {
        test: /\.txt$/,
        loader: "raw-loader",
      },
      {
        test: /\.scss$/,
        use: [
          isDev ? "style-loader" : mini_css_extract_plugin_1.default.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 2,
              modules: { localIdentName: "[name]--[local]--[hash:base64:8]" },
            },
          },
          {
            loader: "postcss-loader",
            options: { plugins: [autoprefixer_1.default()] },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre",
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 1000,
              emitFile: true,
              mimetype: "image/svg+xml",
            },
          },
          {
            loader: "svgo-loader",
            options: svgo_1.default(),
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          isDev ? "style-loader" : mini_css_extract_plugin_1.default.loader,
          { loader: "css-loader", options: { importLoaders: 1 } },
          {
            loader: "postcss-loader",
            options: { plugins: () => [postcss_bgimage_1.default({ mode: "cutter" })] },
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
              renderer: new marked_1.Renderer(),
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".json", ".js", ".ts", ".tsx", ".scss"],
  },
  plugins: plugins,
};
const config = Object.assign(Object.assign({}, exports.genericConfig), {
  output: {
    path: path.resolve("lib"),
    filename: "[name].min.js",
    libraryTarget: "umd",
  },
  entry: {
    "LDWizard-base": [path.resolve(__dirname, "./../src/index.tsx")],
  },
  node: {
    fs: "empty",
  },
  externals: { "fs-extra": "fs-extra" },
});
exports.default = config;
//# sourceMappingURL=config.js.map
