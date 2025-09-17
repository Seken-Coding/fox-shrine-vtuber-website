import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ConfigProvider, useConfig } from './useConfigDatabase.jsx';
import { AuthProvider } from './useAuth.jsx';

// Mock the entire useAuth hook to provide a stable apiCall for testing useConfigDatabase
jest.mock('./useAuth.jsx', () => ({
  __esModule: true,
  ...jest.requireActual('./useAuth.jsx'), // Keep actual AuthProvider for the wrapper
  useAuth: () => ({
    // This mock simulates the authenticated apiCall from useAuth by delegating to the global fetch mock
    apiCall: jest.fn().mockImplementation((url, method, body) => {
      return global.fetch(url, {
        method,
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
    }),
    isAuthenticated: () => true, // Assume user is authenticated for update tests
  }),
}));

const mockConfig = { siteTitle: 'My Test Site', theme: { primaryColor: '#FF0000' } };
const initialConfig = { siteTitle: 'Initial Site', theme: { primaryColor: '#0000FF' } };
const updatedValue = 'Updated Site Title';

// This wrapper is crucial for providing the necessary context.
const TestWrapper = ({ children }) => (
  <AuthProvider>
    <ConfigProvider>{children}</ConfigProvider>
  </AuthProvider>
);

// Custom hook for testing purposes to access context values
const useTestHook = () => useConfig();

describe('useConfigDatabase Hook', () => {
  beforeEach(() => {
    // Clear all mocks and localStorage before each test
    global.fetch.mockClear();
    localStorage.clear();
  });

  test('should fetch and set config on initial load', async () => {
    // Mock the public fetch call for initial load
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockConfig }),
    });

    const { result } = renderHook(() => useTestHook(), { wrapper: TestWrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    await waitFor(() => {
      // The hook merges the fetched config with the default config.
      expect(result.current.config.siteTitle).toEqual(mockConfig.siteTitle);
    });
    await waitFor(() => {
      expect(result.current.config.theme.primaryColor).toEqual(mockConfig.theme.primaryColor);
    });
  });

  test('should handle fetch failure and fallback to localStorage', async () => {
    // Mock a failed fetch
    global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));
    // Setup localStorage fallback
    localStorage.setItem('foxshrine_config', JSON.stringify(mockConfig));

    const { result } = renderHook(() => useTestHook(), { wrapper: TestWrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    await waitFor(() => {
      expect(result.current.config).toEqual(mockConfig);
    });
    await waitFor(() => {
      // If localStorage fallback is successful, there should be no error.
      expect(result.current.error).toBeNull();
    });
  });

  test('should update a single config value successfully', async () => {
    // 1. Initial load
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: initialConfig }),
    });

    const { result } = renderHook(() => useTestHook(), { wrapper: TestWrapper });

    await waitFor(() => expect(result.current.config.siteTitle).toEqual(initialConfig.siteTitle));

    // 2. Mock for the update call (which uses apiCall -> fetch)
    const updatedConfigResponse = { ...initialConfig, siteTitle: updatedValue };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: updatedConfigResponse }),
    });

    await act(async () => {
      await result.current.updateConfig('siteTitle', updatedValue);
    });

    // Check optimistic update first
    expect(result.current.config.siteTitle).toEqual(updatedValue);

    // Check final state
    await waitFor(() => {
        expect(result.current.config.siteTitle).toEqual(updatedValue);
    });

    expect(JSON.parse(localStorage.getItem('foxshrine_config')).siteTitle).toBe(updatedValue);
  });

  test('should handle update config failure and revert optimistic update', async () => {
    // 1. Initial load
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: initialConfig }),
    });

    const { result } = renderHook(() => useTestHook(), { wrapper: TestWrapper });

    await waitFor(() => expect(result.current.config.siteTitle).toEqual(initialConfig.siteTitle));

    // 2. Mock for the failed update call
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ success: false, error: 'Update failed' }),
    });

    await act(async () => {
      // We expect this to throw an error, so we catch it.
      try {
        await result.current.updateConfig('siteTitle', 'A failed update');
      } catch (e) {
        // This is expected because the hook re-throws the error.
      }
    });

    // Config should have reverted to its original state
    expect(result.current.config.siteTitle).toEqual(initialConfig.siteTitle);
    expect(result.current.error).not.toBeNull();
  });
});
