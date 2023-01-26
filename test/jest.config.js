module.exports = {
    testEnvironment: 'node',
    transform: {
        "^.+\\.tsx?$": [
            "@swc/jest", {
                module: {
                    type: "commonjs"
                },
                jsc: {
                    target: 'es2020',
                    parser: {
                        syntax: 'typescript',
                    },
                    loose: true
                },
            }
        ]
    },
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node",
    ],
    testRegex: '(/unit/.*|(\\.|/)(test|spec))\\.(ts|js)x?$',
    testPathIgnorePatterns: [
        "dist",
        "unit/mock-util.ts"
    ],
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.{ts,tsx,js,jsx}',
        '!src/handler/utils/color.ts',
        '!src/handler/utils/dom.ts',
        '!src/handler/utils/escape.ts',
        '!src/parser/utils/bbcode-cleanup.ts',
        '!src/token/utils/nesting.ts',
        '!src/token/utils/parse.ts'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    rootDir: '../'
};
