import { createContext, useContext, useState, useEffect } from 'react';

// Authentication Context
const AuthContext = createContext(null);

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

// Authentication Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get stored token
    const getStoredToken = () => {
        return localStorage.getItem('foxshrine_access_token');
    };

    // Store token
    const storeTokens = (tokens) => {
        localStorage.setItem('foxshrine_access_token', tokens.accessToken);
        localStorage.setItem('foxshrine_refresh_token', tokens.refreshToken);
    };

    // Clear stored tokens
    const clearTokens = () => {
        localStorage.removeItem('foxshrine_access_token');
        localStorage.removeItem('foxshrine_refresh_token');
    };

    // API call helper with authentication
    const apiCall = async (endpoint, options = {}) => {
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
    };

    // Load user profile
    const loadUserProfile = async () => {
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
    };

    // Login function
    const login = async (username, password) => {
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
    };

    // Register function
    const register = async (userData) => {
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
    };

    // Logout function
    const logout = async () => {
        try {
            await apiCall('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearTokens();
            setUser(null);
        }
    };

    // Check if user has permission
    const hasPermission = (permission) => {
        return user && user.permissions && user.permissions.includes(permission);
    };

    // Check if user has role
    const hasRole = (role) => {
        return user && user.role === role;
    };

    // Check if user is admin (Admin or Super Admin)
    const isAdmin = () => {
        return user && (user.role === 'Admin' || user.role === 'Super Admin');
    };

    // Check if user is authenticated
    const isAuthenticated = () => {
        return !!user;
    };

    // Update user profile
    const updateProfile = async (profileData) => {
        try {
            setError(null);
            const response = await apiCall('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                return { success: true, user: data.user };
            } else {
                setError(data.error || 'Profile update failed');
                return { success: false, error: data.error || 'Profile update failed' };
            }
        } catch (error) {
            console.error('Profile update error:', error);
            const errorMessage = 'Network error. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // Load user on component mount
    useEffect(() => {
        loadUserProfile();
    }, []);

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        hasPermission,
        hasRole,
        isAdmin,
        isAuthenticated,
        apiCall,
        setError,
    };

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

// Higher-order component for protected routes
export const withAuth = (Component, requiredPermission = null, requiredRole = null) => {
    return function AuthenticatedComponent(props) {
        const { user, loading, hasPermission, hasRole } = useAuth();

        if (loading) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            );
        }

        if (!user) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <strong className="font-bold">Access Denied!</strong>
                        <span className="block sm:inline"> You must be logged in to access this page.</span>
                    </div>
                </div>
            );
        }

        if (requiredPermission && !hasPermission(requiredPermission)) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <strong className="font-bold">Permission Denied!</strong>
                        <span className="block sm:inline"> You don't have the required permission: {requiredPermission}</span>
                    </div>
                </div>
            );
        }

        if (requiredRole && !hasRole(requiredRole)) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <strong className="font-bold">Role Required!</strong>
                        <span className="block sm:inline"> You must have the role: {requiredRole}</span>
                    </div>
                </div>
            );
        }

        return <Component {...props} />;
    };
};

// Permission-based component wrapper
export const PermissionGate = ({ 
    children, 
    permission = null, 
    role = null, 
    fallback = null, 
    adminOnly = false 
}) => {
    const { user, hasPermission, hasRole, isAdmin } = useAuth();

    if (!user) {
        return fallback || null;
    }

    if (adminOnly && !isAdmin()) {
        return fallback || null;
    }

    if (permission && !hasPermission(permission)) {
        return fallback || null;
    }

    if (role && !hasRole(role)) {
        return fallback || null;
    }

    return children;
};

export default AuthContext;
