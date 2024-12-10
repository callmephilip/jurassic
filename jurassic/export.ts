//source /Users/philip/projects/jurassic/nbs/export.ipynb


import { z } from "npm:zod@^3.23.8";
import path from "node:path";
const configSchema: z.Schema = z.object({
  configPath: z.string(),
  nbsPath: z.string().default("."),
  outputPath: z.string().default("."),
});

export type Config = z.infer<typeof configSchema>;
const findConfig = async ( dir: string = Deno.cwd(), d = 0, config = "jurassic.json", maxD = 10): Promise<string> => {
  if (d >= maxD) { throw new Error("max depth reached"); }

  try {
    const f = path.join(dir, config);
    await Deno.lstat(f);
    return f;
  } catch {
    return findConfig(path.join(dir, "../"), d + 1);
  }
};
export const getConfig = async (): Promise<Config> => {
  const cf = await findConfig();
  const dcf = path.dirname(cf);
  const c = configSchema.parse(Object.assign({ configPath: cf }, JSON.parse(await Deno.readTextFile(cf))));
  c.nbsPath = path.join(dcf, c.nbsPath);
  c.outputPath = path.join(dcf, c.outputPath);
  return c;
};
const cellSchema = z.object({ cell_type: z.enum(["code", "markdown"]), source: z.array(z.string())  });
const nbSchema = z.object({ cells: z.array(cellSchema) });

type Cell = z.infer<typeof cellSchema>;
type Nb = z.infer<typeof nbSchema>;
const isDirective = (ln: string): boolean => ln.replaceAll(" ", "").startsWith("//|");

const isCellExportable = (cell: Cell): boolean =>
  cell.cell_type === "code" &&
  cell.source.length > 0 &&
  isDirective(cell.source[0]) &&
  cell.source[0].includes("export");
const processNb = async (nbPath: string): Promise<string> => {
  const nb = nbSchema.parse(JSON.parse(await Deno.readTextFile(nbPath)));
  // we only need exportable cells
  const exportCells = nb.cells.filter((cell) => isCellExportable(cell));
  return exportCells.reduce(
    // get rid of directives, we want code only
    (acc, cell) => acc + cell.source.filter((s) => !isDirective(s)).join(""),
    `//source ${nbPath}\n\n`
  );
}
export const exportNb = async (notebookPath: string, config: Config): Promise<void> => {
  const fullPath = path.join(config.nbsPath, notebookPath);
  const fileInfo = await Deno.stat(fullPath);
  const notebooksToProcess: string[] = [];

  if (fileInfo.isDirectory) {
    // if target is a directory, let's go through all files/directories inside
    for await (const file of await Deno.readDir(fullPath)) {
      if (file.isDirectory) {
        // got another directory? delegate to another exportNb
        await exportNb(path.join(notebookPath, file.name), config);
        continue;
      }

      // we are only interested in notebooks
      if (!file.name.endsWith(".ipynb")) { continue; }

      // relative path only, puhleeze
      notebooksToProcess.push(
        path.relative(config.nbsPath, path.join(fullPath, file.name))
      );
    }
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
      await processNb(path.resolve(config.nbsPath, notebook))
    );
  }
};

// create markdown representation of the directory listing files and subdirectories
export const dirListing = async (dir: string, d = 0): Promise<string> => {
  if (d > 10) {
    return "";
  }

  let md = "";
  for await (const f of Deno.readDir(dir)) {
    md += `${"  ".repeat(d)}- ${f.name}\n`;
    if (f.isDirectory) {
      md += await dirListing(path.join(dir, f.name), d + 1);
    }
  }
  return md;
};