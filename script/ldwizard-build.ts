#!/usr/bin/env node
import { program } from "commander";
import * as path from "path";
import * as fs from "fs";
import * as esbuild from "esbuild";
import url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

program.usage("[command] <configuration-file>");
program.action(async () => {
  const entrypoint = program.args[0];
  if (!entrypoint || entrypoint.length === 0) {
    program.outputHelp();
    throw new Error("No config file specified");
  }
  console.info("Config found at", path.resolve(process.cwd(), entrypoint));
  const outFolder = path.resolve(process.cwd(), "./lib");
  // Ensure that the outfolder exist
  if (!fs.existsSync(outFolder)) fs.mkdirSync(outFolder, { recursive: true });
  const wizardLibDir = path.resolve(__dirname, "../../lib");
  
  console.info("Compiling config")
  await esbuild.build({
    entryPoints: [path.resolve(process.cwd(), entrypoint)],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: path.resolve(outFolder, "config.min.js"),
    loader: { ".csv": "text", ".ttl": "text", ".svg": "file", ".png": "file", ".md": "text" },
  });
  
  console.info("Copy ldwizard files");
  const wizardLibFiles = fs.readdirSync(wizardLibDir);
  for (const file of wizardLibFiles) {
    // We've just compiled these, lets not override them.
    if (file.startsWith("config.min.js")) continue;
    fs.copyFileSync(path.resolve(wizardLibDir, file), path.resolve(outFolder, file));
  }
  
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
