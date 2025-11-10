import { defineConfig } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'https://serenity-plus-kohl.vercel.app';

// Debug logging to verify which URL is being used
if (process.env.CI) {
  console.log('🔍 Playwright Config - E2E_BASE_URL env var:', process.env.E2E_BASE_URL || '(not set)');
  console.log('🔍 Playwright Config - Using baseURL:', baseURL);
}

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: baseURL,
  },
  projects: [
    { name: 'api', testMatch: '**/api/**/*.spec.ts' },
    { name: 'e2e', testMatch: '**/e2e/**/*.spec.ts' }
  ]
});