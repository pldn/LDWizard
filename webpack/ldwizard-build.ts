#!/usr/bin/env node
process.env.NODE_ENV = "production";
import { program } from "commander";
import webpack from "webpack";
import client from "./config";
import * as path from "path";
import * as fs from "fs";

program.usage("[command] <configuration-file>");
program.action(async () => {
  const config = program.args[0];
  if (!config || config.length === 0) {
    program.outputHelp();
    throw new Error("No config file specified");
  }
  const webpackConfig = client;
  console.info("Config found at", path.resolve(process.cwd(), config));
  (webpackConfig.entry as webpack.EntryObject)["config"] = path.resolve(process.cwd(), config);
  const compiler = webpack(webpackConfig);
  compiler.name = "LDWizard-base";
  console.info("Start webpack compilation");
  await new Promise<void>((resolve, reject) => {
    compiler.hooks.compile.tap("LDWizard-base", () => {
      console.info(`[LD-Wizard] Compiling `);
    });
    compiler.hooks.done.tap("LDWizard-base", (stats) => {
      if (!stats.hasErrors()) {
        console.info(stats.toString(webpackConfig.stats));
        return resolve();
      }
      console.error(stats.toJson().errors?.[0]);
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
});
program
  .parseAsync()
  .then(() => {})
  .catch((e) => {
    console.error("Something went wrong: " + e);
    process.exit(1);
  });
