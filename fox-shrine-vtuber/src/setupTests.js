import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock IntersectionObserver
class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}
window.IntersectionObserver = IntersectionObserver;

// Mock window.matchMedia
global.matchMedia = query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

// Mock window.scrollTo
global.scrollTo = jest.fn();

// --- Global Mocks ---
// Mock fetch globally to ensure it's always a mock function
global.fetch = jest.fn();

// --- Global Cleanup ---
// This will run before each test file
beforeEach(() => {
  // Clear all mocks, local storage, and fetch mocks before each test
  jest.clearAllMocks();
  localStorage.clear();
  global.fetch.mockClear();
});
