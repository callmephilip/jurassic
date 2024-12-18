import path from "node:path";

if (import.meta.main) {
  const args = Deno.args;

  if (args.length !== 1) {
    console.error(
      "Usage: deno run --reload -R -W -N --allow-run jsr:@jurassic/jurassic/init project-name",
    );
    Deno.exit(1);
  }

  const { code: jupyterCheck } = await new Deno.Command(Deno.execPath(), {
    args: ["jupyter"],
  }).output();

  if (jupyterCheck !== 0) {
    console.error(
      `Make sure you have deno kernel installed: https://docs.deno.com/runtime/reference/cli/jupyter/`,
    );
    Deno.exit(1);
  }

  const projectName = args[0].replace(/\W/g, "").toLowerCase();
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

  // Directories + files

  Deno.mkdirSync(projectPath);

  // Deno.lstatSync(`${td}/newproject/.github/workflows/docs.yml`);
  // Deno.lstatSync(`${td}/newproject/.github/workflows/publish.yml`);
  // Deno.lstatSync(`${td}/newproject/.gitignore`);

  Deno.writeTextFileSync(
    `${projectPath}/.gitignore`,
    `_docs
.jurassic/env
.ipynb_checkpoints`,
  );

  Deno.mkdirSync(`${projectPath}/.github/workflows`, {
    recursive: true,
  });
  Deno.writeTextFileSync(
    `${projectPath}/.github/workflows/docs.yml`,
    `name: Publish docs

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - uses: denoland/setup-deno@v2
        with:
          deno-version: v2.x
      - name: Set up Python 3.11
        uses: actions/setup-python@v4
        with:
          python-version: 3.11
      - name: Install jupyter notebook
        run: |
          pip install notebook
      - uses: denoland/setup-deno@v2
        with:
          deno-version: v2.x
      - name: Install jupyter deno kernel
        run: deno jupyter --unstable --install
      - name: Run export
        run: deno task build
      - name: Docs
        run: deno task docs
      - name: Install dependencies
        working-directory: ./_docs
        run: pnpm install
      - name: Build with VitePress
        working-directory: ./_docs
        run: pnpm docs:build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: _docs/.vitepress/dist
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`,
  );
  Deno.writeTextFileSync(
    `${projectPath}/.github/workflows/publish.yml`,
    `name: Publish
on:
  push:
    branches:
      - main

jobs:
  publish:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python 3.11
        uses: actions/setup-python@v4
        with:
          python-version: 3.11

      - name: Install jupyter notebook
        run: |
          pip install notebook

      - uses: denoland/setup-deno@v2
        with:
          deno-version: v2.x

      - name: Install jupyter deno kernel
        run: deno jupyter --unstable --install

      - name: Run export
        run: deno task build

      - name: Check if tree is clean
        run: |
          set -ux
          if [[ \`git status --porcelain -uno\` ]]; then
            echo "Code is not in sync.  Please run deno task build locally and then push again"
            git status -uno
            git diff
            exit 1;
          fi
`,
  );

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
      imports: {
        [`${projectName}/`]: `./${projectName}/`,
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
  Deno.writeTextFileSync(
    `${projectPath}/mod.ts`,
    `export * from "./${projectName}/app.ts";`,
  );
  Deno.writeTextFileSync(
    `${projectPath}/app.test.ts`,
    `import { assert } from "jsr:@std/assert";
import { app } from "${projectName}/app.ts";

Deno.test("app", () => {
  assert(app);
});
`,
  );
  Deno.mkdirSync(`${projectPath}/docs`);
  Deno.writeTextFileSync(
    `${projectPath}/docs/package.json`,
    JSON.stringify({
      name: "docs",
      version: "1.0.0",
      description: "",
      main: "index.js",
      scripts: {
        "docs:dev": "vitepress dev --open",
        "docs:build": "vitepress build",
        "docs:preview": "vitepress preview",
      },
      keywords: [],
      author: "",
      license: "ISC",
      devDependencies: {
        vitepress: "^1.5.0",
      },
    }),
  );
  Deno.writeTextFileSync(
    `${projectPath}/docs/index.md`,
    `---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Jurassic"
  text: "Deno apps in Jupyter Notebooks"
  tagline: It's like nbdev for Deno
  actions:
    - theme: brand
      text: Get started
      link: /get-started
  image:
    src: /jurassic.png
    alt: Jurassic
---
`,
  );
  Deno.writeTextFileSync(
    `${projectPath}/docs/get-started.md`,
    `---
outline: deep
---

# Get started

It's easy if you try
`,
  );
  Deno.mkdirSync(`${projectPath}/docs/public`);
  const logo = await fetch(
    "https://place-hold.it/1024x1024.png?text=you%20need%20a%20logo",
  );
  Deno.writeFileSync(
    `${projectPath}/docs/public/logo.png`,
    new Uint8Array(await logo.arrayBuffer()),
  );

  Deno.mkdirSync(`${projectPath}/.jurassic`);

  await Promise.all(
    ["clean.py", "install.py", "runnb.py"].map(async (script) => {
      Deno.writeTextFileSync(
        `${projectPath}/.jurassic/${script}`,
        await (
          await fetch(
            `https://raw.githubusercontent.com/callmephilip/jurassic/refs/heads/main/.jurassic/${script}`,
          )
        ).text(),
      );
      Deno.chmodSync(`${projectPath}/.jurassic/${script}`, 0o755);
    }),
  );

  // Switch to project directory
  Deno.chdir(projectPath);

  // Run build
  const { code: buildCode, stderr: buildError } = await new Deno.Command(
    Deno.execPath(),
    {
      args: ["task", "build"],
    },
  ).output();

  if (buildCode !== 0) {
    console.error(new TextDecoder().decode(buildError));
    Deno.exit(1);
  }

  const { code, stderr } = await new Deno.Command(Deno.execPath(), {
    args: ["task", "docs"],
  }).output();

  if (code !== 0) {
    console.error(new TextDecoder().decode(stderr));
    Deno.exit(1);
  }
}
