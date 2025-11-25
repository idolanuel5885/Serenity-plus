import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('BR-001: Complete onboarding flow for new user', async ({ page }) => {
    // Clear localStorage to simulate new user using addInitScript
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/');

    // Should redirect to welcome page
    await expect(page).toHaveURL('/welcome');

    // Welcome screen
    await expect(page.locator('h1')).toContainText('Meditate to Open The Lotus');
    await page.click('text=Get started');

    // Nickname screen
    await expect(page).toHaveURL('/nickname');
    await expect(page.locator('h1')).toContainText('What should we call you?');
    await page.fill('input[placeholder="e.g., Ido"]', 'Test User');
    await page.click('button[type="submit"]');

    // Email screen (new step)
    await expect(page).toHaveURL('/email');
    await expect(page.locator('h1')).toContainText('Save your lotus');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Continue")');

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
    await page.click('button:has-text("Complete Setup")');

    // Should redirect to homepage
    await expect(page).toHaveURL('/');
    await expect(page.locator('span:has-text("Serenity+")')).toBeVisible();
  });

  test('BR-001: Onboarding with invite code', async ({ page }) => {
    // Should show different welcome message when invite code is in URL
    await page.goto('/welcome?invite=ABC123');
    // Wait for the page to load and check URL parameters
    await page.waitForTimeout(1000);
    await expect(page.locator('h1')).toContainText("Let's set you up to start meditating with");
  });


  test('BR-008: Error handling for invalid input', async ({ page }) => {
    await page.goto('/nickname');

    // Try invalid nickname
    await page.fill('input[placeholder="e.g., Ido"]', 'a'); // Too short
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Nickname must be at least 2 characters')).toBeVisible();
  });

});
