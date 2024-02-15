#!/usr/bin/env node
import { program } from "commander";
import webpack from "webpack";
import { getConfig } from "./config.js";
import * as path from "path";
import * as fs from "fs";
import url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

program.usage("[command] <configuration-file>");
program.action(async () => {
  const entrypoint = program.args[0];
  if (!entrypoint || entrypoint.length === 0) {
    program.outputHelp();
    throw new Error("No config file specified");
  }
  const webpackConfig = getConfig({ production: true });
  console.info("Config found at", path.resolve(process.cwd(), entrypoint));
  // here we set the entry point to the config file or custom config file
  (webpackConfig.entry as webpack.EntryObject)["config"] = path.resolve(process.cwd(), entrypoint);

  const compiler = webpack(webpackConfig);
  compiler.name = "LDWizard-base";
  console.info("Start webpack compilation");
  await new Promise<void>((resolve, reject) => {
    compiler.hooks.compile.tap("LDWizard-base", () => {
      console.info(`[LD-Wizard] Compiling `);
    });
    compiler.hooks.done.tap("LDWizard-base", (stats) => {
      if (!stats.hasErrors()) {
        console.info(stats.toString(typeof webpackConfig.stats !== "boolean"?webpackConfig.stats:"No stats :("));
        return resolve();
      }
      console.error(stats.toJson().errors?.[0]);
      return reject(`Failed to compile LD-Wizard`);
    });
    compiler.run(() => {});
  });
  console.info("Moving docker files");
  const dockerOriginFolder = path.resolve(__dirname, "../../docker");
  const dockerFolder = path.resolve(process.cwd(), "docker");

  if (!fs.existsSync(dockerFolder)) {
    fs.mkdirSync(dockerFolder);
  }
  fs.copyFileSync(path.resolve(dockerOriginFolder, "Dockerfile"), path.resolve(dockerFolder, "Dockerfile"));
  fs.copyFileSync(path.resolve(dockerOriginFolder, "nginx.conf"), path.resolve(dockerFolder, "nginx.conf"));
  console.info("Compilation has completed, the build can be found in the './lib' directory");
});
program
  .parseAsync()
  .then(() => {})
  .catch((e) => {
    console.error("Something went wrong: " + e);
    process.exit(1);
  });
