// Debug script to test session completion
// This helps identify why sessions aren't being recorded

console.log('=== SESSION COMPLETION DEBUG ===');

// Test the session completion API
async function testSessionCompletion() {
  try {
    const response = await fetch('/api/session-complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-id',
        partnershipId: 'test-partnership-id',
        sessionDuration: 900, // 15 minutes
        completed: true
      }),
    });

    const result = await response.json();
    console.log('Session completion response:', result);
    
    if (!response.ok) {
      console.error('Session completion failed:', result.error);
    }
  } catch (error) {
    console.error('Session completion error:', error);
  }
}

// Test session start
async function testSessionStart() {
  try {
    const response = await fetch('/api/session-complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-id',
        partnershipId: 'test-partnership-id',
        sessionDuration: 900,
        sessionStarted: true
      }),
    });

    const result = await response.json();
    console.log('Session start response:', result);
    
    if (!response.ok) {
      console.error('Session start failed:', result.error);
    }
  } catch (error) {
    console.error('Session start error:', error);
  }
}

// Run tests
testSessionStart();
testSessionCompletion();

