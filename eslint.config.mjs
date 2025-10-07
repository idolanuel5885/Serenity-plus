import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettier from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "serenity-pwa-*/**",
      "next-env.d.ts",
      "*.js",
      "*.mjs",
      "*.json",
      "*.html",
      "*.md",
      "*.sh",
      "*.tar.gz",
      "*.log",
      "coverage/**",
      "test-results/**",
      "playwright-report/**",
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@next/next/no-img-element': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  prettier, // must be last: turns off conflicting stylistic rules
];

export default eslintConfig;
