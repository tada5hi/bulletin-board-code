# Project Structure

| Source | Responsibility |
|---|---|
| `src/token` | Token definitions |
| `src/parser` | Parsing input |
| `src/converter` | Conversion orchestration |
| `src/handler` | Tag handling |
| `src/index.ts` | Public package exports |
| `tsdown.config.mts` | JavaScript build configuration |

The package exposes CommonJS, ESM and TypeScript declarations through `package.json`. Preserve the declared `dist/` paths and any public deep type imports. `types.ts` owns shared type declarations; compatibility facades retain public import paths.

The build runs tsdown and refreshes declarations through `build:types` after successful JavaScript builds. Generated `dist/` files are build artifacts.
