import config from '@tada5hi/eslint-config';

export default config(
    { typescript: true },
    { rules: { '@typescript-eslint/no-unused-vars': 'off' } },
    { ignores: ['**/dist/**', '**/*.d.ts', '**/coverage/**'] },
);
