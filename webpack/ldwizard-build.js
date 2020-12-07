#!/usr/bin/env node
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
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_ENV = "production";
const commander_1 = __importDefault(require("commander"));
const webpack_1 = __importDefault(require("webpack"));
const config_1 = __importDefault(require("./config"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
commander_1.default.usage("[command] <configuration-file>");
commander_1.default.action(() =>
  __awaiter(void 0, void 0, void 0, function* () {
    const config = commander_1.default.args[0];
    if (!config || config.length === 0) {
      commander_1.default.outputHelp();
      throw new Error("No config file specified");
    }
    const webpackConfig = config_1.default;
    console.info("Config found at", path.resolve(process.cwd(), config));
    webpackConfig.plugins = [
      new webpack_1.default.NormalModuleReplacementPlugin(
        /src\/config\/wizardConfigDefaults\.ts/,
        path.resolve(process.cwd(), config)
      ),
      ...(webpackConfig.plugins || []),
    ];
    const compiler = webpack_1.default(webpackConfig);
    compiler.name = "LDWizard-base";
    console.info("Start webpack compilation");
    yield new Promise((resolve, reject) => {
      compiler.hooks.compile.tap("LDWizard-base", () => {
        console.info(`[LD-Wizard] Compiling `);
      });
      compiler.hooks.done.tap("LDWizard-base", (stats) => {
        if (!stats.hasErrors()) {
          console.info(stats.toString(webpackConfig.stats));
          return resolve();
        }
        console.error(stats.toJson().errors[0]);
        return reject(`Failed to compile LD-Wizard`);
      });
      compiler.run(() => {});
    });
    console.info("Moving docker files");
    const dockerOriginFolder = path.resolve(__dirname, "../docker");
    const dockerFolder = path.resolve(process.cwd(), "docker");
    if (!fs.existsSync(dockerFolder)) {
      fs.mkdirSync(dockerFolder);
    }
    fs.copyFileSync(path.resolve(dockerOriginFolder, "Dockerfile"), path.resolve(dockerFolder, "Dockerfile"));
    fs.copyFileSync(path.resolve(dockerOriginFolder, "nginx.conf"), path.resolve(dockerFolder, "nginx.conf"));
    console.info("Compilation has completed, the build can be found in the './lib' directory");
  })
);
commander_1.default
  .parseAsync()
  .then(() => {})
  .catch((e) => {
    console.error("Something went wrong: " + e);
    process.exit(1);
  });
//# sourceMappingURL=ldwizard-build.js.map
