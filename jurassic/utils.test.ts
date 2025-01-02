// 🦕 AUTOGENERATED! DO NOT EDIT! File to edit: utils.ipynb


import path from "node:path";
import * as ts from "typescript";
import { loadSync } from "@std/dotenv";
export const md = async (content: string) => {
  await Deno.jupyter.display({ "text/markdown": content }, { raw: true });
};
export const getProjectRoot = (
  dir: string = Deno.cwd(),
  d = 0,
  maxD = 10,
): string => {
  if (d >= maxD) throw new Error("max depth reached");

  try {
    const f = path.join(dir, "deno.json");
    Deno.lstatSync(f);
    return path.dirname(f);
  } catch {
    return getProjectRoot(path.join(dir, "../"), d + 1);
  }
};
export const loadEnv = () => {
  loadSync({ envPath: getProjectRoot() + "/.env", export: true });
};
// create markdown representation of the directory listing files and subdirectories
export const dirListing = (dir: string, d = 0): string => {
  if (d > 10) {
    return "";
  }

  let md = "";
  for (
    const f of [...Deno.readDirSync(dir)].sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  ) {
    md += `${"  ".repeat(d)}- ${f.name}\n`;
    if (f.isDirectory) {
      md += dirListing(path.join(dir, f.name), d + 1);
    }
  }
  return md;
};
export const getNotebooksToProcess = (
  notebookPath: string,
  nbsPath: string,
): string[] => {
  const fullPath = path.join(nbsPath, notebookPath);
  const fileInfo = Deno.statSync(fullPath);
  const notebooksToProcess: string[] = [];

  if (fileInfo.isDirectory) {
    // if target is a directory, let's go through all files/directories inside
    for (
      const file of [...Deno.readDirSync(fullPath)].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    ) {
      if (file.isDirectory) {
        // got another directory? delegate to another getNotebooksToProcess
        const childNbs = getNotebooksToProcess(
          path.join(notebookPath, file.name),
          nbsPath,
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
        path.relative(nbsPath, path.join(fullPath, file.name)),
      );
    }
  }

  return notebooksToProcess;
};
interface SymbolDefinition {
  name: string;
  kind: string;
  signature: string;
  documentation?: string;
  members?: SymbolDefinition[];
}

export function getExportedDefinitions(sourceCode: string): SymbolDefinition[] {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
  );

  const definitions: SymbolDefinition[] = [];

  function getNodeSignature(node: ts.Node): string {
    return sourceCode.slice(node.getStart(), node.getEnd()).trim();
  }

  function visit(node: ts.Node) {
    if (
      // @ts-ignore Property 'modifiers' does not exist on type 'Node'.
      node.modifiers?.some(
        (m: ts.Modifier) => m.kind === ts.SyntaxKind.ExportKeyword,
      )
    ) {
      if (ts.isFunctionDeclaration(node) && node.name) {
        definitions.push({
          name: node.name.text,
          kind: "function",
          signature: getNodeSignature(node),
        });
      } else if (ts.isClassDeclaration(node) && node.name) {
        const members = node.members
          .map((member) => {
            if (ts.isMethodDeclaration(member) && member.name) {
              return {
                name: member.name.getText(),
                kind: "method",
                signature: getNodeSignature(member),
              };
            }
            return null;
          })
          .filter(Boolean) as SymbolDefinition[];

        definitions.push({
          name: node.name.text,
          kind: "class",
          signature: getNodeSignature(node),
          members,
        });
      } else if (ts.isInterfaceDeclaration(node) && node.name) {
        definitions.push({
          name: node.name.text,
          kind: "interface",
          signature: getNodeSignature(node),
        });
      } else if (ts.isTypeAliasDeclaration(node) && node.name) {
        definitions.push({
          name: node.name.text,
          kind: "type",
          signature: getNodeSignature(node),
        });
      } else if (ts.isVariableStatement(node)) {
        node.declarationList.declarations.forEach((declaration) => {
          if (
            ts.isVariableDeclaration(declaration) &&
            ts.isIdentifier(declaration.name) &&
            // @ts-ignore Argument of type 'Expression | undefined' is not assignable to parameter of type 'Node'.
            ts.isArrowFunction(declaration.initializer)
          ) {
            // Format: const name = (params) => returnType
            const params = declaration.initializer.parameters
              .map((p) => `${p.name.getText()}: ${p.type?.getText() ?? "any"}`)
              .join(", ");
            const returnType = declaration.initializer.type?.getText() ?? "any";

            definitions.push({
              name: declaration.name.text,
              kind: "function",
              signature:
                `const ${declaration.name.text} = (${params}) => ${returnType}`,
            });
          }
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return definitions;
}
interface TestInfo {
  name: string;
  body: string;
  location: {
    start: number;
    end: number;
  };
}

export const findDenoTests = (sourceCode: string): TestInfo[] => {
  const sourceFile = ts.createSourceFile(
    "test.ts",
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
  );

  const tests: TestInfo[] = [];

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const expression = node.expression;

      if (
        ts.isPropertyAccessExpression(expression) &&
        ts.isIdentifier(expression.expression) &&
        expression.expression.text === "Deno" &&
        ts.isIdentifier(expression.name) &&
        expression.name.text === "test"
      ) {
        const testName = node.arguments[0];
        const testFn = node.arguments[1];

        if (ts.isStringLiteral(testName)) {
          tests.push({
            name: testName.text,
            body: testFn.getText(),
            location: {
              start: node.getStart(),
              end: node.getEnd(),
            },
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return tests;
};
export const removeDuplicateImports = (sourceCode: string): string => {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
  );

  // Track unique imports
  const imports = new Map<string, Set<string>>();
  const importNodes: ts.ImportDeclaration[] = [];

  // Visit nodes to collect imports
  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      importNodes.push(node);

      const source = node.moduleSpecifier.getText().replace(/['"]/g, "");
      if (!imports.has(source)) {
        imports.set(source, new Set());
      }

      if (node.importClause) {
        // Named imports
        if (
          node.importClause.namedBindings &&
          ts.isNamedImports(node.importClause.namedBindings)
        ) {
          node.importClause.namedBindings.elements.forEach((element) => {
            imports.get(source)?.add(element.name.text);
          });
        }
        // Default import
        if (node.importClause.name) {
          imports.get(source)?.add("default");
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  // Generate new import statements
  const newImports: string[] = [];
  for (const [source, specifiers] of imports) {
    if (specifiers.size === 0) {
      newImports.push(`import '${source}';`);
      continue;
    }

    const hasDefault = specifiers.delete("default");
    const namedImports = Array.from(specifiers).sort().join(", ");

    let importStr = "import ";
    if (hasDefault) {
      importStr += `${source.split("/").pop()} `;
    }
    if (namedImports) {
      importStr += hasDefault ? `, { ${namedImports} }` : `{ ${namedImports} }`;
    }
    importStr += ` from '${source}';`;
    newImports.push(importStr);
  }

  // Replace old imports with new ones
  let result = sourceCode;
  const sortedNodes = importNodes.sort((a, b) => b.getStart() - a.getStart());
  for (const node of sortedNodes) {
    result = result.slice(0, node.getStart()) + result.slice(node.getEnd());
  }

  return newImports.join("\n") + "\n" + result.trim();
};

/** ----------------tests ---------------- **/

import { assert, assertEquals } from 'jsr:@std/assert';
// 🦕 AUTOGENERATED! DO NOT EDIT! File to edit: utils.ipynb



Deno.test("findDenoTests", () => {
  assert(
    findDenoTests(`
    Deno.test("test1", () => { assert(1 === 1); });  
  `).length === 1,
  );
  assert(
    findDenoTests(
      `console.log('Deno.test("test1", () => { assert(1 === 1); })')`,
    ).length === 0,
  );
});

Deno.test("removeDuplicateImports", () => {
  assertEquals(
    removeDuplicateImports(`
import { assertEquals } from "jsr:@std/assert";

Deno.test("t1", () => {});

import { assertEquals } from "jsr:@std/assert";

Deno.test("t2", () => {});
`),
    `import { assertEquals } from 'jsr:@std/assert';
Deno.test("t1", () => {});



Deno.test("t2", () => {});`,
  );
});