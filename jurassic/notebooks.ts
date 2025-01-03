// 🦕 AUTOGENERATED! DO NOT EDIT! File to edit: notebooks.ipynb

import path from "node:path";
import { z } from "zod";
import { findDenoTests } from "jurassic/utils.ts";
const cellOutputSchema = z.object({
  data: z.record(z.any()).optional(),
  text: z.union([z.string(), z.array(z.string())]).optional(),
  metadata: z.record(z.any()).optional(),
  output_type: z.string().optional(),
});

export const isDirective = (ln: string): boolean =>
  ln.replaceAll(" ", "").startsWith("//|");

const rawCellSchema = z
  .object({
    cell_type: z.enum(["code", "markdown"]),
    source: z.array(z.string()),
    outputs: z.array(cellOutputSchema).optional(),
    metadata: z.record(z.any()).optional(),
    execution_count: z.number().nullable().optional(),
  });

const cellSchema = rawCellSchema.transform((data) => {
  return Object.assign(data, {
    isTestCell: data.cell_type === "code" &&
      findDenoTests(data.source.join("\n")).length > 0,
    isExportable: data.cell_type === "code" && data.source.length > 0 &&
      isDirective(data.source[0]) && data.source[0].includes("export"),
  });
});

const nbSchema = z.object({
  filename: z.string(),
  metadata: z.record(z.any()).optional(),
  cells: z.array(cellSchema),
  // TODO: figure out a better way of doing this
  // clean command deals with these so they are out of sync with cells
  // is this a problem? it might be
  rawCells: z.array(rawCellSchema),
});

export type Cell = z.infer<typeof cellSchema>;
export type RawCell = z.infer<typeof rawCellSchema>;
export type Nb = z.infer<typeof nbSchema>;

export const loadNb = async (nbPath: string): Promise<Nb> => {
  const d = JSON.parse(await Deno.readTextFile(nbPath));
  return nbSchema.parse(
    Object.assign(
      { filename: nbPath, rawCells: d.cells },
      d,
    ),
  );
};

export const saveNb = async (nb: Nb): Promise<void> => {
  const { filename, rawCells, metadata } = nb;
  await Deno.writeTextFile(
    filename,
    JSON.stringify(
      { metadata, cells: rawCells, "nbformat": 4, "nbformat_minor": 2 },
      null,
      2,
    ),
  );
};
export const getNbTitle = (nb: Nb): string => {
  const mds = nb.cells.length > 0 && nb.cells[0].cell_type === "markdown"
    ? nb.cells[0].source
    : null;
  const md = mds && mds.length > 0 && mds[0].trim().startsWith("# ")
    ? mds[0]
    : null;
  return md
    ? md.replace(/^# /, "").replaceAll("\n", "").trim()
    : path.basename(nb.filename);
};
export const getCellOutput = (cell: Cell): string => {
  let result = "";
  if (!cell.outputs) return result;
  for (const output of cell.outputs) {
    if (output.text) {
      result += Array.isArray(output.text)
        ? output.text.join("\n")
        : output.text;
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
export const cleanNb = (nbPath: string) => {
  const d = JSON.parse(Deno.readTextFileSync(nbPath));
  Deno.writeTextFileSync(
    nbPath,
    JSON.stringify(
      Object.assign({}, d, {
        cells: d.cells.map((c: Cell) => {
          if (
            c.cell_type !== "code" ||
            !c.source.join("\n").includes("Deno.test")
          ) {
            return c;
          }
          return Object.assign({}, c, {
            outputs: [],
          });
        }),
      }),
    ),
  );
};
