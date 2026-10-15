import js from '@eslint/js';
import ts from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
export default ts.config(
  {
    ignores: [
      'dist',
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
  { files: ['**/*.{js,mjs}'], languageOptions: { globals: globals.node } },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': hooks },
    rules: { ...hooks.configs.recommended.rules },
  },
);
