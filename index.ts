#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */
import { cyan, green, red, yellow, bold, blue } from "picocolors";
import Commander from "commander";
import path from "path";
import prompts from "prompts";
import type { InitialReturnValue } from "prompts";
import checkForUpdate from "update-check";
import { createApp } from "./create-app";
import { getPkgManager } from "./helpers/get-pkg-manager";
import { validateNpmName } from "./helpers/validate-pkg";
import packageJson from "./package.json";
import { isFolderEmpty } from "./helpers/is-folder-empty";
import fs from "fs";

let projectPath: string = "";

const handleSigTerm = () => process.exit(0);

process.on("SIGINT", handleSigTerm);
process.on("SIGTERM", handleSigTerm);

const onPromptState = (state: {
  value: InitialReturnValue;
  aborted: boolean;
  exited: boolean;
}) => {
  if (state.aborted) {
    // If we don't re-enable the terminal cursor before exiting
    // the program, the cursor will remain hidden
    process.stdout.write("\x1B[?25h");
    process.stdout.write("\n");
    process.exit(1);
  }
};

const program = new Commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments("<project-directory>")
  .usage(`${green("<project-directory>")} [options]`)
  .action((name) => {
    projectPath = name;
  })
  .option(
    "--src-dir",
    `

  Initialize inside a \`src/\` directory.
`
  )
  .option(
    "--import-alias <alias-to-configure>",
    `

  Specify import alias to use (default "@/*").
`
  )
  .option(
    "--use-npm",
    `

  Explicitly tell the CLI to bootstrap the application using npm
`
  )
  .option(
    "--use-pnpm",
    `

  Explicitly tell the CLI to bootstrap the application using pnpm
`
  )
  .option(
    "--use-yarn",
    `

  Explicitly tell the CLI to bootstrap the application using Yarn
`
  )
  .option(
    "--use-bun",
    `

  Explicitly tell the CLI to bootstrap the application using Bun
`
  )
  .allowUnknownOption()
  .parse(process.argv);

const packageManager = !!program.useNpm
  ? "npm"
  : !!program.usePnpm
    ? "pnpm"
    : !!program.useYarn
      ? "yarn"
      : !!program.useBun
        ? "bun"
        : getPkgManager();

async function run(): Promise<void> {
  if (typeof projectPath === "string") {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    const res = await prompts({
      onState: onPromptState,
      type: "text",
      name: "path",
      message: "What is your project named?",
      initial: "my-app",
      validate: (name) => {
        const validation = validateNpmName(path.basename(path.resolve(name)));
        if (validation.valid) {
          return true;
        }
        return "Invalid project name: " + validation.problems[0];
      },
    });

    if (typeof res.path === "string") {
      projectPath = res.path.trim();
    }
  }

  if (!projectPath) {
    console.log(
      "\nPlease specify the project directory:\n" +
        `  ${cyan(program.name())} ${green("<project-directory>")}\n` +
        "For example:\n" +
        `  ${cyan(program.name())} ${green("my-next-app")}\n\n` +
        `Run ${cyan(`${program.name()} --help`)} to see all options.`
    );
    process.exit(1);
  }

  const resolvedProjectPath = path.resolve(projectPath);
  const projectName = path.basename(resolvedProjectPath);

  const validation = validateNpmName(projectName);
  if (!validation.valid) {
    console.error(
      `Could not create a project called ${red(
        `"${projectName}"`
      )} because of npm naming restrictions:`
    );

    validation.problems.forEach((p) =>
      console.error(`    ${red(bold("*"))} ${p}`)
    );
    process.exit(1);
  }

  /**
   * Verify the project dir is empty or doesn't exist
   */
  const root = path.resolve(resolvedProjectPath);
  const appName = path.basename(root);
  const folderExists = fs.existsSync(root);

  if (folderExists && !isFolderEmpty(root, appName)) {
    process.exit(1);
  }

  /**
   * If the user does not provide the necessary flags, prompt them for whether
   * to use TS or JS.
   */

  const defaults = {
    srcDir: true,
    importAlias: "@/*",
    customizeImportAlias: false,
  };
  const getDefault = (field: keyof typeof defaults) => defaults[field];

  if (
    !process.argv.includes("--src-dir") &&
    !process.argv.includes("--no-src-dir")
  ) {
    const styledSrcDir = blue("`src/` directory");
    const { srcDir } = await prompts({
      onState: onPromptState,
      type: "toggle",
      name: "srcDir",
      message: `Would you like to use ${styledSrcDir}?`,
      initial: getDefault("srcDir"),
      active: "Yes",
      inactive: "No",
    });
    program.srcDir = Boolean(srcDir);
  }

  if (typeof program.importAlias !== "string" || !program.importAlias.length) {
    const styledImportAlias = blue("import alias");

    const { customizeImportAlias } = await prompts({
      onState: onPromptState,
      type: "toggle",
      name: "customizeImportAlias",
      message: `Would you like to customize the default ${styledImportAlias} (${defaults.importAlias})?`,
      initial: getDefault("customizeImportAlias"),
      active: "Yes",
      inactive: "No",
    });

    if (!customizeImportAlias) {
      // We don't use preferences here because the default value is @/* regardless of existing preferences
      program.importAlias = defaults.importAlias;
    } else {
      const { importAlias } = await prompts({
        onState: onPromptState,
        type: "text",
        name: "importAlias",
        message: `What ${styledImportAlias} would you like configured?`,
        initial: getDefault("importAlias"),
        validate: (value) =>
          /.+\/\*/.test(value)
            ? true
            : "Import alias must follow the pattern <prefix>/*",
      });
      program.importAlias = importAlias;
    }
  }

  await createApp({
    appPath: resolvedProjectPath,
    packageManager,
    srcDir: program.srcDir,
    importAlias: program.importAlias,
  });
}

const update = checkForUpdate(packageJson).catch(() => null);

async function notifyUpdate(): Promise<void> {
  try {
    const res = await update;
    if (res?.latest) {
      const updateMessage =
        packageManager === "yarn"
          ? "yarn global add create-next-app"
          : packageManager === "pnpm"
            ? "pnpm add -g create-next-app"
            : packageManager === "bun"
              ? "bun add -g create-next-app"
              : "npm i -g create-next-app";

      console.log(
        yellow(bold("A new version of `create-next-app` is available!")) +
          "\n" +
          "You can update by running: " +
          cyan(updateMessage) +
          "\n"
      );
    }
    process.exit();
  } catch {
    // ignore error
  }
}

run()
  .then(notifyUpdate)
  .catch(async (reason) => {
    console.log();
    console.log("Aborting installation.");
    if (reason.command) {
      console.log(`  ${cyan(reason.command)} has failed.`);
    } else {
      console.log(
        red("Unexpected error. Please report it as a bug:") + "\n",
        reason
      );
    }
    console.log();

    await notifyUpdate();

    process.exit(1);
  });
