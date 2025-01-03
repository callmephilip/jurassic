import { assertEquals } from "jsr:@std/assert";
import path from "npm:path";

Deno.test("init bin", async (t) => {
  const td = await Deno.makeTempDir({});

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

    assertEquals(code, 0);

    Deno.lstatSync(`${td}/newproject`);
    Deno.lstatSync(`${td}/newproject/.github/workflows/publish.yml`);
    Deno.lstatSync(`${td}/newproject/.github/workflows/pr.yml`);
    Deno.lstatSync(`${td}/newproject/.gitignore`);
    Deno.lstatSync(`${td}/newproject/deno.json`);
    Deno.lstatSync(`${td}/newproject/nbs/app.ipynb`);
    Deno.lstatSync(`${td}/newproject/jurassic.json`);
    Deno.lstatSync(`${td}/newproject/mod.ts`);
    Deno.lstatSync(`${td}/newproject/app.test.ts`);
    Deno.lstatSync(`${td}/newproject/docs/package.json`);
    Deno.lstatSync(`${td}/newproject/docs/index.md`);
    Deno.lstatSync(`${td}/newproject/docs/get-started.md`);
    Deno.lstatSync(`${td}/newproject/docs/public/logo.png`);

    Deno.lstatSync(`${td}/newproject/newproject/app.ts`);
    Deno.lstatSync(`${td}/newproject/_docs`);
  });
});
