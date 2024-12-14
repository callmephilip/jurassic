import { generateDocs } from "jurassic/docs.ts";
import { getConfig } from "jurassic/config.ts";

if (import.meta.main) {
  const args = Deno.args;

  if (args.length !== 1) {
    console.error("Usage: deno run jsr:@jurassic/jurassic/docs root_directory");
    Deno.exit(1);
  }

  const config = await getConfig();
  await Deno.stdout.write(
    new TextEncoder().encode(`Using config from: ${config.configPath}\n`),
  );
  await generateDocs(args[0], config);
}
