import path from "node:path";
import denoJson from "../project-template/deno.json" with { "type": "json" };
import nb from "../project-template/app.json" with { "type": "json" };

import { fetch as fileFetch } from "https://deno.land/x/file_fetch@0.2.0/mod.ts";

const loadProjectTemplateFile = async (p: string): Promise<string> => {
  const r = await fileFetch(
    new URL(`../project-template/${p}`, import.meta.url),
  );

  if (!r.ok) {
    throw new Error(`Failed to fetch ${p}`);
  }

  return r.text();
};

if (import.meta.main) {
  const args = Deno.args;

  if (args.length !== 1) {
    console.error(
      "Usage: deno run --reload -R -W -N jsr:@jurassic/jurassic/init project-name",
    );
    Deno.exit(1);
  }

  const projectName = args[0].replace(/\W/g, "").toLowerCase();
  console.log("Gonna create a new project", Deno.cwd(), projectName);
  const projectPath = path.resolve(Deno.cwd(), projectName);

  try {
    await Deno.lstat(projectPath);
    console.error(`Error: ${projectPath} already exists`);
    Deno.exit(1);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }

  console.log(">>>>>>>>>>>>>>>> Creating project", projectPath);
  await Deno.mkdir(projectPath);

  // donwload file from https://place-hold.it/1024x1024?text=you%20need%20a%20logo and save it as logo.png
  // const logo = await fetch("https://place-hold.it/1024x1024.png?text=you%20need%20a%20logo");
  // const logoBuffer = await logo.arrayBuffer();
  // await Deno.writeFile(
  //   path.resolve(projectPath, "logo.png"),
  //   new Uint8Array(logoBuffer),
  // );

  Deno.writeFileSync(
    path.resolve(projectPath, "deno.json"),
    new TextEncoder().encode(JSON.stringify(denoJson)),
  );

  // change cwd to projectPath
  Deno.chdir(projectPath);

  // set up dir for nbs
  Deno.mkdirSync("nbs");
  Deno.writeTextFileSync(
    path.resolve("nbs", "app.ipynb"),
    JSON.stringify(nb),
  );

  // set up dir for docs
  Deno.mkdirSync("docs");

  Deno.writeTextFileSync(
    "docs/index.md",
    await loadProjectTemplateFile("docs/index.md"),
  );
}
