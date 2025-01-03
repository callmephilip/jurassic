import path from "node:path";
import { getConfig } from "jurassic/config.ts";
import { cleanNotebook } from "jurassic/clean.ts";

if (import.meta.main) {
  const config = await getConfig();

  for (const nb of config.notebooks) {
    await cleanNotebook(path.resolve(config.nbsPath, nb));
  }
}
