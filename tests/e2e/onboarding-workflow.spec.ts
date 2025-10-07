import { test, expect } from '@playwright/test';

test.describe('Complete Onboarding Workflow', () => {
  test('should complete full onboarding without errors', async ({ page }) => {
    // Start from homepage - should redirect to welcome
    await page.goto('/');

    // Should redirect to welcome page
    await expect(page).toHaveURL('/welcome');

    // Welcome page should load
    await expect(page.locator('h1')).toContainText('Welcome to Serenity+');

    // Click "Get Started" button
    await page.click('button:has-text("Get Started")');

    // Should go to nickname page
    await expect(page).toHaveURL('/nickname');
    await expect(page.locator('h1')).toContainText('What should we call you?');

    // Enter nickname
    await page.fill('input[placeholder="e.g., Ido"]', 'TestUser');
    await page.click('button:has-text("Continue")');

    // Should go to meditations per week page
    await expect(page).toHaveURL('/meditations-per-week');
    await expect(page.locator('h1')).toContainText(
      'How many times per week do you want to meditate?',
    );

    // Select meditation count (default should be 5)
    await page.click('button:has-text("Continue")');

    // Should go to meditation length page
    await expect(page).toHaveURL('/meditation-length');
    await expect(page.locator('h1')).toContainText('How long do you want each meditation to be?');

    // Select meditation length (default should be 30 minutes)
    await page.click('button:has-text("Complete Setup")');

    // Should go to notifications page
    await expect(page).toHaveURL('/notifications');
    await expect(page.locator('h1')).toContainText('Enable Notifications');

    // Click enable notifications
    await page.click('button:has-text("Enable Notifications and Continue")');

    // Should redirect to homepage (not welcome page!)
    await expect(page).toHaveURL('/');

    // Homepage should show user dashboard
    await expect(page.locator('h2')).toContainText('Partners summary');

    // Check that user data was stored
    const userId = await page.evaluate(() => localStorage.getItem('userId'));
    expect(userId).toBeTruthy();

    const userName = await page.evaluate(() => localStorage.getItem('userName'));
    expect(userName).toBe('TestUser');
  });

  test('should handle notification permission denial gracefully', async ({ page }) => {
    // Mock notification permission denial
    await page.addInitScript(() => {
      Object.defineProperty(window, 'Notification', {
        value: {
          permission: 'denied',
          requestPermission: () => Promise.resolve('denied'),
        },
        writable: true,
      });
    });

    // Go through onboarding
    await page.goto('/welcome');
    await page.click('button:has-text("Get Started")');
    await page.fill('input[placeholder="e.g., Ido"]', 'TestUser');
    await page.click('button:has-text("Continue")');
    await page.click('button:has-text("Continue")');
    await page.click('button:has-text("Complete Setup")');

    // Should still redirect to homepage even if notifications denied
    await page.click('button:has-text("Enable Notifications and Continue")');
    await expect(page).toHaveURL('/');
  });

  test('should handle missing userId gracefully', async ({ page }) => {
    // Clear localStorage
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Should redirect to welcome page
    await expect(page).toHaveURL('/welcome');
  });
});
