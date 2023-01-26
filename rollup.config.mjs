/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import pkg from './package.json' assert { type: 'json' };
import { transform } from "@swc/core";
import terser from "@rollup/plugin-terser";

const extensions = [
    '.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx',
];

export default [
    {
        input: './src/index.ts',

        // Specify here external modules which you don't want to include in your bundle (for instance: 'lodash', 'moment' etc.)
        // https://rollupjs.org/guide/en/#external
        external: ['cookie'],

        plugins: [
            // Allows node_modules resolution
            resolve({ extensions}),

            // Allow bundling cjs modules. Rollup doesn't understand cjs
            commonjs(),

            // Compile TypeScript/JavaScript files
            {
                name: 'swc',
                transform(code) {
                    return transform(code, {
                        jsc: {
                            target: 'es2020',
                            parser: {
                                syntax: 'typescript',
                            },
                            loose: true
                        },
                        sourceMaps: true
                    });
                }
            },
            terser()
        ],
        output: [
            {
                file: pkg.main,
                format: 'cjs',
                footer: 'module.exports = Object.assign(exports.default, exports);',
                exports: 'named',
                sourcemap: true
            }, {
                file: pkg.module,
                format: 'esm',
                sourcemap: true
            }
        ]
    }
];
