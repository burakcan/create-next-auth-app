/* eslint-disable import/no-extraneous-dependencies */
import { inverse, green, cyan } from "picocolors";
import fs from "fs";
import path from "path";
import { tryGitInit } from "./helpers/git";
import { isFolderEmpty } from "./helpers/is-folder-empty";
import { getOnline } from "./helpers/is-online";
import { isWriteable } from "./helpers/is-writeable";
import type { PackageManager } from "./helpers/get-pkg-manager";

import type { TemplateMode, TemplateType } from "./templates";
import { installTemplate } from "./templates";

export class DownloadError extends Error {}

export async function createApp({
  appPath,
  packageManager,
  srcDir,
  importAlias,
}: {
  appPath: string;
  packageManager: PackageManager;
  srcDir: boolean;
  importAlias: string;
}): Promise<void> {
  const mode: TemplateMode = "ts";
  const template: TemplateType = "app-tw";

  const root = path.resolve(appPath);

  if (!(await isWriteable(path.dirname(root)))) {
    console.error(
      "The application path is not writable, please check folder permissions and try again."
    );
    console.error(
      "It is likely you do not have write permissions for this folder."
    );
    process.exit(1);
  }

  const appName = path.basename(root);

  fs.mkdirSync(root, { recursive: true });
  if (!isFolderEmpty(root, appName)) {
    process.exit(1);
  }

  const useYarn = packageManager === "yarn";
  const isOnline = !useYarn || (await getOnline());
  const originalDirectory = process.cwd();

  console.log(`Creating a new Next.js app in ${green(root)}.`);
  console.log();

  process.chdir(root);

  /**
   * proceed installing from a template.
   */
  await installTemplate({
    appName,
    root,
    template,
    mode,
    packageManager,
    isOnline,
    srcDir,
    importAlias,
  });

  if (tryGitInit(root)) {
    console.log("Initialized a git repository.");
    console.log();
  }

  let cdpath: string;
  if (path.join(originalDirectory, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }

  console.log(`${green("Success!")} Created ${appName} at ${appPath}`);

  console.log("Inside that directory, you can run several commands:");
  console.log();
  console.log(cyan(`  ${packageManager} ${useYarn ? "" : "run "}dev`));
  console.log("    Starts the development server.");
  console.log();
  console.log(cyan(`  ${packageManager} ${useYarn ? "" : "run "}build`));
  console.log("    Builds the app for production.");
  console.log();
  console.log(cyan(`  ${packageManager} start`));
  console.log("    Runs the built app in production mode.");
  console.log();
  console.log(
    "We suggest that you begin by setting up your database and environment variables:"
  );
  console.log("\nRefer to the README.md for more information.");
  console.log();
  console.log(
    green(
      "It took lots of effort to read the documentation you didn't want to read."
    ),
    inverse(green("\n Please consider donating."))
  );
  console.log();
}
