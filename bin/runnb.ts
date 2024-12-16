// import { exportNb } from "jurassic/export.ts";
// import { getConfig } from "jurassic/config.ts";

// if (import.meta.main) {
//   const args = Deno.args;
//   const command = new Deno.Command("python", {
//     args: [".jurassic/install.py", "--env_path=.jurassic/env"],
//   });
//   const { code, stderr } = command.outputSync();

//   if (code !== 0) {
//     console.assert("world\n" === new TextDecoder().decode(stderr));
//     throw new Error("Failed to run notebooks");
//   }
// }
