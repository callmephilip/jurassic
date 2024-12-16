import { getConfig } from "jurassic/config.ts";

if (import.meta.main) {
  const config = await getConfig();
  const command = new Deno.Command(".jurassic/clean.py", {
    args: [config.nbsPath],
  });
  const { code, stderr, stdout } = command.outputSync();
  console.log(new TextDecoder().decode(stdout));
  console.error(new TextDecoder().decode(stderr));
  console.log(">>> Code", code);
}
