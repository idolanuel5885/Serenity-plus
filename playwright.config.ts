import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'https://serenity-plus-kohl.vercel.app',
  },
  projects: [
    { name: 'api', testMatch: '**/api/**/*.spec.ts' }
  ]
});