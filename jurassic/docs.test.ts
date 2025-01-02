// 🦕 AUTOGENERATED! DO NOT EDIT! File to edit: docs.ipynb


import path from "node:path";
import type { Config } from "jurassic/config.ts";
import { getExportedDefinitions } from "jurassic/utils.ts";
import { getCellOutput, getNbTitle, loadNb } from "jurassic/notebooks.ts";
import type { Cell, Nb } from "jurassic/notebooks.ts";
import { copySync } from "@std/fs";
const wrapCode = (code: string): string => "```typescript\n" + code + "\n```\n";

export const processCell = (cell: Cell): string => {
  if (cell.cell_type === "markdown") {
    // markdown cells - just show content directly
    return cell.source.join("");
  }

  if (cell.cell_type === "code") {
    // code cells - show code and output
    const code = cell.source.join("");
    const exports = getExportedDefinitions(code);

    if (!exports) {
      return (
        wrapCode(code) +
        "\n" +
        getCellOutput(cell)
      );
    }

    return exports.reduce(
      (acc, e) => acc + "\n" + `## ${e.name}` + "\n\n" + wrapCode(e.signature),
      "",
    );
  }

  return "";
};
const moduleHeader = (): string => `
---
outline: deep
---
`;

const processNb = async (
  nbPath: string,
  moduleName: string,
): Promise<[Nb, string]> => {
  // TODO: make use of moduleName
  console.log("Processing notebook", moduleName);
  const nb = await loadNb(nbPath);
  return [
    nb,
    nb.cells.reduce(
      (acc, cell) => acc + "\n\n" + processCell(cell),
      moduleHeader(),
    ).trim(),
  ];
};
const vitePressConfig = (
  config: Config,
  notebooks: Nb[],
  mds: string[],
): string => {
  const docs = {
    text: "Reference",
    items: [...notebooks].map((nb, i) => ({
      text: getNbTitle(nb),
      link: `/${mds[i].replace(".md", "")}`,
    })).sort((a, b) => a.text.localeCompare(b.text)),
  };
  const c = { ...config.vitepress };
  c.themeConfig.sidebar = [...c.themeConfig.sidebar, docs];

  return `
import { defineConfig } from "vitepress";
// https://vitepress.dev/reference/site-config
export default defineConfig(${JSON.stringify(c, null, 2)});
`.trim();
};
export const generateDocs = async (config: Config): Promise<void> => {
  const notebooksToProcess: string[] = config.notebooks;
  const notebooks: Nb[] = [];
  const mds: string[] = [];

  try {
    await Deno.stat(config.docsOutputPath);
    await Deno.remove(config.docsOutputPath, { recursive: true });
  } catch {
    // noop
  }

  try {
    await Deno.stat(config.docsInputPath);
    copySync(config.docsInputPath, config.docsOutputPath);
  } catch {
    // noop
  }

  // let's go through all notebooks and process them one by one
  for (const notebook of notebooksToProcess) {
    // output module is the same as the input notebook, but with .ts extension
    const outputFile = notebook.replace(".ipynb", ".md");
    mds.push(outputFile);
    // make sure we preserve subdirectories if any
    const outputDir = path.join(
      config.docsOutputPath,
      path.dirname(outputFile),
    );
    await Deno.mkdir(outputDir, { recursive: true });

    const [nb, md] = await processNb(
      path.resolve(config.nbsPath, notebook),
      notebook,
    );
    notebooks.push(nb);
    await Deno.writeTextFile(path.join(config.docsOutputPath, outputFile), md);
  }

  const filesToWrite = {
    ".vitepress/config.mts": vitePressConfig(config, notebooks, mds),
  };

  // create .vitepress directory if it doesn't exist
  try {
    await Deno.stat(path.join(config.docsOutputPath, ".vitepress"));
  } catch {
    await Deno.mkdir(path.join(config.docsOutputPath, ".vitepress"));
  }

  // Write all files in a loop
  for (const [filename, content] of Object.entries(filesToWrite)) {
    await Deno.writeTextFile(
      path.join(config.docsOutputPath, filename),
      content,
    );
  }
};

/** ----------------tests ---------------- **/

import { assert } from 'jsr:@std/assert';
import { getTestConfig } from 'jurassic/config.ts';
import { getProjectRoot } from 'jurassic/utils.ts';
// 🦕 AUTOGENERATED! DO NOT EDIT! File to edit: docs.ipynb





Deno.test("generateDocs", async (t) => {
  // set things up, let's recreate mini project structure inside a temp dir
  const td = await Deno.makeTempDir({});

  // recreate nbs dire in temp dir and copy notebooks there
  await Deno.mkdir(`${td}/nbs`);
  Deno.copyFileSync(
    path.resolve(getProjectRoot(), "nbs/export.ipynb"),
    `${td}/nbs/export.ipynb`,
  );
  // recreate submodule directory and copy hello.ipynb to it
  await Deno.mkdir(`${td}/nbs/submodule`),
    Deno.copyFileSync(
      path.resolve(getProjectRoot(), "nbs/submodule/hello.ipynb"),
      `${td}/nbs/submodule/hello.ipynb`,
    );
  copySync(path.resolve(getProjectRoot(), "docs"), `${td}/docs`);

  await t.step("test generateDocs", async () => {
    await generateDocs(getTestConfig(td));

    // pretty print temp directory structure
    // await Deno.jupyter.display(
    //   {
    //     "text/markdown": "```md\n" + dirListing(td) + "\n```",
    //   },
    //   { raw: true },
    // );

    // make sure output modules are created
    Deno.readTextFile(`${td}/_docs/package.json`);
    Deno.readTextFile(`${td}/_docs/index.md`);
    const vitepressConfig = await Deno.readTextFile(
      `${td}/_docs/.vitepress/config.mts`,
    );
    const exportContent = await Deno.readTextFile(`${td}/_docs/export.md`);
    const submoduleExportContent = await Deno.readTextFile(
      `${td}/_docs/submodule/hello.md`,
    );

    // spot check content inside the output modules
    assert(exportContent.includes("# Export"));
    assert(submoduleExportContent.includes("# Test module"));

    // spot check vitepress config
    assert(vitepressConfig.includes("export"));
    assert(vitepressConfig.includes("hello"));
    // make sure paths do not include nbs base dir
    assert(!vitepressConfig.includes("nbs/export"));
    // make sure .md extensions get removed
    assert(!vitepressConfig.includes("export.md"));
  });
});