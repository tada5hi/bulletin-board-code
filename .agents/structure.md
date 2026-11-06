# Project Structure

| Source | Responsibility |
|---|---|
| `src/token` | Token definitions |
| `src/parser` | Parsing input |
| `src/converter` | Conversion orchestration |
| `src/handler` | Tag handling |
| `src/index.ts` | Public package exports |
| `.github/assets` | README logo and mechanism diagram |
| `tsdown.config.mts` | JavaScript build configuration |

The package exports map declares the package root, `./package.json`. Use these declared entrypoints under exports-aware resolution; undeclared `dist/` paths are not additional public exports. Preserve the declared output paths. `types.ts` files own shared type declarations; filesystem declaration paths and facades provide legacy compatibility only where the resolver supports them.

The build runs tsdown and refreshes declarations through `build:types` after successful JavaScript builds. Generated `dist/` files are build artifacts.
