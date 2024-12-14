---
outline: deep
---

# Locate and Parse notebooks

Homemade Jupyter notebook parser + helper to locate notebooks to parse

## Cell

```typescript
export type Cell = z.infer<typeof cellSchema>;
```

## Nb

```typescript
export type Nb = z.infer<typeof nbSchema>;
```

## loadNb

```typescript
const loadNb = (nbPath: string) => Promise<Nb>;
```

# Get notebook title

Try to get a human readable title for a notebook using the following approach:

- grab the first md cell in the notebook, and return first h1 inside of
- if this fails, return notebook filename

## getNbTitle

```typescript
const getNbTitle = (nb: Nb) => string;
```

# Parse cell output

Jurassic needs to be able to convert individual cell output to test that can be
displayed inside documentation

## getCellOutput

```typescript
const getCellOutput = (cell: Cell) => string;
```

Some cells don't contain any output - return empty strings for those

Cells can output text

Cells can output markdown

## getNotebooksToProcess

```typescript
const getNotebooksToProcess = (notebookPath: string, config: Config) =>
  Promise<string[]>;
```

Let's see what `getNotebooksToProcess` looks like for the current project:
