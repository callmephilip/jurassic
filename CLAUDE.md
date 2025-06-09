# CLAUDE.md - Jurassic Development Guide

This document provides comprehensive instructions for Claude Code when working with the Jurassic codebase.

## Project Overview

Jurassic is a development toolkit for building and shipping software using Jupyter notebooks with Deno. It's inspired by nbdev and allows developers to write code in `.ipynb` notebooks which get automatically exported to TypeScript modules.

## Core Architecture

### Key Directories
- `nbs/` - Jupyter notebooks containing source code and documentation
- `jurassic/` - Auto-generated TypeScript modules from notebooks (DO NOT EDIT MANUALLY)
- `bin/` - CLI command implementations
- `docs/` - Static documentation content
- `_docs/` - Generated VitePress documentation
- `tests/` - Integration tests for CLI commands

### Configuration
- `jurassic.json` - Main project configuration file
- `deno.json` - Deno configuration with tasks and dependencies

## Development Workflow

### 1. Notebook-First Development
- **Primary source code lives in `.ipynb` notebooks in `nbs/`**
- All `.ts` files in `jurassic/` are auto-generated - **NEVER edit these directly**
- Use `//| export` directive to mark cells for export to TypeScript modules
- Use standard Deno test syntax in notebooks for testing

### 2. Special Directives
- `//| export` - Marks code cells to be exported to TypeScript modules
- Test cells automatically create `.test.ts` files alongside modules

### 3. Build Process
The build process follows this sequence:
1. Export notebooks to TypeScript (`deno task export` or `deno run -A bin/export.ts`)
2. Run notebooks to execute any dynamic content (`deno task runnbs`)
3. Type check, lint, format (`deno check`, `deno lint`, `deno fmt`)
4. Clean up temporary files (`deno task clean`)
5. Run tests (`deno test`)

## Important Commands

### Development Tasks
```bash
# Full build process (export, run, check, lint, format, clean, test)
deno task build

# Export notebooks to TypeScript modules
deno task export
# or
deno run -A bin/export.ts

# Run all notebooks
deno task runnbs

# Generate documentation
deno task docs

# Clean generated files
deno task clean

# Development docs server
deno task docs:dev
```

### Testing
- Run tests: `deno test --allow-all --env-file`
- Tests use `jsr:@std/assert` for assertions
- Integration tests in `tests/` directory test CLI commands
- Unit tests are embedded in notebooks and exported to `.test.ts` files

## Key Patterns and Conventions

### Code Organization
- Each notebook maps to a corresponding TypeScript module
- Notebooks should contain both implementation and documentation
- Use markdown cells for documentation that becomes part of generated docs

### Import Patterns
- Internal imports use `jurassic/` path mapping (defined in deno.json)
- External dependencies are imported from JSR or npm as configured in deno.json

### Testing Patterns
- Tests are written directly in notebook cells
- Use `Deno.test()` syntax within notebooks
- Integration tests create temporary directories and test CLI commands
- Always clean up test artifacts

## JDawg AI Assistant

The project includes "JDawg" - an AI coding assistant that:
- Uses Claude API (requires `ANTHROPIC_API_KEY` environment variable)
- Provides context-aware help within notebooks
- Can assist with coding tasks and documentation
- Usage: `j.initialize(notebookPath)` then use `j`template string`` for queries

## Working with Documentation

### Documentation Generation
- Docs are generated from notebooks and markdown files in `docs/`
- Uses VitePress for static site generation
- Configuration in `jurassic.json` under `vitepress` section
- Generated docs output to `_docs/` directory

### Documentation Patterns
- Notebooks serve dual purpose: source code + documentation
- Markdown cells in notebooks become documentation content
- Additional static content in `docs/` directory

## CLI Structure

The project provides several CLI commands via `bin/` directory:
- `init` - Bootstrap new projects
- `export` - Export notebooks to TypeScript
- `clean` - Clean generated files
- `docs` - Generate documentation
- `runnbs` - Execute notebooks

## Environment Setup

### Required Dependencies
- Deno 2.0+ with Jupyter kernel support
- Node.js/pnpm for documentation development (`docs:dev` task)

### Environment Variables
- `ANTHROPIC_API_KEY` - Required for JDawg AI assistant
- `JURASSIC_JDAWG_ADDITIONAL_PROMPT` - Optional additional prompt for JDawg

## Important Rules for Claude Code

### What TO DO:
1. **Always work with notebooks first** - Edit `.ipynb` files in `nbs/`, not `.ts` files
2. **Run build tasks after changes** - Use `deno task build` to ensure everything is properly generated
3. **Follow notebook patterns** - Use `//| export` directives appropriately
4. **Maintain documentation** - Update markdown cells in notebooks for any code changes
5. **Test thoroughly** - Run full test suite after changes

### What NOT TO DO:
1. **Never directly edit generated `.ts` files** in `jurassic/` directory
2. **Don't skip the build process** - Always regenerate after notebook changes  
3. **Don't ignore linting/formatting** - The build process includes these checks
4. **Don't forget to update documentation** - Notebooks serve as both code and docs

### File Modification Priority:
1. **Primary**: Edit `.ipynb` files in `nbs/`
2. **Secondary**: Edit configuration files (`jurassic.json`, `deno.json`)
3. **Tertiary**: Edit static documentation in `docs/`
4. **Never**: Edit generated files in `jurassic/` (except when reading for context)

### Testing Strategy:
- When adding new features, add tests directly in the notebook
- For CLI changes, add integration tests in `tests/` directory
- Always run `deno task build` to ensure tests are properly exported
- Use temporary directories for integration tests to avoid conflicts

## Troubleshooting Common Issues

### Build Failures
- Check that all notebooks have proper `//| export` directives
- Ensure no syntax errors in notebook cells
- Verify imports are correctly specified
- Run `deno task clean` and retry if seeing stale file issues

### Test Failures
- Ensure all test dependencies are properly imported
- Check that environment variables are set for tests requiring them
- Verify temporary directory cleanup in tests

This development workflow ensures that the single source of truth remains the Jupyter notebooks while providing a robust development and deployment pipeline.