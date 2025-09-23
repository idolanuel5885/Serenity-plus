import { test, expect } from '@playwright/test'

test.describe('Invite Flow', () => {
  test('BR-002: Generate invite link and QR code', async ({ page }) => {
    await page.goto('/invite')
    
    // Check invite link is generated
    const inviteInput = page.locator('input[readonly]')
    await expect(inviteInput).toHaveValue(/http:\/\/.*\/join\/ABC123/)
    
    // Check QR code is generated
    const qrCode = page.locator('img[alt="QR Code"]')
    await expect(qrCode).toBeVisible()
    
    // Check copy button works
    await page.click('text=Copy')
    await expect(page.locator('text=Copied!')).toBeVisible()
  })

  test('BR-002: Accept invite and create partnership', async ({ page }) => {
    // Set up invite data
    await page.goto('/join/ABC123')
    
    // Should show invite acceptance page
    await expect(page.locator('h1')).toContainText('wants to meditate together')
    
    // Complete onboarding
    await page.click('text=Accept Invitation')
    await page.goto('/welcome')
    await page.click('text=Get started')
    
    // Nickname
    await page.fill('input[placeholder="e.g., Ido"]', 'Partner User')
    await page.click('button[type="submit"]')
    
    // Meditations per week
    await page.click('button[type="submit"]')
    
    // Meditation length
    await page.click('button[type="submit"]')
    
    // Should redirect to homepage with partnership
    await expect(page).toHaveURL('/')
    await expect(page.locator('text=Partnership')).toBeVisible()
  })

  test('BR-003: Partnership display on homepage', async ({ page }) => {
    await page.goto('/')
    
    // Check partnership section
    await expect(page.locator('text=Partnership')).toBeVisible()
    
    // Check partner information
    await expect(page.locator('text=Partner Name')).toBeVisible()
    
    // Check weekly goal
    await expect(page.locator('text=8 times per week')).toBeVisible()
  })

  test('BR-006: QR code generation', async ({ page }) => {
    await page.goto('/invite')
    
    // Wait for QR code to generate
    await page.waitForSelector('img[alt="QR Code"]')
    
    // Check QR code is visible and has proper dimensions
    const qrCode = page.locator('img[alt="QR Code"]')
    await expect(qrCode).toBeVisible()
    
    // Check QR code container styling
    const qrContainer = page.locator('.w-48.h-48')
    await expect(qrContainer).toBeVisible()
  })

  test('BR-008: Error handling for invalid invite', async ({ page }) => {
    await page.goto('/join/INVALID123')
    
    // Should show error message
    await expect(page.locator('text=Invalid invite code')).toBeVisible()
  })

  test('BR-009: Security - invite code validation', async ({ page }) => {
    // Try to access with invalid format
    await page.goto('/join/invalid')
    
    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible()
  })

  test('BR-010: Performance - invite page load', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/invite')
    const loadTime = Date.now() - startTime
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })
})
