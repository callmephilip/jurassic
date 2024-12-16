import { exportNb } from "jurassic/export.ts";
import { getConfig } from "jurassic/config.ts";

if (import.meta.main) {
  const args = Deno.args;

  if (args.length !== 1) {
    console.error(
      "Usage: deno run jsr:@jurassic/jurassic/export root_directory",
    );
    Deno.exit(1);
  }

  const config = await getConfig();
  await Deno.stdout.write(
    new TextEncoder().encode(`Using config from: ${config.configPath}\n`),
  );
  await exportNb(args[0], config);

  // check build
  const command = new Deno.Command(Deno.execPath(), {
    args: ["check", `${config.outputPath}/*.ts`],
  });

  const { code, stderr } = await command.output();

  if (code !== 0) {
    console.error(new TextDecoder().decode(stderr));
  }
}
