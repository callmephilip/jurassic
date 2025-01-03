// 🦕 AUTOGENERATED! DO NOT EDIT! File to edit: export.ipynb

import path from "node:path";
import { isDirective, loadNb } from "jurassic/notebooks.ts";
import {
  getNotebooksToProcess,
  removeDuplicateImports,
} from "jurassic/utils.ts";
import type { Config } from "jurassic/config.ts";
const moduleHeader = (moduleName: string): string =>
  `// 🦕 AUTOGENERATED! DO NOT EDIT! File to edit: ${moduleName}\n\n`;

const processNb = async (
  nbPath: string,
  moduleName: string,
): Promise<string[]> => {
  const nb = await loadNb(nbPath);
  // we only need exportable cells
  const exportCells = nb.cells.filter((cell) => cell.isExportable);
  const testCells = nb.cells.filter((cell) => cell.isTestCell);
  return [
    exportCells.reduce(
      // get rid of directives, we want code only
      (acc, cell) => acc + cell.source.filter((s) => !isDirective(s)).join(""),
      moduleHeader(moduleName),
    ),
    testCells.length !== 0
      ? removeDuplicateImports(
        testCells.reduce(
          (acc, cell) => acc + cell.source.join(""),
          moduleHeader(moduleName),
        ),
      )
      : "",
  ];
};
export const exportNb = async (
  notebookPath: string,
  config: Config,
): Promise<void> => {
  const notebooksToProcess: string[] = getNotebooksToProcess(
    notebookPath,
    config.nbsPath,
  );

  try {
    await Deno.stat(config.outputPath);
    await Deno.remove(config.outputPath, { recursive: true });
  } catch {
    // noop
  }

  // let's go through all notebooks and process them one by one
  for (const notebook of notebooksToProcess) {
    // output module is the same as the input notebook, but with .ts extension
    const outputFile = notebook.replace(".ipynb", ".ts");
    // make sure we preserve subdirectories if any
    const outputDir = path.join(config.outputPath, path.dirname(outputFile));
    await Deno.mkdir(outputDir, { recursive: true });

    const [moduleCode, testCode] = await processNb(
      path.resolve(config.nbsPath, notebook),
      notebook,
    );

    await Deno.writeTextFile(
      path.join(config.outputPath, outputFile),
      moduleCode,
    );
    if (testCode) {
      await Deno.writeTextFile(
        path.join(config.outputPath, outputFile.replace(".ts", ".test.ts")),
        [moduleCode, "/** ----------------tests ---------------- **/", testCode]
          .join("\n\n"),
      );
    }
  }
};

/** ----------------tests ---------------- **/

import { assert } from "jsr:@std/assert";
import { getTestConfig } from "jurassic/config.ts";
import { getProjectRoot } from "jurassic/utils.ts";
// 🦕 AUTOGENERATED! DO NOT EDIT! File to edit: export.ipynb

Deno.test("export", async (t) => {
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

  await t.step("test export", async () => {
    await exportNb("./", getTestConfig(td));

    // make sure output modules are created
    const exportContent = await Deno.readTextFile(`${td}/jurassic/export.ts`);
    const submoduleExportContent = await Deno.readTextFile(
      `${td}/jurassic/submodule/hello.ts`,
    );

    // spot check content inside the output modules
    assert(exportContent.includes("export const exportNb"));
    assert(submoduleExportContent.includes("export const foo"));

    // pretty print temp directory structure
    // await Deno.jupyter.display({
    //   "text/markdown": "```md\n" + dirListing(td) + "\n```",
    // }, { raw: true });
  });
});
