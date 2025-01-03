import "@std/dotenv/load";

import { getConfig } from "jurassic/config.ts";
import path from "node:path";

if (import.meta.main) {
  const config = await getConfig();
  const results = await Promise.all(
    config.notebooks.map((nb: string) => {
      console.log(`Running ${nb}`);
      const command = new Deno.Command("jupyter", {
        args: [
          "execute",
          "--kernel_name=deno",
          path.resolve(config.nbsPath, nb),
        ],
        stdin: "piped",
        stdout: "piped",
      });
      const child = command.spawn();
      child.stdin.close();
      return child.status;
    }),
  );

  if (results.filter((r) => r.code !== 0).length > 0) {
    throw new Error("Failed to run one or more notebooks");
  }
}
