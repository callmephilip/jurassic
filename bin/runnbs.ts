import { getConfig } from "jurassic/config.ts";
import path from "node:path";

const envPath = ".jurassic/env";

if (import.meta.main) {
  const config = await getConfig();
  const command = new Deno.Command("python", {
    args: [".jurassic/install.py", `--env_path=${envPath}`],
  });
  const { code, stderr } = command.outputSync();

  if (code !== 0) {
    console.assert("world\n" === new TextDecoder().decode(stderr));
    throw new Error("Failed to run notebooks");
  }

  for (const nb of config.notebooks) {
    console.log(`Running notebook: ${nb}`);
    const command = new Deno.Command(".jurassic/runnb.py", {
      args: [path.resolve(config.nbsPath, nb), `--nbs_path=${config.nbsPath}`],
    });
    const { code, stderr, stdout } = command.outputSync();
    console.log(new TextDecoder().decode(stdout));
    console.error(new TextDecoder().decode(stderr));
    console.log(">>> Code", code);
  }
}
