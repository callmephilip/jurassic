import { assertEquals } from "jsr:@std/assert";

Deno.test("export bin", async (t) => {
  // setup temp stuff

  await t.step("run export bin", async () => {
    const command = new Deno.Command(Deno.execPath(), {
      args: ["run", "-A", "./bin/export.ts"],
    });
    const { code, stdout, stderr } = command.outputSync();

    assertEquals(code, 0);

    // const p = Deno.run({
    //   cmd: ["deno", "run", "-A", "./bin/export.ts"],
    //   stdout: "piped",
    //   stderr: "piped",
    // });

    // const { code } = await p.status();
    // const rawOutput = await p.output();
    // const output = new TextDecoder().decode(rawOutput);

    // p.close();

    // t.assertEquals(code, 0);
    // t.assertEquals(output, "");
  });
});
