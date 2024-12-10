import { z } from "zod";
import { exportNb, getConfig } from "../jurassic/export.ts";

const denoJsonSchema = z.object({
  version: z.string(),
});

if (import.meta.main) {
  const { version } = denoJsonSchema.parse(
    JSON.parse(await Deno.readTextFile("deno.json")),
  );
  const args = Deno.args;

  if (args.length !== 1) {
    console.error(
      "Usage: deno run jsr:@jurassic/jurassic/export root_directory",
    );
    Deno.exit(1);
  }

  const config = await getConfig();
  await Deno.stdout.write(
    new TextEncoder().encode(`Jurassic version: ${version}\n`),
  );
  await Deno.stdout.write(
    new TextEncoder().encode(`Using config from: ${config.configPath}\n`),
  );
  await exportNb(args[0], config);
}
