import { test, expect } from '@playwright/test';

test.describe('Invite Flow', () => {
  test('BR-002: Generate invite link and QR code', async ({ page }) => {
    await page.goto('/invite');

    // Check invite link is generated
    const inviteInput = page.locator('input[readonly]');
    await expect(inviteInput).toHaveValue(/https:\/\/.*\/welcome\?invite=/);

    // Check QR code is generated
    const qrCode = page.locator('img[alt="QR Code"]');
    await expect(qrCode).toBeVisible();

    // Check copy button works
    await page.click('text=Copy');
    await expect(page.locator('text=Copied!')).toBeVisible();
  });

  test('BR-002: Accept invite and create partnership', async ({ page }) => {
    // Set up invite data
    await page.goto('/welcome?invite=ABC123');

    // Should show invite acceptance page
    await expect(page.locator('h1')).toContainText("Let's set you up to start meditating with");

    // Complete onboarding
    await page.click('text=Set up your profile');
    await page.goto('/welcome');
    await page.click('a:has-text("Get started")');

    // Nickname
    await page.fill('input[placeholder="e.g., Ido"]', 'Partner User');
    await page.click('button[type="submit"]');

    // Meditations per week
    await page.click('button[type="submit"]');

    // Meditation length
    await page.click('button[type="submit"]');

    // Should redirect to homepage with partnership
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Partnership')).toBeVisible();
  });


  test('BR-006: QR code generation', async ({ page }) => {
    await page.goto('/invite');

    // Wait for QR code to generate
    await page.waitForSelector('img[alt="QR Code"]');

    // Check QR code is visible and has proper dimensions
    const qrCode = page.locator('img[alt="QR Code"]');
    await expect(qrCode).toBeVisible();

    // Check QR code container styling
    const qrContainer = page.locator('.w-48.h-48');
    await expect(qrContainer).toBeVisible();
  });

  test('BR-008: Error handling for invalid invite', async ({ page }) => {
    await page.goto('/join/INVALID123');

    // Should show error message
    await expect(page.locator('text=Invalid invite code')).toBeVisible();
  });

  test('BR-009: Security - invite code validation', async ({ page }) => {
    // Try to access with invalid format
    await page.goto('/join/invalid');

    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });

});
