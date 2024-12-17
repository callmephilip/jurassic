import path from "node:path";
import { copySync } from "@std/fs";

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

  copySync(new URL("../project-template", import.meta.url), projectPath, {
    overwrite: false,
  });
}
