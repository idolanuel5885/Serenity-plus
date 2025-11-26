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
// In Node.js 18+, fetch is available via undici
// Try multiple ways to get the real fetch
let realFetch;

// First, try to get fetch from globalThis (Node.js 18+)
if (typeof globalThis.fetch !== 'undefined' && typeof globalThis.fetch === 'function') {
  realFetch = globalThis.fetch;
} 
// Try global.fetch
else if (typeof global.fetch !== 'undefined' && typeof global.fetch === 'function') {
  realFetch = global.fetch;
}
// Try to get it from undici (Node.js 18+ built-in module)
else {
  try {
    // In Node.js 18+, undici is a built-in module that provides fetch
    // Try both 'undici' and 'node:undici' (Node.js built-in module syntax)
    let undici;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      undici = require('undici');
    } catch (e1) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        undici = require('node:undici');
      } catch (e2) {
        // Both failed, undici not available
      }
    }
    if (undici && typeof undici.fetch === 'function') {
      realFetch = undici.fetch;
    }
  } catch (e) {
    // undici might not be available or require might fail
    // This is okay - we'll handle it in the integration tests
  }
}

// Store real fetch on global for integration tests to restore if needed
// Store on both global and globalThis to ensure it's accessible
if (realFetch) {
  global.__REAL_FETCH__ = realFetch;
  globalThis.__REAL_FETCH__ = realFetch;
} else {
  // If fetch is not available, store null so integration tests know to try getting it themselves
  global.__REAL_FETCH__ = null;
  globalThis.__REAL_FETCH__ = null;
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
