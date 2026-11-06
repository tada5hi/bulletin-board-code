import { defineConfig } from 'vitest/config';

export default defineConfig({
    'test': {
        'include': [
            'test/unit/**/*.{js,jsx,ts,tsx}',
            'test/**/*.{test,spec}.{js,jsx,ts,tsx}',
        ],
        'exclude': ['**/node_modules/**', '**/dist/**', 'test/unit/mock-util.ts'],
        'coverage': {
            'provider': 'v8',
            'reportsDirectory': 'coverage',
            'include': [
                'src/**/*.{ts,tsx,js,jsx}',
            ],
            'exclude': [
                'src/handler/utils/color.ts',
                'src/handler/utils/dom.ts',
                'src/handler/utils/escape.ts',
                'src/parser/utils/bbcode-cleanup.ts',
                'src/token/utils/nesting.ts',
                'src/token/utils/parse.ts',
            ],
            'thresholds': {
                'branches': 65,
                'functions': 80,
                'lines': 80,
                'statements': 80,
            },
        },
    },
});
