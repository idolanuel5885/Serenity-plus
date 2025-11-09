import { test, expect } from '@playwright/test';

test.describe('UI Improvements', () => {
  test('should show Sit Now button immediately on homepage', async ({ page }) => {
    // Set up user data
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('userId', 'test-user-123');
      localStorage.setItem('userName', 'TestUser');
      localStorage.setItem('userWeeklyTarget', '5');
      localStorage.setItem('userUsualSitLength', '10');
    });

    // Navigate to homepage
    await page.goto('/');

    // Sit Now button should be visible immediately (no loading delay)
    await expect(page.locator('img[alt="Sit Now"]')).toBeVisible();

    // Should not show loading spinner
    await expect(page.locator('.animate-spin')).not.toBeVisible();
  });

  test('should use user-selected meditation length in timer', async ({ page }) => {
    // Set up user with specific meditation length BEFORE navigating
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('userId', 'test-user-123');
      localStorage.setItem('userName', 'TestUser');
      localStorage.setItem('userUsualSitLength', '5'); // 5 minutes
    });

    // Navigate to timer page
    await page.goto('/timer');

    // Wait for page to load and timer to render (wait for the timer display element)
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for timer display to show 5:00 (this waits for useEffect to run and update state)
    await page.waitForSelector('text=5:00', { timeout: 10000 });

    // Timer should show 5 minutes (300 seconds)
    await expect(page.locator('text=5:00')).toBeVisible();

    // Should not show 15:00 (hardcoded value)
    await expect(page.locator('text=15:00')).not.toBeVisible();
  });

});
