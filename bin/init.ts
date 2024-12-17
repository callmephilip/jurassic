import path from "node:path";
import denoJson from "../project-template/deno.json" with { "type": "json"};

if (import.meta.main) {
  const args = Deno.args;

  if (args.length !== 1) {
    console.error(
      "Usage: deno run -R -W jsr:@jurassic/jurassic/init project-name"
    );
    Deno.exit(1);
  }

  const projectName = args[0].replace(/\W/g, "");
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

  await Deno.writeFileSync(
    path.resolve(projectPath, "deno.json"),
    new TextEncoder().encode(JSON.stringify(denoJson))
  );
}
