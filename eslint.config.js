import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
    {
        ignores: [
            'dist/**',
            'out/**',
            'node_modules/**',
            'coverage/**',
            'eslint.config.js',
            'prettier.config.cjs'
        ]
    },

    js.configs.recommended,

    {
        files: ['**/*.{ts,tsx}'],
        extends: [...tseslint.configs.recommendedTypeChecked],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            },
            parserOptions: {
                project: ['./tsconfig.eslint.json'],
                tsconfigRootDir: currentDir
            }
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/consistent-type-imports': 'error',
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true }
            ]
        }
    }
);