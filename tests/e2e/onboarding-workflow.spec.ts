import { test, expect } from '@playwright/test';

test.describe('Complete Onboarding Workflow', () => {
  test('should complete full onboarding without errors', async ({ page }) => {
    // Clear localStorage first to ensure clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    
    // Start from homepage - should redirect to welcome
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for redirect to welcome page (window.location.href redirect)
    await page.waitForURL('**/welcome', { timeout: 10000 });

    // Should redirect to welcome page
    await expect(page).toHaveURL('/welcome', { timeout: 10000 });

    // Welcome page should load
    await expect(page.locator('h1')).toContainText('Meditate daily with a gentle nudge.');

    // Click "Get started" button
    await page.click('a:has-text("Get started")');

    // Should go to nickname page
    await expect(page).toHaveURL('/nickname');
    await expect(page.locator('h1')).toContainText('What should we call you?');

    // Enter nickname
    await page.fill('input[placeholder="e.g., Ido"]', 'TestUser');
    await page.click('button:has-text("Continue")');

    // Should go to meditations per week page
    await expect(page).toHaveURL('/meditations-per-week');
    await expect(page.locator('h1')).toContainText(
      'How many times a week do you want to meditate?',
    );

    // Select meditation count (default should be 5)
    await page.click('button:has-text("Continue")');

    // Should go to meditation length page
    await expect(page).toHaveURL('/meditation-length');
    await expect(page.locator('h1')).toContainText('How long do you want each meditation to be?');

    // Select meditation length (default should be 30 minutes)
    await page.click('button:has-text("Complete Setup")');

    // Should redirect to homepage (notifications skipped)
    await expect(page).toHaveURL('/');

    // Homepage should show user dashboard
    await expect(page.locator('h2')).toContainText('Partners summary');

    // Check that user data was stored
    const userId = await page.evaluate(() => localStorage.getItem('userId'));
    expect(userId).toBeTruthy();

    const userName = await page.evaluate(() => localStorage.getItem('userName'));
    expect(userName).toBe('TestUser');
  });


  test('should handle missing userId gracefully', async ({ page }) => {
    // Clear localStorage BEFORE visiting the page
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    
    // Navigate to homepage - should redirect to welcome
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for redirect to welcome page (window.location.href redirect)
    await page.waitForURL('**/welcome', { timeout: 10000 });
    
    // Should redirect to welcome page
    await expect(page).toHaveURL('/welcome', { timeout: 10000 });
  });
});
