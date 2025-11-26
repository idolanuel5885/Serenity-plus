import { test, expect } from '@playwright/test';

test.describe('Notification Redirect Bug', () => {

  test('should handle race condition between meditation-length and homepage', async ({ page }) => {
    // This test specifically checks the race condition that was causing the bug
    await page.addInitScript(() => {
      Object.defineProperty(window, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: () => Promise.resolve('granted'),
        },
        writable: true,
      });
    });

    // Simulate the exact race condition: userId set, then immediate homepage check
    await page.addInitScript(() => {
      // Simulate meditation-length page setting userId
      const userId = `user-${Date.now()}`;
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', 'RaceConditionTest');
      localStorage.setItem('userWeeklyTarget', '5');
      localStorage.setItem('userUsualSitLength', '30');
      console.log('Race condition test: userId set to:', userId);
    });
    await page.goto('/');

    // Go to notifications page
    await page.goto('/notifications');
    await expect(page.locator('h1')).toContainText('Enable Notifications');

    // Click enable notifications
    await page.click('button:has-text("Enable Notifications and Continue")');

    // Wait for homepage to check for userId (both immediate and delayed checks)
    await page.waitForTimeout(3000);

    // Should redirect to homepage, NOT welcome page
    await expect(page).toHaveURL('/');

    // Should show homepage content
    await expect(page.locator('h2')).toContainText('Partners summary');

    // Should not redirect to welcome page
    await expect(page).not.toHaveURL('/welcome');

    // Verify userId is still in localStorage (with error handling)
    const userId = await page.evaluate(() => {
      try {
        return localStorage.getItem('userId');
      } catch {
        return null;
      }
    });
    expect(userId).toBeTruthy();
    console.log('Race condition test: userId found in localStorage:', userId);
  });
});
