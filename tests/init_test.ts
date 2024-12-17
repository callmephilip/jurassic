import { assertEquals } from "jsr:@std/assert";
import { dirListing } from "../jurassic/utils.ts";
import path from "npm:path";

Deno.test("init bin", async (t) => {
  // setup temp stuff
  const td = await Deno.makeTempDir({});

  // recreate mini project in temp directory
  //   await Deno.copyFile("./jurassic.json", `${td}/jurassic.json`);
  //   await Deno.copyFile("./deno.json", `${td}/deno.json`);
  //   await Deno.mkdir(`${td}/nbs`);
  //   await Deno.copyFile("./nbs/export.ipynb", `${td}/nbs/export.ipynb`);

  console.log(dirListing(td));

  await t.step("run init bin", () => {
    const { code, stdout, stderr } = new Deno.Command(Deno.execPath(), {
      args: [
        "run",
        "-R",
        "-W",
        "-N",
        "--allow-run",
        path.resolve("./bin/init.ts"),
        "newproject",
      ],
      cwd: td,
    }).outputSync();

    const output = new TextDecoder().decode(stdout);
    const errors = new TextDecoder().decode(stderr);
    console.log("output:", output);
    console.log("errors:", errors);

    assertEquals(code, 1);

    Deno.lstatSync(`${td}/newproject`);
    Deno.lstatSync(`${td}/newproject/deno.json`);
    Deno.lstatSync(`${td}/newproject/nbs/app.ipynb`);
    Deno.lstatSync(`${td}/newproject/jurassic.json`);
    Deno.lstatSync(`${td}/newproject/mod.ts`);
    Deno.lstatSync(`${td}/newproject/docs/package.json`);
    Deno.lstatSync(`${td}/newproject/docs/index.md`);
    Deno.lstatSync(`${td}/newproject/docs/get-started.md`);
    Deno.lstatSync(`${td}/newproject/docs/public/logo.png`);

    // Deno.lstatSync(`${td}/newproject/newproject/app.ts`);

    // // make sure proper config is used
    // const targetConfig = td + "/jurassic.json";
    // assert(
    //   // re: https://github.com/denoland/deno/issues/22309
    //   output.includes("Using config from: " + targetConfig) ||
    //     output.includes("Using config from: " + "/private" + targetConfig)
    // );

    // // check outputs
    // const exportContent = await Deno.readTextFile(`${td}/jurassic/export.ts`);
    // // spot check content inside the output modules
    // assert(exportContent.includes("export const exportNb"));
  });
});
