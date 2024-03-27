/* eslint-disable import/no-extraneous-dependencies */
import { red } from "picocolors";
import fs from "fs/promises";
import spawn from "cross-spawn";
import path from "path";
import { copy } from "./copy";
import prompts, { InitialReturnValue } from "prompts";

const components = [
  "button",
  "card",
  "input-otp",
  "input",
  "label",
  "alert",
  "checkbox",
  "form",
  "sonner",
];

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

export async function installComponents(additionalComponents?: boolean) {
  if (!additionalComponents) {
    components.forEach((component) => {
      console.log(`- ${component}`);
    });
  }

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      "npx",
      ["shadcn-ui@latest", "add", ...(additionalComponents ? [] : components)],
      {
        stdio: "inherit",
        env: {
          ...process.env,
          ADBLOCK: "1",
          NODE_ENV: "development",
          DISABLE_OPENCOLLECTIVE: "1",
        },
      }
    );

    child.on("close", (code) => {
      if (code !== 0) {
        reject({ command: `npx shadcn-ui@latest add ${components.join(" ")}` });
        return;
      }
      resolve();
    });
  });

  if (!additionalComponents) {
    const res = await prompts({
      onState: onPromptState,
      type: "toggle",
      name: "additionalComponents",
      message:
        "Would you like to add more components now? You can always do this later.",
      initial: "No",
      active: "Yes",
      inactive: "No",
    });

    if (res.additionalComponents) await installComponents(true);
  }
}

/**
 * Spawn a package manager installation based on user preference.
 *
 * @returns A Promise that resolves once the installation is finished.
 */
export async function initShadcn(
  /** Indicate whether there is an active Internet connection.*/
  isOnline: boolean,
  root: string,
  importAlias: string,
  srcDir: boolean
): Promise<void> {
  if (!isOnline) {
    console.log(
      red(
        "You appear to be offline.\nInstallation requires an active Internet connection."
      )
    );
    process.exit(1);
  }
  /**
   * Return a Promise that resolves once the installation is finished.
   */
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["shadcn-ui@latest", "init"], {
      stdio: "inherit",
      env: {
        ...process.env,
        ADBLOCK: "1",
        NODE_ENV: "development",
        DISABLE_OPENCOLLECTIVE: "1",
      },
    });

    child.on("close", async (code) => {
      if (code !== 0) {
        reject({ command: `npx shadcn-ui@latest init` });
        return;
      }

      await copy(["**"], path.join(root, srcDir ? "src" : ""), {
        cwd: path.join(root, "@"),
        parents: true,
      });

      // delete the @ directory if it exists
      try {
        await fs.rm(path.join(root, "@"), { recursive: true });
      } catch (err) {}

      const componentsFile = path.join(root, "components.json");
      fs.stat(componentsFile).then(async (stats) => {
        if (!stats.isFile()) {
          console.log(
            red(
              "Components.json not found. There was an issue when initializing shadcn-ui."
            )
          );

          process.exit(1);
        }

        await fs.writeFile(
          componentsFile,
          (await fs.readFile(componentsFile, "utf8")).replace(
            /@\//g,
            `${importAlias.replace(/\*/g, "")}`
          )
        );
      });

      resolve();
    });
  });
}
