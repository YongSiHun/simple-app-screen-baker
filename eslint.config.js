import js from '@eslint/js';
import ts from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { readabilityRules } from './scripts/eslint-rules.mjs';
export default ts.config(
  {
    ignores: [
      'dist',
      'docs',
      'dist-ssr',
      'coverage',
      '.vite',
      '.cache',
      '.wrangler',
      'node_modules',
      '.verification',
      '.npm-cache',
      'public/fonts',
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    plugins: { readability: readabilityRules },
    rules: {
      curly: ['error', 'all'],
      'no-else-return': ['error', { allowElseIf: false }],
      'readability/named-boolean-condition': 'error',
      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: '*',
          next: ['return', 'if', 'for', 'while', 'try'],
        },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],
    },
  },
  { files: ['**/*.{js,mjs}'], languageOptions: { globals: globals.node } },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': hooks },
    rules: { ...hooks.configs.recommended.rules },
  },
);
