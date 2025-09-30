import { test, expect } from '@playwright/test'

test.describe('Partnership System', () => {
  test('should show partnerships between users after onboarding', async ({ page }) => {
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
    
    // Simulate first user completing onboarding
    await page.goto('/')
    await page.evaluate(() => {
      // Clear any existing data
      localStorage.clear()
      
      // Simulate first user
      const userId1 = 'user-123'
      const allUsers = [{
        id: userId1,
        name: 'Alice',
        email: 'alice@example.com',
        weeklyTarget: 5,
        image: '/icons/meditation-1.svg'
      }]
      localStorage.setItem('allUsers', JSON.stringify(allUsers))
      localStorage.setItem('userId', userId1)
      localStorage.setItem('userName', 'Alice')
      localStorage.setItem('userWeeklyTarget', '5')
      localStorage.setItem('userUsualSitLength', '30')
    })
    
    // Go to homepage
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    // Should show no partners yet (only one user)
    await expect(page.locator('h2')).toContainText('Partners summary')
    await expect(page.locator('text=No partners yet')).toBeVisible()
    
    // Now simulate second user joining
    await page.evaluate(() => {
      const userId2 = 'user-456'
      const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]')
      allUsers.push({
        id: userId2,
        name: 'Bob',
        email: 'bob@example.com',
        weeklyTarget: 3,
        image: '/icons/meditation-2.svg'
      })
      localStorage.setItem('allUsers', JSON.stringify(allUsers))
      
      // Switch to second user
      localStorage.setItem('userId', userId2)
      localStorage.setItem('userName', 'Bob')
      localStorage.setItem('userWeeklyTarget', '3')
      localStorage.setItem('userUsualSitLength', '20')
    })
    
    // Refresh page to trigger partnership fetch
    await page.reload()
    await page.waitForTimeout(2000)
    
    // Should now show partnership with Alice
    await expect(page.locator('h2')).toContainText('Partners summary')
    await expect(page.locator('text=Alice')).toBeVisible()
    await expect(page.locator('text=You 0/3 * Alice 0/5')).toBeVisible()
  })

  test('should handle invite flow and create partnerships', async ({ page }) => {
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
    
    // Simulate invite flow
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      
      // Simulate user with invite code
      const userId = 'user-invite-123'
      localStorage.setItem('userId', userId)
      localStorage.setItem('userName', 'InvitedUser')
      localStorage.setItem('userWeeklyTarget', '4')
      localStorage.setItem('userUsualSitLength', '25')
      localStorage.setItem('partnershipInviteCode', 'demo123')
      localStorage.setItem('partnershipStatus', 'pending')
    })
    
    // Go to homepage
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    // Should show partnership with inviter
    await expect(page.locator('h2')).toContainText('Partners summary')
    await expect(page.locator('text=Your Partner')).toBeVisible()
  })

  test('should persist partnerships across page reloads', async ({ page }) => {
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
    
    // Set up existing partnerships
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      
      const userId = 'user-persist-123'
      localStorage.setItem('userId', userId)
      localStorage.setItem('userName', 'PersistentUser')
      localStorage.setItem('userWeeklyTarget', '5')
      localStorage.setItem('userUsualSitLength', '30')
      
      // Set up existing partnerships
      const partnerships = [{
        id: 'partnership-123',
        partner: {
          id: 'partner-456',
          name: 'Existing Partner',
          email: 'partner@example.com',
          image: '/icons/meditation-1.svg',
          weeklyTarget: 5
        },
        userSits: 2,
        partnerSits: 3,
        weeklyGoal: 5,
        score: 0,
        currentWeekStart: new Date().toISOString()
      }]
      localStorage.setItem('partnerships', JSON.stringify(partnerships))
    })
    
    // Go to homepage
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    // Should show existing partnership
    await expect(page.locator('h2')).toContainText('Partners summary')
    await expect(page.locator('text=Existing Partner')).toBeVisible()
    await expect(page.locator('text=You 2/5 * Existing Partner 3/5')).toBeVisible()
  })
})
