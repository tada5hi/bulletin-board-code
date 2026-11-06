# bulletin-board-code: Agent Guide

A library for converting BBCode and HTML in both directions.

## Quick Reference

Use Node 24.11 or newer within the 24.x line for development and npm for dependency management. The package manifest does not declare a Node runtime floor. Build-tool requirements do not authorize changing the published runtime contract.

```bash
npm ci
npm run build
npm test
npm run test:coverage
npm run lint
```

## Detailed Guides

- [Structure](.agents/structure.md): Source responsibilities and package outputs.
- [Testing](.agents/testing.md): Test runner, infrastructure and coverage.
- [Conventions](.agents/conventions.md): Shared lint rules and compatibility invariants.

### Writing agent docs

Update guides only when an invariant or cross-cutting rule changes. Edit the existing line and describe current behavior; keep defect stories and change history in commits or PRs. Do not add a section for a single fix.

`npm run lint` includes the shared `agentDocs` size, import-budget and history-phrase checks.

## Commits and Pull Requests

Use Conventional Commits and omit AI-attribution trailers or text.
