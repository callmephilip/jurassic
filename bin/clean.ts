import path from "node:path";
import { getConfig } from "jurassic/config.ts";
import { cleanNb } from "jurassic/notebooks.ts";

if (import.meta.main) {
  const config = await getConfig();
  const command = new Deno.Command(".jurassic/clean.py", {
    args: [config.nbsPath],
  });
  const { code, stderr, stdout } = command.outputSync();
  console.log(new TextDecoder().decode(stdout));
  console.error(new TextDecoder().decode(stderr));
  console.log(">>> Code", code);
  if (code !== 0) {
    throw new Error("Failed to clean notebooks");
  }

  // additional clean up
  for (const nb of config.notebooks) {
    await cleanNb(path.resolve(config.nbsPath, nb));
  }
}
