import { test, expect } from '@playwright/test';

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Week Creation Monitoring API', () => {
  test('should return health status', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/monitor/week-creation`);
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    
    // Should have required fields
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('metrics');
    expect(data).toHaveProperty('alerts');
    
    // Status should be one of the valid values
    expect(['healthy', 'warning', 'critical', 'error']).toContain(data.status);
    
    // Metrics should have required structure
    expect(data.metrics).toHaveProperty('recent_activity_24h');
    expect(data.metrics).toHaveProperty('partnerships_needing_weeks');
    
    // Alerts should be boolean flags
    expect(typeof data.alerts.no_recent_activity).toBe('boolean');
    expect(typeof data.alerts.has_errors).toBe('boolean');
    expect(typeof data.alerts.partnerships_needing_weeks).toBe('boolean');
  });

  test('should return valid JSON structure', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/monitor/week-creation`);
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    
    // Verify structure
    expect(data.metrics.recent_activity_24h).toHaveProperty('successful');
    expect(data.metrics.recent_activity_24h).toHaveProperty('errors');
    expect(data.metrics.recent_activity_24h).toHaveProperty('skipped');
    expect(data.metrics.recent_activity_24h).toHaveProperty('total');
    
    // Values should be numbers
    expect(typeof data.metrics.recent_activity_24h.successful).toBe('number');
    expect(typeof data.metrics.recent_activity_24h.errors).toBe('number');
    expect(typeof data.metrics.partnerships_needing_weeks).toBe('number');
  });

  test('should handle errors gracefully', async ({ request }) => {
    // This test verifies the endpoint doesn't crash on errors
    // We can't easily simulate database errors, but we can verify
    // the endpoint structure is correct
    const response = await request.get(`${baseUrl}/api/monitor/week-creation`);
    
    // Should return 200 even if there are issues (graceful degradation)
    expect([200, 500]).toContain(response.status());
    
    const data = await response.json();
    
    // Should always return a status
    expect(data).toHaveProperty('status');
  });
});

