import { install } from "../helpers/install";
import { copy } from "../helpers/copy";

import { async as glob } from "fast-glob";
import os from "os";
import fs from "fs/promises";
import path from "path";
import { cyan, bold } from "picocolors";
import { Sema } from "async-sema";

import { GetTemplateFileArgs, InstallTemplateArgs } from "./types";
import { initShadcn, installComponents } from "../helpers/init-shadcn";
import { runLinter } from "../helpers/run-linter";

/**
 * Get the file path for a given file in a template, e.g. "next.config.js".
 */
export const getTemplateFile = ({
  template,
  mode,
  file,
}: GetTemplateFileArgs): string => {
  return path.join(__dirname, template, mode, file);
};

export const SRC_DIR_NAMES = [
  "app",
  "pages",
  "styles",
  "services",
  "components",
  "@types",
  "hooks",
];

/**
 * Install a Next.js internal template to a given `root` directory.
 */
export const installTemplate = async ({
  appName,
  root,
  packageManager,
  isOnline,
  template,
  mode,
  srcDir,
  importAlias,
}: InstallTemplateArgs) => {
  console.log(bold(`Using ${packageManager}.`));

  /**
   * Copy the template files to the target directory.
   */
  console.log("\nInitializing project with template:", template, "\n");
  const templatePath = path.join(__dirname, template, mode);
  const copySource = ["**"];

  await copy(copySource, root, {
    parents: true,
    cwd: templatePath,
    rename(name) {
      switch (name) {
        case "gitignore":
        case "eslintrc.json": {
          return `.${name}`;
        }
        // README.md is ignored by webpack-asset-relocator-loader used by ncc:
        // https://github.com/vercel/webpack-asset-relocator-loader/blob/e9308683d47ff507253e37c9bcbb99474603192b/src/asset-relocator.js#L227
        case "README-template.md": {
          return "README.md";
        }
        default: {
          return name;
        }
      }
    },
  });

  const tsconfigFile = path.join(root, "tsconfig.json");
  await fs.writeFile(
    tsconfigFile,
    (await fs.readFile(tsconfigFile, "utf8"))
      .replace(
        `"@/*": ["./*"]`,
        srcDir ? `"@/*": ["./src/*"]` : `"@/*": ["./*"]`
      )
      .replace(`"@/*":`, `"${importAlias}":`)
  );

  // update import alias in any files if not using the default
  if (importAlias !== "@/*") {
    const files = await glob("**/*", {
      cwd: root,
      dot: true,
      stats: false,
    });
    const writeSema = new Sema(8, { capacity: files.length });
    await Promise.all(
      files.map(async (file) => {
        // We don't want to modify compiler options in [ts/js]config.json
        if (file === "tsconfig.json" || file === "jsconfig.json") return;
        await writeSema.acquire();
        const filePath = path.join(root, file);
        if ((await fs.stat(filePath)).isFile()) {
          await fs.writeFile(
            filePath,
            (await fs.readFile(filePath, "utf8")).replace(
              /@\//g,
              `${importAlias.replace(/\*/g, "")}`
            )
          );
        }
        await writeSema.release();
      })
    );
  }

  if (srcDir) {
    await fs.mkdir(path.join(root, "src"), { recursive: true });
    await Promise.all(
      SRC_DIR_NAMES.map(async (file) => {
        await fs
          .rename(path.join(root, file), path.join(root, "src", file))
          .catch((err) => {
            if (err.code !== "ENOENT") {
              throw err;
            }
          });
      })
    );

    // Change the `Get started by editing pages/index` / `app/page` to include `src`
    const indexPageFile = path.join("src", "app", `page.tsx`);

    await fs.writeFile(
      indexPageFile,
      (await fs.readFile(indexPageFile, "utf8")).replace(
        "app/page",
        "src/app/page"
      )
    );

    const tailwindConfigFile = path.join(root, "tailwind.config.ts");
    await fs.writeFile(
      tailwindConfigFile,
      (await fs.readFile(tailwindConfigFile, "utf8")).replace(
        /\.\/(\w+)\/\*\*\/\*\.\{js,ts,jsx,tsx,mdx\}/g,
        "./src/$1/**/*.{js,ts,jsx,tsx,mdx}"
      )
    );
  }

  /** Create a package.json for the new project and write it to disk. */
  const packageJson: any = {
    name: appName,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
    },
    dependencies: {
      react: "^18",
      "react-dom": "^18",
      next: "14.1.4",
      bcrypt: "^5.1.1",
      zod: "^3.22.4",
      "next-auth": "^4.24.6",
      "@next-auth/prisma-adapter": "^1.0.7",
      "@hookform/resolvers": "^3.3.4",
      "@tanstack/react-query": "^5.24.1",
      "react-hook-form": "^7.50.1",
      nodemailer: "^6.9.13",
      "next-themes": "^0.2.1",
    },
    devDependencies: {
      "@tanstack/eslint-plugin-query": "^5.28.6",
      "@types/bcrypt": "^5.0.2",
      "@types/node": "^20",
      "@types/nodemailer": "^6.4.14",
      "@types/react": "^18",
      "@types/react-dom": "^18",
      "@types/uuid": "^9.0.8",
      "@typescript-eslint/eslint-plugin": "^7.4.0",
      autoprefixer: "^10.0.1",
      eslint: "^8",
      "eslint-config-next": "14.1.4",
      "eslint-plugin-sort": "^3.0.2",
      postcss: "^8",
      tailwindcss: "^3.3.0",
      typescript: "^5",
      "typescript-eslint": "^7.4.0",
    },
  };

  const devDeps = Object.keys(packageJson.devDependencies).length;
  if (!devDeps) delete packageJson.devDependencies;

  await fs.writeFile(
    path.join(root, "package.json"),
    JSON.stringify(packageJson, null, 2) + os.EOL
  );

  console.log("\nInstalling dependencies:");
  for (const dependency in packageJson.dependencies)
    console.log(`- ${cyan(dependency)}`);

  if (devDeps) {
    console.log("\nInstalling devDependencies:");
    for (const dependency in packageJson.devDependencies)
      console.log(`- ${cyan(dependency)}`);
  }

  console.log();

  await install(packageManager, isOnline);

  console.log(`\nStarting shadcn-ui initialization...`);
  await initShadcn(isOnline, root, importAlias, srcDir);

  console.log("\nInstalling shadcn-ui components:");
  await installComponents();

  console.log("\nFinalizing installation...");
  await runLinter();
};

export * from "./types";
