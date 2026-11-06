# Testing

`npm test` runs Vitest using `test/vitest.config.mts`. `npm run test:coverage` enables the configured coverage provider and existing thresholds; keep those thresholds and source inclusion rules intact.

Preserve both conversion directions and fixtures. `node-html-parser` stays external to the bundle; changes must remain compatible with its declared API.

Run the build when changing exported types or bundle configuration. Validate both CommonJS and ESM consumer entrypoints when altering package exports. A missing external service is an incomplete check, not a passing test.
