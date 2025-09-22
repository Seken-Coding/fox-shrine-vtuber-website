import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// Authentication Context
const AuthContext = createContext(null);

// API Base URL
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://fox-shrine-vtuber-website.onrender.com/api'
  : 'http://localhost:3002/api';

// Authentication Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get stored token
    const getStoredToken = useCallback(() => {
        return localStorage.getItem('foxshrine_access_token');
    }, []);

    // Store token
    const storeTokens = useCallback((tokens) => {
        localStorage.setItem('foxshrine_access_token', tokens.accessToken);
        localStorage.setItem('foxshrine_refresh_token', tokens.refreshToken);
    }, []);

    // Clear stored tokens
    const clearTokens = useCallback(() => {
        localStorage.removeItem('foxshrine_access_token');
        localStorage.removeItem('foxshrine_refresh_token');
    }, []);

    // API call helper with authentication
    const apiCall = useCallback(async (endpoint, options = {}) => {
        const token = getStoredToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        let response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401 && token) {
            // Attempt refresh once
            try {
                const refreshToken = localStorage.getItem('foxshrine_refresh_token');
                if (!refreshToken) throw new Error('No refresh token');
                const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken })
                });
                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    storeTokens(data.tokens);
                    // Retry original request with new token
                    const retryHeaders = { ...headers, Authorization: `Bearer ${data.tokens.accessToken}` };
                    response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers: retryHeaders });
                } else {
                    throw new Error('Refresh failed');
                }
            } catch (e) {
                // Refresh failed; clear and surface session expiration
                clearTokens();
                setUser(null);
                throw new Error('Session expired');
            }
        }

        return response;
    }, [getStoredToken, clearTokens, storeTokens]);

    // Load user profile
    const loadUserProfile = useCallback(async () => {
        try {
            const token = getStoredToken();
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await apiCall('/auth/profile');
            
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                clearTokens();
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to load user profile:', error);
            clearTokens();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [getStoredToken, apiCall, clearTokens]);

    // Login function
    const login = useCallback(async (username, password) => {
        try {
            setError(null);
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                storeTokens(data.tokens);
                setUser(data.user);
                return { success: true, user: data.user };
            } else {
                setError(data.error || 'Login failed');
                return { success: false, error: data.error || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = 'Network error. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, [storeTokens]);

    // Register function
    const register = useCallback(async (userData) => {
        try {
            setError(null);
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                storeTokens(data.tokens);
                setUser(data.user);
                return { success: true, user: data.user };
            } else {
                setError(data.error || 'Registration failed');
                return { success: false, error: data.error || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = 'Network error. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, [storeTokens]);

    // Logout function
    const logout = useCallback(async () => {
        try {
            await apiCall('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearTokens();
            setUser(null);
        }
    }, [apiCall, clearTokens]);

    // Check if user has permission
    const hasPermission = useCallback((permission) => {
        return user && user.permissions && user.permissions.includes(permission);
    }, [user]);

    // Check if user has role
    const hasRole = useCallback((role) => {
        return user && user.role === role;
    }, [user]);

    // Check if user is admin (Admin or Super Admin)
    const isAdmin = useCallback(() => {
        return user && (user.role === 'Admin' || user.role === 'Super Admin');
    }, [user]);

    // Check if user is authenticated
    const isAuthenticated = useCallback(() => {
        return !!user;
    }, [user]);

    // Load user on component mount
    useEffect(() => {
        loadUserProfile();
    }, [loadUserProfile]);

    const value = useMemo(() => ({
        user,
        loading,
        error,
        login,
        register,
        logout,
        hasPermission,
        hasRole,
        isAdmin,
        isAuthenticated,
        apiCall,
        setError,
    }), [user, loading, error, login, register, logout, hasPermission, hasRole, isAdmin, isAuthenticated, apiCall]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use authentication
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const PermissionGate = ({ permission, children, showMessage = false }) => {
    const { hasPermission } = useAuth();

    if (hasPermission(permission)) {
        return <>{children}</>;
    }

    if (showMessage) {
        return <p>You do not have permission to view this section.</p>;
    }

    return null;
};

export default AuthContext;
