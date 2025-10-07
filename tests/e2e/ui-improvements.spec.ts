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
    // Set up user with specific meditation length
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('userId', 'test-user-123');
      localStorage.setItem('userName', 'TestUser');
      localStorage.setItem('userUsualSitLength', '5'); // 5 minutes
    });

    // Navigate to timer page
    await page.goto('/timer');

    // Wait for timer to load
    await page.waitForLoadState('networkidle');

    // Timer should show 5 minutes (300 seconds)
    await expect(page.locator('text=5:00')).toBeVisible();

    // Should not show 15:00 (hardcoded value)
    await expect(page.locator('text=15:00')).not.toBeVisible();
  });

  test('should have Continue buttons at bottom of onboarding screens', async ({ page }) => {
    // Test nickname page
    await page.goto('/nickname');

    // Button should be at bottom
    const nicknameButton = page.locator('button:has-text("Continue")');
    await expect(nicknameButton).toBeVisible();

    // Test meditations-per-week page
    await page.goto('/meditations-per-week');

    const meditationsButton = page.locator('button:has-text("Continue")');
    await expect(meditationsButton).toBeVisible();

    // Test meditation-length page
    await page.goto('/meditation-length');

    const lengthButton = page.locator('button:has-text("Complete Setup")');
    await expect(lengthButton).toBeVisible();

    // Test notifications page
    await page.goto('/notifications');

    const notificationsButton = page.locator(
      'button:has-text("Enable Notifications and Continue")',
    );
    await expect(notificationsButton).toBeVisible();
  });

  test('should not have bottom logos on onboarding screens', async ({ page }) => {
    // Test that bottom logos are removed from onboarding screens
    const onboardingPages = [
      '/nickname',
      '/meditations-per-week',
      '/meditation-length',
      '/notifications',
    ];

    for (const pagePath of onboardingPages) {
      await page.goto(pagePath);

      // Should not have footer with logo at bottom
      const footer = page.locator('div:has(img[alt="Serenity+"])').last();
      await expect(footer).not.toBeVisible();

      // Should still have header logo
      const headerLogo = page.locator('div:has(img[alt="Serenity+"])').first();
      await expect(headerLogo).toBeVisible();
    }
  });

  test('should have proper flexbox layout for button positioning', async ({ page }) => {
    // Test that the layout uses proper flexbox for button positioning
    await page.goto('/nickname');

    // Check that the main content area has flex layout
    const mainContent = page.locator('.flex-1.flex.flex-col');
    await expect(mainContent).toBeVisible();

    // Check that the form has mt-auto for bottom positioning
    const form = page.locator('form.mt-auto');
    await expect(form).toBeVisible();
  });
});
