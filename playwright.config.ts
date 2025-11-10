import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://serenity-plus-kohl.vercel.app',
  },
  projects: [
    { name: 'api', testMatch: '**/api/**/*.spec.ts' },
    { name: 'e2e', testMatch: '**/e2e/**/*.spec.ts' }
  ]
});