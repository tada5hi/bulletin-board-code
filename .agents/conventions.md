# Conventions

Use the installed shared ESLint configuration through the repository's lint command. Keep interface/type naming and declaration placement compatible with public exports; qualify filesystem/deep type compatibility against the declared exports map.

Preserve both conversion directions and fixtures. `node-html-parser` stays external to the bundle; changes must remain compatible with its declared API.

Keep the runtime engine and emitted JavaScript contract separate from tooling requirements. Bundler upgrades must retain output names, module formats, declaration generation and source-map behavior. Avoid introducing runtime APIs unsupported by the package's declared engine or documented consumers.

No dependency overrides are declared. Keep TypeScript on `^5.9.3` until `typescript-eslint` supports TypeScript 7. For any compatibility pin introduced during future work, record its reason and the condition for removing it here.

Release configuration lives in `.github/workflows/` and the release-please files. Changes to release triggers must preserve the separation between creating release metadata and publishing artifacts.
