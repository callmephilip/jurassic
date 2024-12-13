---
outline: deep
---

# Export

Parse notebook and extract exportable code cells into corresponding TS modules
(directives shamelessly copied from `nbdev`)

Helpers for determining if a given line in a cell is a directive. Directives
look like this:

```ts
//| export
```

Determine if a given cell is exportable. "Exportable" means that its contents
will end up in corresponding ts module.

Process notebook - transfer exportable code from cells into ts module

Main export functionality. `exportNb` should work on both individual notebooks
and directories containing notebooks and subdirectories containing more
notebooks 🕳. `notebookPath` is relative to `config.nbsPath`

## exportNb

```typescript
const exportNb = (notebookPath: string, config: Config) => Promise<void>;
```

## Tests

Let's test export functionality
