// 🦕 AUTOGENERATED! DO NOT EDIT! File to edit: notebooks.ipynb

import path from "node:path";
import { z } from "zod";
import type { Config } from "jurassic/config.ts";
const cellOutputDataSchema = z.object({
  "text/markdown": z.array(z.string()).optional(),
  "text/plain": z.array(z.string()).optional(),
});

const cellOutputSchema = z.object({
  text: z.array(z.string()).optional(),
  data: cellOutputDataSchema.optional(),
});

const cellSchema = z.object({
  cell_type: z.enum(["code", "markdown"]),
  source: z.array(z.string()),
  outputs: z.array(cellOutputSchema).optional(),
});
const nbSchema = z.object({ cells: z.array(cellSchema) });

export type Cell = z.infer<typeof cellSchema>;
export type Nb = z.infer<typeof nbSchema>;

export const loadNb = async (nbPath: string): Promise<Nb> =>
  nbSchema.parse(JSON.parse(await Deno.readTextFile(nbPath)));
export const getCellOutput = (cell: Cell): string => {
  let result = "";
  if (!cell.outputs) return result;
  for (const output of cell.outputs) {
    if (output.text) {
      result += output.text.join("\n");
    }
    if (output.data) {
      const c = output.data["text/markdown"] || output.data["text/plain"] || [];
      for (const line of c) {
        result += line;
      }
    }
  }
  return result;
};
export const getNotebooksToProcess = async (
  notebookPath: string,
  config: Config,
): Promise<string[]> => {
  const fullPath = path.join(config.nbsPath, notebookPath);
  const fileInfo = await Deno.stat(fullPath);
  const notebooksToProcess: string[] = [];

  if (fileInfo.isDirectory) {
    // if target is a directory, let's go through all files/directories inside
    for await (const file of await Deno.readDir(fullPath)) {
      if (file.isDirectory) {
        // got another directory? delegate to another getNotebooksToProcess
        const childNbs = await getNotebooksToProcess(
          path.join(notebookPath, file.name),
          config,
        );
        for (const nb of childNbs) {
          notebooksToProcess.push(nb);
        }
        continue;
      }

      // we are only interested in notebooks
      if (!file.name.endsWith(".ipynb")) continue;

      // relative path only, puhleeze
      notebooksToProcess.push(
        path.relative(config.nbsPath, path.join(fullPath, file.name)),
      );
    }
  }

  return notebooksToProcess;
};
