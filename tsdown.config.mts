import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: 'src/index.ts',
    format: ['cjs', 'esm'],
    dts: false,
    clean: true,
    target: 'es2020',
    sourcemap: true,
    outExtensions: ({ format }) => ({ js: format === 'es' ? '.mjs' : '.cjs' }),
    deps: { alwaysBundle: [/.*/], neverBundle: ['node-html-parser'], onlyBundle: false },
});
