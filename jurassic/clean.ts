import type { RawCell } from "jurassic/notebooks.ts";
import { loadNb, saveNb } from "jurassic/notebooks.ts";
// 🦕 AUTOGENERATED! DO NOT EDIT! File to edit: clean.ipynb

const reprIdRegex = /(<.*?)( at 0x[0-9a-fA-F]+)(>)/;

const skipOrSub = (x: string): string =>
  x.includes("at 0x") ? x.replace(reprIdRegex, "$1$3") : x;

const cleanCellOutputId = (
  lines: string | string[],
): string | string[] =>
  typeof lines === "string" ? skipOrSub(lines) : lines.map((o) => skipOrSub(o));
const cleanCellOutput = (cell: RawCell, cleanIds: boolean): RawCell => {
  const outputs = cell.outputs || [];

  outputs.forEach((o) => {
    if ("execution_count" in o) {
      o.execution_count = null;
    }

    const data = o.data || {};
    delete data["application/vnd.google.colaboratory.intrinsic+json"];

    for (const k in data) {
      if (k.startsWith("text") && cleanIds) {
        data[k] = cleanCellOutputId(data[k]);
      }
      if (k.startsWith("image") && !k.includes("svg")) {
        data[k] = data[k].trimEnd();
      }
    }

    if (o.text && cleanIds) {
      o.text = cleanCellOutputId(o.text);
    }

    if (o.metadata) {
      delete o.metadata.tags;
    }
  });

  return cell;
};
const cleanCell = (
  cell: RawCell,
  clearAll: boolean,
  allowedMetadataKeys: string[],
  cleanIds: boolean,
): RawCell => {
  if ("execution_count" in cell) {
    cell.execution_count = null;
  }

  if ("outputs" in cell) {
    if (clearAll) {
      cell.outputs = [];
    } else {
      cleanCellOutput(cell, cleanIds);
    }
  }

  if (cell.source && cell.source.length === 1 && cell.source[0] === "") {
    cell.source = [];
  }

  cell.metadata = clearAll ? {} : Object.fromEntries(
    Object.entries(cell.metadata || {})
      .filter(([k]) => allowedMetadataKeys.includes(k)),
  );

  return cell;
};
export const cleanNotebook = async (
  nbPath: string,
  clearAll = false,
  allowedMetadataKeys: string[] = [],
  allowedCellMetadataKeys: string[] = [],
  cleanIds = true,
): Promise<void> => {
  const nb = await loadNb(nbPath);
  const metadataKeys = new Set([
    "kernelspec",
    "jekyll",
    "jupytext",
    "doc",
    "widgets",
    ...allowedMetadataKeys,
  ]);

  const cellMetadataKeys = new Set([
    "hide_input",
    ...allowedCellMetadataKeys,
  ]);

  nb.rawCells.forEach((c) =>
    cleanCell(c, clearAll, Array.from(cellMetadataKeys), cleanIds)
  );

  const kernelName = nb.metadata?.kernelspec?.name;
  if (nb.metadata && kernelName) {
    nb.metadata.kernelspec.display_name = kernelName;
  }

  nb.metadata = Object.fromEntries(
    Object.entries(nb.metadata || {})
      .filter(([k]) => metadataKeys.has(k)),
  );

  // additional cleaning
  nb.rawCells = nb.rawCells.map((c: RawCell) => {
    if (
      c.cell_type !== "code" ||
      !c.source.join("\n").includes("Deno.test")
    ) {
      return c;
    }
    return Object.assign({}, c, {
      outputs: [],
    });
  });

  await saveNb(nb);
};
