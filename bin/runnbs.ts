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

  const results = await Promise.all(
    config.notebooks.map((nb: string) => {
      const command = new Deno.Command(".jurassic/runnb.py", {
        args: [
          path.resolve(config.nbsPath, nb),
          `--nbs_path=${config.nbsPath}`,
        ],
        stdin: "piped",
        stdout: "piped",
      });
      const child = command.spawn();

      // open a file and pipe the subprocess output to it.
      // child.stdout.pipeTo(
      //   Deno.openSync("output", { write: true, create: true }).writable,
      // );

      // manually close stdin
      child.stdin.close();
      return child.status;
    }),
  );

  if (results.filter((r) => r.code !== 0).length > 0) {
    throw new Error("Failed to run one or more notebooks");
  }
}
