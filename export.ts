//source ./export.ipynb


import { z } from "npm:zod@^3.23.8";
import path from "node:path";

const cellSchema = z.object({
  cell_type: z.enum(["code", "markdown"]),
  source: z.array(z.string()),
});

const nbSchema = z.object({
  cells: z.array(cellSchema)
});

type Cell = z.infer<typeof cellSchema>;
type Nb = z.infer<typeof nbSchema>;

const is_directive = (ln: string) : boolean => ln.replaceAll(" ", "").startsWith("//|"); 
const is_cell_exportable = (cell: Cell) : boolean => cell.cell_type === "code" && cell.source.length > 0 && is_directive(cell.source[0])
  && cell.source[0].includes("export");

export const exportNb = async (nb_path: string): Promise<void> => {
  const module_name = path.basename(nb_path).replace(".ipynb", ".ts");
  const nb = nbSchema.parse(JSON.parse(await Deno.readTextFile(nb_path)));
  const export_cells = nb.cells.filter(cell => is_cell_exportable(cell));
  await Deno.writeTextFile(
    module_name,
    export_cells.reduce((acc, cell) => acc + cell.source.filter(s => !is_directive(s)).join(""), `//source ${nb_path}\n\n`)
  );
}