/* eslint-disable import/no-extraneous-dependencies */
import spawn from "cross-spawn";

export async function runLinter(): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("./node_modules/.bin/next", ["lint", "--fix"], {
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
        reject({ command: `next lint --fix` });
        return;
      }

      resolve();
    });
  });
}
