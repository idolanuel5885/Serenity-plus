import { test, expect } from '@playwright/test'

test.describe('Notification Redirect Bug', () => {
  test('should redirect to homepage after notifications, not welcome', async ({ page }) => {
    // Mock successful notification permission
    await page.addInitScript(() => {
      Object.defineProperty(window, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: () => Promise.resolve('granted')
        },
        writable: true
      })
    })
    
    // Simulate completed onboarding by setting localStorage
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('userId', 'test-user-123')
      localStorage.setItem('userName', 'TestUser')
      localStorage.setItem('userWeeklyTarget', '5')
      localStorage.setItem('userUsualSitLength', '30')
    })
    
    // Go to notifications page
    await page.goto('/notifications')
    await expect(page.locator('h1')).toContainText('Enable Notifications')
    
    // Click enable notifications
    await page.click('button:has-text("Enable Notifications and Continue")')
    
    // Should redirect to homepage, NOT welcome page
    await expect(page).toHaveURL('/')
    
    // Should show homepage content, not redirect to welcome
    await expect(page.locator('h2')).toContainText('Partners summary')
    
    // Should not redirect to welcome page
    await expect(page).not.toHaveURL('/welcome')
  })

  test('should handle notification errors without crashing', async ({ page }) => {
    // Mock notification API not available
    await page.addInitScript(() => {
      delete (window as any).Notification
    })
    
    // Simulate completed onboarding
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('userId', 'test-user-123')
      localStorage.setItem('userName', 'TestUser')
    })
    
    // Go to notifications page
    await page.goto('/notifications')
    
    // Click enable notifications - should not crash
    await page.click('button:has-text("Enable Notifications and Continue")')
    
    // Should still redirect to homepage
    await expect(page).toHaveURL('/')
  })
})
