import path from "node:path";
import { getConfig } from "jurassic/config.ts";
import { cleanNotebook } from "jurassic/clean.ts";

if (import.meta.main) {
  const config = await getConfig();

  for (const nb of config.notebooks) {
    await cleanNotebook(path.resolve(config.nbsPath, nb));
  }

  // const command = new Deno.Command(".jurassic/clean.py", {
  //   args: [config.nbsPath],
  // });
  // const { code, stderr, stdout } = command.outputSync();
  // console.log(new TextDecoder().decode(stdout));
  // console.error(new TextDecoder().decode(stderr));
  // console.log(">>> Code", code);
  // if (code !== 0) {
  //   throw new Error("Failed to clean notebooks");
  // }
}
