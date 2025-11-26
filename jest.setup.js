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
const realFetch = typeof globalThis.fetch !== 'undefined' ? globalThis.fetch : undefined;

// Mock fetch
global.fetch = jest.fn();

// Store real fetch on global for integration tests to restore if needed
if (realFetch) {
  (global as any).__REAL_FETCH__ = realFetch;
}

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
