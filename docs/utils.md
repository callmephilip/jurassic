---
outline: deep
---

## Helpers

Random assorted helpers

## dirListing

```typescript
const dirListing = (dir: string, d: any) => Promise<string>;
```

## getExportedDefinitions

```typescript
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
```