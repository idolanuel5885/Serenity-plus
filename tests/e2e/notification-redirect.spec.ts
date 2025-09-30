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
    
    // Simulate the REAL flow: meditation-length page sets userId with delay, then notifications
    await page.goto('/')
    await page.evaluate(() => {
      // Simulate what meditation-length page does with proper timing
      const userId = `user-${Date.now()}`
      console.log('Test: Creating user with ID:', userId)
      
      // Set all localStorage data like meditation-length page does
      localStorage.setItem('userId', userId)
      localStorage.setItem('userName', 'TestUser')
      localStorage.setItem('userWeeklyTarget', '5')
      localStorage.setItem('userUsualSitLength', '30')
      localStorage.setItem('userEmail', `user-${Date.now()}@example.com`)
      localStorage.setItem('userPrimaryWindow', '06:00–09:00')
      localStorage.setItem('userTimezone', 'GMT+0')
      localStorage.setItem('userWhyPractice', 'Mindfulness and stress relief')
      localStorage.setItem('userSupportNeeds', 'Gentle reminders')
      
      console.log('Test: All localStorage keys after creation:', Object.keys(localStorage))
    })
    
    // Go to notifications page
    await page.goto('/notifications')
    await expect(page.locator('h1')).toContainText('Enable Notifications')
    
    // Click enable notifications
    await page.click('button:has-text("Enable Notifications and Continue")')
    
    // Wait for the redirect to complete and homepage to check for userId
    await page.waitForTimeout(3000)
    
    // Should redirect to homepage, NOT welcome page
    await expect(page).toHaveURL('/')
    
    // Should show homepage content, not redirect to welcome
    await expect(page.locator('h2')).toContainText('Partners summary')
    
    // Should not redirect to welcome page
    await expect(page).not.toHaveURL('/welcome')
    
    // Verify userId is still in localStorage
    const userId = await page.evaluate(() => localStorage.getItem('userId'))
    expect(userId).toBeTruthy()
    console.log('Test: userId found in localStorage:', userId)
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

  test('should handle race condition between meditation-length and homepage', async ({ page }) => {
    // This test specifically checks the race condition that was causing the bug
    await page.addInitScript(() => {
      Object.defineProperty(window, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: () => Promise.resolve('granted')
        },
        writable: true
      })
    })
    
    // Simulate the exact race condition: userId set, then immediate homepage check
    await page.goto('/')
    await page.evaluate(() => {
      // Simulate meditation-length page setting userId
      const userId = `user-${Date.now()}`
      localStorage.setItem('userId', userId)
      localStorage.setItem('userName', 'RaceConditionTest')
      localStorage.setItem('userWeeklyTarget', '5')
      localStorage.setItem('userUsualSitLength', '30')
      console.log('Race condition test: userId set to:', userId)
    })
    
    // Go to notifications page
    await page.goto('/notifications')
    await expect(page.locator('h1')).toContainText('Enable Notifications')
    
    // Click enable notifications
    await page.click('button:has-text("Enable Notifications and Continue")')
    
    // Wait for homepage to check for userId (both immediate and delayed checks)
    await page.waitForTimeout(3000)
    
    // Should redirect to homepage, NOT welcome page
    await expect(page).toHaveURL('/')
    
    // Should show homepage content
    await expect(page.locator('h2')).toContainText('Partners summary')
    
    // Should not redirect to welcome page
    await expect(page).not.toHaveURL('/welcome')
    
    // Verify userId is still in localStorage
    const userId = await page.evaluate(() => localStorage.getItem('userId'))
    expect(userId).toBeTruthy()
    console.log('Race condition test: userId found in localStorage:', userId)
  })
})
