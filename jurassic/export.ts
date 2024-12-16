// 🦕 AUTOGENERATED! DO NOT EDIT! File to edit: export.ipynb

import path from "node:path";
import { loadNb } from "jurassic/notebooks.ts";
import { getNotebooksToProcess } from "jurassic/utils.ts";
import type { Config } from "jurassic/config.ts";
import type { Cell } from "jurassic/notebooks.ts";
const isDirective = (ln: string): boolean =>
  ln.replaceAll(" ", "").startsWith("//|");
const isCellExportable = (cell: Cell): boolean =>
  cell.cell_type === "code" &&
  cell.source.length > 0 &&
  isDirective(cell.source[0]) &&
  cell.source[0].includes("export");
const moduleHeader = (moduleName: string): string =>
  `// 🦕 AUTOGENERATED! DO NOT EDIT! File to edit: ${moduleName}\n\n`;

const processNb = async (
  nbPath: string,
  moduleName: string,
): Promise<string> => {
  const nb = await loadNb(nbPath);
  // we only need exportable cells
  const exportCells = nb.cells.filter((cell) => isCellExportable(cell));
  return exportCells.reduce(
    // get rid of directives, we want code only
    (acc, cell) => acc + cell.source.filter((s) => !isDirective(s)).join(""),
    moduleHeader(moduleName),
  );
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
    await Deno.writeTextFile(
      path.join(config.outputPath, outputFile),
      await processNb(path.resolve(config.nbsPath, notebook), notebook),
    );
  }
};
