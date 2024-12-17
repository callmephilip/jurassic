import path from "node:path";

if (import.meta.main) {
  const args = Deno.args;

  if (args.length !== 1) {
    console.error(
      "Usage: deno run --reload -R -W -N jsr:@jurassic/jurassic/init project-name",
    );
    Deno.exit(1);
  }

  const projectName = args[0].replace(/\W/g, "").toLowerCase();
  console.log("Gonna create a new project", Deno.cwd(), projectName);
  const projectPath = path.resolve(Deno.cwd(), projectName);

  try {
    await Deno.lstat(projectPath);
    console.error(`Error: ${projectPath} already exists`);
    Deno.exit(1);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }

  Deno.mkdirSync(projectPath);
  Deno.writeTextFileSync(
    `${projectPath}/deno.json`,
    JSON.stringify({
      version: "0.1.0",
      license: "MIT",
      tasks: {
        build:
          "deno run -A --reload jsr:@jurassic/jurassic/export . && deno task runnbs && deno lint && deno fmt && deno task clean && deno test --allow-all",
        clean:
          "deno run --allow-read --allow-env --allow-write --allow-run jsr:@jurassic/jurassic/clean",
        docs:
          "deno run -A --reload jsr:@jurassic/jurassic/docs . && deno lint && deno fmt",
        runnbs:
          "deno run --allow-read --allow-env --allow-run jsr:@jurassic/jurassic/runnbs",
      },
      exports: {
        ".": "./mod.ts",
      },
      publish: {
        exclude: ["nbs/", "docs/"],
      },
      lint: {
        exclude: ["_docs", "docs"],
      },
    }),
  );
  Deno.mkdirSync(`${projectPath}/nbs`);
  Deno.writeTextFileSync(
    `${projectPath}/nbs/app.ipynb`,
    JSON.stringify({
      cells: [
        {
          cell_type: "markdown",
          metadata: {},
          source: ["# This is your app\n", "\n", "Let's get cranking"],
        },
        {
          cell_type: "code",
          execution_count: null,
          metadata: {},
          outputs: [],
          source: [
            "//| export\n",
            "\n",
            "export const app = () => {\n",
            '  console.log("Hello, World!");\n',
            "};",
          ],
        },
      ],
      metadata: {
        kernelspec: {
          display_name: "Deno",
          language: "typescript",
          name: "deno",
        },
        language_info: {
          name: "typescript",
        },
      },
      nbformat: 4,
      nbformat_minor: 2,
    }),
  );
  // write jurassic.json
  Deno.writeTextFileSync(
    `${projectPath}/jurassic.json`,
    JSON.stringify({
      nbsPath: "nbs",
      outputPath: projectName,
      docsInputPath: "docs",
      docsOutputPath: "_docs",
      vitepress: {
        title: projectName,
        description: `${projectName} docs`,
        base: "/jurassic/",
        cleanUrls: true,
        themeConfig: {
          search: {
            provider: "local",
          },
          logo: "/logo.png",
          nav: [],
          sidebar: [
            {
              text: "Guides",
              items: [
                {
                  text: "Get started",
                  link: "/get-started",
                },
              ],
            },
          ],
          socialLinks: [
            {
              icon: "github",
              link: "https://github.com/callmephilip/jurassic",
            },
          ],
        },
      },
    }),
  );

  // console.log(import.meta.resolve("../project-template"));
  // copySync(new URL("../project-template", import.meta.url), projectPath, {
  //   overwrite: false,
  // });
}
