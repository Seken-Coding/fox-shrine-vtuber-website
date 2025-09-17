import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './useAuth.jsx';

// Mock the useConfig hook, as useAuth depends on it indirectly via AuthProvider
jest.mock('./useConfigDatabase.jsx', () => ({
  useConfig: () => ({
    config: {
      system: {
        maintenanceMode: false,
      },
    },
    loading: false,
  }),
}));

// Helper to wrap the hook in its provider
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('useAuth Hook', () => {
  // Use a fresh mock for every test
  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.clear();
  });

  test('should handle successful login', async () => {
    const mockToken = 'fake_access_token';
    const mockRefreshToken = 'fake_refresh_token';
    const mockUser = { id: 1, username: 'test', permissions: 'user' };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          tokens: { accessToken: mockToken, refreshToken: mockRefreshToken },
          user: mockUser,
        }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test', 'password');
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });
    await waitFor(() => {
      expect(result.current.isAuthenticated()).toBe(true);
    });
    await waitFor(() => {
      expect(localStorage.getItem('foxshrine_access_token')).toBe(mockToken);
    });
  });

  test('should handle failed login', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Invalid credentials' }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test', 'wrongpassword');
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Invalid credentials');
    });
    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });
  });

  test('should handle successful registration', async () => {
    const mockToken = 'new_fake_access_token';
    const mockRefreshToken = 'new_fake_refresh_token';
    const newUser = { id: 3, username: 'newuser', permissions: 'user' };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          tokens: { accessToken: mockToken, refreshToken: mockRefreshToken },
          user: newUser,
        }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({
        username: 'newuser',
        email: 'new@test.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(newUser);
    });
    await waitFor(() => {
      expect(result.current.isAuthenticated()).toBe(true);
    });
  });

  test('should handle logout', async () => {
    const mockUser = { id: 1, username: 'test', permissions: 'user' };
    localStorage.setItem('foxshrine_access_token', 'some_token');

    // Mock the initial profile load
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: mockUser }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isAuthenticated()).toBe(true));

    // Mock the logout API call
    global.fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    await act(async () => {
      await result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });
    await waitFor(() => {
      expect(result.current.isAuthenticated()).toBe(false);
    });
    await waitFor(() => {
      expect(localStorage.getItem('foxshrine_access_token')).toBeNull();
    });
  });

  test('should load user from stored token on initial load', async () => {
    const mockUser = { id: 1, username: 'test', permissions: 'user' };
    // Store a token in localStorage
    localStorage.setItem('foxshrine_access_token', 'some_token');

    // Mock the profile fetch API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: mockUser }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });
    await waitFor(() => {
      expect(result.current.isAuthenticated()).toBe(true);
    });
  });

  test('should handle session expiration on apiCall', async () => {
    localStorage.setItem('foxshrine_access_token', 'expired_token');

    // Mock initial profile load to set user
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: { id: 1, name: 'test' } }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAuthenticated()).toBe(true);

    // Mock the failed API call due to session expiration
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Session expired' }),
    });

    // The apiCall should throw an error which we expect
    await expect(result.current.apiCall('/test')).rejects.toThrow('Session expired');

    // After the session expires, the user should be logged out
    await waitFor(() => {
      expect(result.current.isAuthenticated()).toBe(false);
    });
    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });
  });

  test('should check permissions correctly', async () => {
    const adminUser = { id: 1, username: 'admin', permissions: ['admin', 'user'] };
    localStorage.setItem('foxshrine_access_token', 'admin_token');

    // Mock the initial profile load
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: adminUser }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.hasPermission('admin')).toBe(true);
    });
    await waitFor(() => {
      expect(result.current.hasPermission('user')).toBe(true); // Admin should also have user permissions
    });
    await waitFor(() => {
      expect(result.current.hasPermission('guest')).toBe(false);
    });
  });
});