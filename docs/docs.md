---
outline: deep
---

# Docs

Generate documentation for the project. Extract MD cells from all the notebooks
and turn them into a doc site powered by [Vitepress](https://vitepress.dev/)
hosted on Github Pages.

The following cells are considered document cells:

- all markdown cells
- code cells that do not have `//| export` directive: we want to display code
  from these cells as part of the document alongside their output; this is
  useful for demoing functionality and showing tests results?

## isDocCell

```typescript
const isDocCell = (cell: Cell) => boolean;
```

## processCell

```typescript
const processCell = (cell: Cell) => string;
```

# Setup docs project structure

Docs are build using Vitepress. We need to setup some basic scaffolding for it
to work:

- landing page defined in `index.md`

- `package.json` with deps and scripts

- VitePress config `.vitepress/config.mts`

- `.gitignore`

- docs flow
  - create docs dir
  - init vitepress inside
    - package.json
    - .gitignore
    - .vitepress dir
- populate .vitepress/config.mts based on settings and layout
- extract md from all notebooks and put in corresponding md files in docs

## generateDocs

```typescript
const generateDocs = (notebookPath: string, config: Config) => Promise<void>;
```

# Tests

Test doc generator
