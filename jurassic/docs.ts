import path from "node:path";
import type { Config } from "jurassic/config.ts";
import { getExportedDefinitions } from "jurassic/utils.ts";
import type { Cell, Nb } from "jurassic/notebooks.ts";
import { getCellOutput, getNbTitle, loadNb } from "jurassic/notebooks.ts";
import { copySync } from "@std/fs";
// 🦕 AUTOGENERATED! DO NOT EDIT! File to edit: docs.ipynb

const wrapCode = (code: string): string => "```typescript\n" + code + "\n```\n";

const processCell = (cell: Cell): string => {
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
