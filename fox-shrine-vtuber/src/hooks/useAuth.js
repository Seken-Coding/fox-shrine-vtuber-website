import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

/**
 * @fileoverview Authentication hook and context provider for Fox Shrine VTuber website
 * @author Fox Shrine Development Team
 * @version 1.0.0
 */

// Authentication Context
const AuthContext = createContext(null);

// API Base URL configuration based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://fox-shrine-vtuber-website.onrender.com/api'
  : 'http://localhost:3002/api';

/**
 * Authentication Provider Component
 * Provides authentication context and methods to the entire application
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap with auth context
 * @returns {JSX.Element} AuthContext.Provider with authentication state and methods
 */
export const AuthProvider = ({ children }) => {
    /** @type {[Object|null, Function]} Current authenticated user state */
    const [user, setUser] = useState(null);
    
    /** @type {[boolean, Function]} Authentication loading state */
    const [loading, setLoading] = useState(true);
    
    /** @type {[string|null, Function]} Current authentication error message */
    const [error, setError] = useState(null);

    /**
     * Retrieves stored JWT access token from localStorage
     * @returns {string|null} JWT access token or null if not found
     */
    const getStoredToken = useCallback(() => {
        return localStorage.getItem('foxshrine_access_token');
    }, []);

    /**
     * Stores authentication tokens in localStorage
     * @param {Object} tokens - Token object containing access and refresh tokens
     * @param {string} tokens.accessToken - JWT access token
     * @param {string} tokens.refreshToken - JWT refresh token
     */
    const storeTokens = useCallback((tokens) => {
        localStorage.setItem('foxshrine_access_token', tokens.accessToken);
        localStorage.setItem('foxshrine_refresh_token', tokens.refreshToken);
    }, []);

    /**
     * Clears all stored authentication tokens from localStorage
     */
    const clearTokens = useCallback(() => {
        localStorage.removeItem('foxshrine_access_token');
        localStorage.removeItem('foxshrine_refresh_token');
    }, []);

    /**
     * API call helper with automatic authentication token handling
     * Automatically adds Bearer token to requests and handles 401 responses
     * 
     * @param {string} endpoint - API endpoint path (e.g., '/auth/profile')
     * @param {Object} options - Fetch options object
     * @param {string} [options.method='GET'] - HTTP method
     * @param {Object} [options.headers={}] - Additional headers
     * @param {string|Object} [options.body] - Request body
     * @returns {Promise<Response>} Fetch response object
     * @throws {Error} When session expires or network errors occur
     */
    const apiCall = useCallback(async (endpoint, options = {}) => {
        const token = getStoredToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401 && token) {
            // Token expired, clear it and redirect to login
            clearTokens();
            setUser(null);
            throw new Error('Session expired');
        }

        return response;
    }, [getStoredToken, clearTokens]);

    /**
     * Loads the current user's profile from the API
     * Automatically called on component mount to restore authentication state
     * 
     * @returns {Promise<void>}
     */
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

    /**
     * Authenticates a user with username and password
     * 
     * @param {string} username - User's login username
     * @param {string} password - User's password
     * @returns {Promise<{success: boolean, user?: Object, error?: string}>} Login result
     * 
     * @example
     * const { login } = useAuth();
     * const result = await login('admin', 'password123');
     * if (result.success) {
     *   console.log('Login successful:', result.user);
     * } else {
     *   console.error('Login failed:', result.error);
     * }
     */
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

    /**
     * Registers a new user account
     * 
     * @param {Object} userData - User registration data
     * @param {string} userData.username - Desired username (unique)
     * @param {string} userData.email - User's email address
     * @param {string} userData.password - User's password (min 8 characters)
     * @param {string} userData.displayName - Display name for the user
     * @returns {Promise<{success: boolean, user?: Object, error?: string}>} Registration result
     * 
     * @example
     * const { register } = useAuth();
     * const result = await register({
     *   username: 'newuser',
     *   email: 'user@example.com',
     *   password: 'securepassword',
     *   displayName: 'New User'
     * });
     */
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

    /**
     * Logs out the current user and clears authentication state
     * Cleans up tokens and notifies the server
     * 
     * @returns {Promise<void>}
     * 
     * @example
     * const { logout } = useAuth();
     * await logout();
     * console.log('User logged out');
     */
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

    /**
     * Checks if the current user has a specific permission
     * Used for fine-grained access control throughout the application
     * 
     * @param {string} permission - Permission to check (e.g., 'config.write', 'users.read')
     * @returns {boolean} True if user has the specified permission
     * 
     * @example
     * const { hasPermission } = useAuth();
     * if (hasPermission('config.write')) {
     *   // Show configuration editing interface
     * }
     */
    const hasPermission = useCallback((permission) => {
        return user && user.permissions && user.permissions.includes(permission);
    }, [user]);

    /**
     * Checks if the current user has a specific role
     * 
     * @param {string} role - Role to check ('Guest', 'Member', 'VIP', 'Moderator', 'Admin', 'Super Admin')
     * @returns {boolean} True if user has the specified role
     * 
     * @example
     * const { hasRole } = useAuth();
     * if (hasRole('Admin')) {
     *   // Show admin features
     * }
     */
    const hasRole = useCallback((role) => {
        return user && user.role === role;
    }, [user]);

    /**
     * Checks if the current user is an administrator
     * Convenience method that checks for Admin or Super Admin roles
     * 
     * @returns {boolean} True if user is Admin or Super Admin
     * 
     * @example
     * const { isAdmin } = useAuth();
     * if (isAdmin()) {
     *   // Show administrative interface
     * }
     */
    const isAdmin = useCallback(() => {
        return user && (user.role === 'Admin' || user.role === 'Super Admin');
    }, [user]);

    /**
     * Checks if a user is currently authenticated
     * 
     * @returns {boolean} True if a user is logged in
     * 
     * @example
     * const { isAuthenticated } = useAuth();
     * if (isAuthenticated()) {
     *   // Show authenticated user features
     * } else {
     *   // Show login prompt
     * }
     */
    const isAuthenticated = useCallback(() => {
        return !!user;
    }, [user]);

    // Load user profile on component mount to restore authentication state
    useEffect(() => {
        loadUserProfile();
    }, [loadUserProfile]);

    /**
     * Memoized context value to prevent unnecessary re-renders
     * Contains all authentication state and methods
     */
    const value = useMemo(() => ({
        /** @type {Object|null} Current authenticated user object */
        user,
        /** @type {boolean} Authentication loading state */
        loading,
        /** @type {string|null} Current authentication error message */
        error,
        /** @type {Function} User login function */
        login,
        /** @type {Function} User registration function */
        register,
        /** @type {Function} User logout function */
        logout,
        /** @type {Function} Permission checking function */
        hasPermission,
        /** @type {Function} Role checking function */
        hasRole,
        /** @type {Function} Admin checking function */
        isAdmin,
        /** @type {Function} Authentication status function */
        isAuthenticated,
        /** @type {Function} Authenticated API call function */
        apiCall,
        /** @type {Function} Error state setter */
        setError,
    }), [user, loading, error, login, register, logout, hasPermission, hasRole, isAdmin, isAuthenticated, apiCall]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to access authentication context
 * Must be used within an AuthProvider component
 * 
 * @returns {Object} Authentication context containing user state and methods
 * @throws {Error} If used outside of AuthProvider
 * 
 * @example
 * const { user, login, logout, hasPermission } = useAuth();
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

/**
 * Permission Gate Component
 * Conditionally renders children based on user permissions
 * 
 * @param {Object} props - Component props
 * @param {string} props.permission - Required permission to render children
 * @param {React.ReactNode} props.children - Content to render if permission is granted
 * @param {boolean} [props.showMessage=false] - Whether to show "no permission" message
 * @returns {JSX.Element|null} Children if permission granted, message or null otherwise
 * 
 * @example
 * <PermissionGate permission="config.write">
 *   <ConfigurationPanel />
 * </PermissionGate>
 * 
 * <PermissionGate permission="users.read" showMessage>
 *   <UsersList />
 * </PermissionGate>
 */
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
