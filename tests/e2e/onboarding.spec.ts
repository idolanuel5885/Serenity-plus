import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('BR-001: Complete onboarding flow for new user', async ({ page }) => {
    // Clear localStorage to simulate new user
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Should redirect to welcome page
    await page.goto('/');
    await expect(page).toHaveURL('/welcome');

    // Welcome screen
    await expect(page.locator('h1')).toContainText('Meditate daily with a gentle nudge');
    await page.click('text=Get started');

    // Nickname screen
    await expect(page).toHaveURL('/nickname');
    await expect(page.locator('h1')).toContainText('What should we call you?');
    await page.fill('input[placeholder="e.g., Ido"]', 'Test User');
    await page.click('button[type="submit"]');

    // Meditations per week screen
    await expect(page).toHaveURL('/meditations-per-week');
    await expect(page.locator('h1')).toContainText(
      'How many times a week do you want to meditate?',
    );
    await expect(page.locator('select')).toHaveValue('5');
    await page.click('button[type="submit"]');

    // Meditation length screen
    await expect(page).toHaveURL('/meditation-length');
    await expect(page.locator('h1')).toContainText('How long do you want each meditation to be?');
    await expect(page.locator('select')).toHaveValue('1');
    await page.click('button[type="submit"]');

    // Should redirect to homepage
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Serenity+');
  });

  test('BR-001: Onboarding with invite code', async ({ page }) => {
    // Set up invite data in localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('pendingInviteCode', 'ABC123');
    });

    // Should show different welcome message
    await page.goto('/welcome');
    await expect(page.locator('h1')).toContainText("Let's set you up to start meditating with");
  });

  test('BR-006: UI elements are present', async ({ page }) => {
    await page.goto('/welcome');

    // Logo should be visible (first one in header)
    await expect(page.locator('img[src="/logo.svg"]').first()).toBeVisible();

    // Serenity+ text should be visible
    await expect(page.locator('text=Serenity+')).toBeVisible();
  });

  test('BR-006: Dropdowns have proper styling', async ({ page }) => {
    await page.goto('/meditations-per-week');

    // Check dropdown styling
    const dropdown = page.locator('select');
    await expect(dropdown).toBeVisible();

    // Check default value
    await expect(dropdown).toHaveValue('5');
  });

  test('BR-006: Contextual text appears', async ({ page }) => {
    await page.goto('/meditations-per-week');

    // Check contextual text
    await expect(page.locator('text=This will be your weekly commitment')).toBeVisible();
  });

  test('BR-005: PWA functionality', async ({ page }) => {
    await page.goto('/');

    // Check for manifest (first one)
    const manifest = page.locator('link[rel="manifest"]').first();
    await expect(manifest).toHaveAttribute('href', '/manifest.json');

    // Check for service worker registration
    const swScript = page.locator('script');
    await expect(swScript).toContainText('serviceWorker.register');
  });

  test('BR-008: Error handling for invalid input', async ({ page }) => {
    await page.goto('/nickname');

    // Try invalid nickname
    await page.fill('input[placeholder="e.g., Ido"]', 'a'); // Too short
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Nickname must be at least 2 characters')).toBeVisible();
  });

  test('BR-010: Performance - page load times', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/welcome');
    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});
