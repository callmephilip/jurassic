import "@std/dotenv/load";
import { retry } from "@std/async";
import { getConfig } from "jurassic/config.ts";
import path from "node:path";

if (import.meta.main) {
  const config = await getConfig();
  await Promise.all(
    config.notebooks.map((nb: string) => {
      console.log(`Running ${nb}`);
      const fn = async () => {
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

        const r = await child.status;

        if (!r.success) {
          throw new Error(`Failed to run notebook: ${nb}`);
        }
      };
      return retry(fn, { maxAttempts: 3, minTimeout: 100 });
    }),
  );
}
