// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, ...props }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Save real fetch before mocking (for integration tests that need it)
// In Node.js 18+, fetch is available globally
// Try multiple ways to get the real fetch
let realFetch;

// Try to get fetch from globalThis (Node.js 18+)
if (typeof globalThis.fetch !== 'undefined' && typeof globalThis.fetch === 'function') {
  realFetch = globalThis.fetch;
} 
// Try global.fetch
else if (typeof global.fetch !== 'undefined' && typeof global.fetch === 'function') {
  realFetch = global.fetch;
}
// Try to get it from undici (Node.js 18+ internal)
else {
  try {
    // In Node.js 18+, fetch is provided by undici
    // We can try to access it via require, but it might not be available in all environments
    const { fetch: undiciFetch } = require('undici');
    if (typeof undiciFetch === 'function') {
      realFetch = undiciFetch;
    }
  } catch (e) {
    // undici might not be available or require might fail
    // This is okay - we'll handle it in the integration tests
  }
}

// If we still don't have fetch, try to get it from the process
// In Node.js 18+, it should be available on globalThis by default
if (!realFetch && typeof process !== 'undefined' && process.versions && parseInt(process.versions.node.split('.')[0]) >= 18) {
  // Node.js 18+ should have fetch, try one more time
  try {
    // Force evaluation - sometimes fetch needs to be accessed differently
    if (typeof globalThis.fetch === 'function') {
      realFetch = globalThis.fetch;
    }
  } catch (e) {
    // Still not available
  }
}

// Store real fetch on global for integration tests to restore if needed
// Store on both global and globalThis to ensure it's accessible
// Even if we don't have it now, we'll try to get it in the integration tests
if (realFetch) {
  global.__REAL_FETCH__ = realFetch;
  globalThis.__REAL_FETCH__ = realFetch;
} else {
  // If fetch is not available, store a flag so integration tests know to try getting it themselves
  global.__REAL_FETCH__ = null;
  globalThis.__REAL_FETCH__ = null;
  console.warn('⚠️ Warning: Could not save real fetch in jest.setup.js. Integration tests will try to get it themselves.');
}

// Mock fetch - integration tests will restore using __REAL_FETCH__
global.fetch = jest.fn();

// Mock window.location
// JSDOM doesn't allow direct assignment to window.location or setting href
// We create a mock that doesn't trigger navigation by using getters/setters
const mockLocation = {
  origin: 'http://localhost:3000',
  get href() {
    return 'http://localhost:3000';
  },
  set href(value) {
    // Do nothing - prevent navigation
  },
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
};

// Try to delete and redefine location
try {
  delete window.location;
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: false,
    configurable: true,
  });
} catch (e) {
  // If we can't delete/redefine, location is not configurable
  // This is fine - the tests should work with the default JSDOM location
}
