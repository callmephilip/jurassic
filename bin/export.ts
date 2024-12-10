import { exportNb, getConfig } from "../jurassic/export.ts";

if (import.meta.main) {
  const args = Deno.args;

  if (args.length !== 1) {
    console.error(
      "Usage: deno run jsr:@jurassic/jurassic/export your_module.ipynb"
    );
    Deno.exit(1);
  }

  const config = await getConfig();
  console.log("Using config from:", config.configPath);
  await exportNb(args[0], config);
}
