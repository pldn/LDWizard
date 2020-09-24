import bgImage from "postcss-bgimage";
import HtmlWebpackPlugin from "html-webpack-plugin";
import * as webpack from "webpack";
import * as path from "path";
const isProd = process.env.NODE_ENV === "production";
const isDev = !isProd;
import autoprefixer from "autoprefixer";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import OptimizeCSSAssetsPlugin from "optimize-css-assets-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import svgoConfig from "@triply/utils/lib/svgo";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import { compact } from "lodash";
export const analyzeBundle = process.env["ANALYZE_BUNDLE"] === "true";

const plugins: webpack.Plugin[] = [
  new webpack.DefinePlugin({
    __DEVELOPMENT__: isDev,
  }),
];

if (isDev) {
  plugins.push(new ReactRefreshWebpackPlugin());
  //ignore these, to avoid infinite loops while watching
  plugins.push(new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/]));
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
    favicon: path.resolve(__dirname, "t.svg"),
  })
);

if (analyzeBundle) plugins.push(new BundleAnalyzerPlugin());

export const genericConfig: webpack.Configuration = {
  //We cannot use all source map implementations because of the terser plugin
  //See https://webpack.js.org/plugins/terser-webpack-plugin/#sourcemap
  devtool: isDev ? "inline-source-map" : false,
  cache: isDev,
  optimization: {
    minimize: true, //If you're debugging the production build, set this to false
    //that'll speed up the build process quite a bit
    minimizer: isDev
      ? []
      : [
          new TerserPlugin({
            sourceMap: true,
          }),
          new OptimizeCSSAssetsPlugin({}),
        ],
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
              plugins: compact([
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
            options: { plugins: [autoprefixer()] },
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
            options: svgoConfig(),
          },
        ],
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
            options: { plugins: () => [bgImage({ mode: "cutter" })] },
          },
        ],
      },
      {
        test: /\.png$/,
        loader: "file-loader",
      },
    ],
  },
  resolve: {
    modules: [
      "node_modules", //add this as well, so we recursively look in e.g. ./node_modules/<pkg>/node_modules too
      path.resolve("./src"),
      path.resolve("./node_modules"),
      path.resolve("../../node_modules"),
    ],
    extensions: [".json", ".js", ".ts", ".tsx", ".scss"],
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
    "LDWizard-basic": [path.resolve(__dirname, "./../src/index.tsx")],
  },
  node: {
    fs: "empty",
  },
  externals: { "fs-extra": "fs-extra" },
};

export default config;
