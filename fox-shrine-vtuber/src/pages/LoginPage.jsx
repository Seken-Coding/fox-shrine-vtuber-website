import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from '../components/AuthModal';

const LoginPage = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const { user, logout, isAdmin } = useAuth();

    const openLogin = () => {
        setAuthMode('login');
        setShowAuthModal(true);
    };

    const openRegister = () => {
        setAuthMode('register');
        setShowAuthModal(true);
    };

    if (user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Welcome Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Welcome back, {user.displayName || user.username}! 🦊
                        </h1>
                        <p className="text-xl text-gray-600">
                            You're logged in as <span className="font-semibold text-purple-600">{user.role}</span>
                        </p>
                    </div>

                    {/* User Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {/* Profile Card */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-purple-600 font-bold text-lg">
                                        {user.displayName?.[0] || user.username?.[0] || 'U'}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{user.displayName || user.username}</h3>
                                    <p className="text-gray-600">@{user.username}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Email:</span> {user.email}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Role:</span> 
                                    <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                        {user.role}
                                    </span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Permissions:</span> {user.permissions?.length || 0}
                                </p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <a 
                                    href="/" 
                                    className="block w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                                >
                                    🏠 Go to Homepage
                                </a>
                                <a 
                                    href="/about" 
                                    className="block w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                                >
                                    ℹ️ About Fox Shrine
                                </a>
                                {isAdmin() && (
                                    <a 
                                        href="/admin" 
                                        className="block w-full text-left px-4 py-2 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
                                    >
                                        ⚙️ Admin Dashboard
                                    </a>
                                )}
                                <button 
                                    onClick={logout}
                                    className="block w-full text-left px-4 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                                >
                                    🚪 Logout
                                </button>
                            </div>
                        </div>

                        {/* Permissions */}
                        {!!user.permissions && user.permissions.length > 0 && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Your Permissions</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {user.permissions.map((permission, index) => (
                                        <span 
                                            key={index}
                                            className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded mr-2 mb-1"
                                        >
                                            {permission}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Admin Notice */}
                    {isAdmin() && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
                            <h3 className="font-semibold text-purple-900 mb-2">🔧 Admin Access</h3>
                            <p className="text-purple-700 mb-4">
                                As an administrator, you have special access to manage the Fox Shrine website:
                            </p>
                            <ul className="list-disc list-inside text-purple-700 space-y-1 mb-4">
                                <li>Manage user accounts and roles</li>
                                <li>Update website configuration</li>
                                <li>Monitor system activity</li>
                                <li>Control content visibility</li>
                            </ul>
                            <a 
                                href="/admin"
                                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                            >
                                Open Admin Dashboard →
                            </a>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Welcome to Fox Shrine! 🦊
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Join our community to unlock exclusive features and content
                    </p>
                </div>

                {/* Authentication Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Login Card */}
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h3>
                            <p className="text-gray-600 mb-6">
                                Already have an account? Sign in to access your exclusive content.
                            </p>
                        </div>
                        <button 
                            onClick={openLogin}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Sign In
                        </button>
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                                <strong>Admin Access:</strong><br />
                                Username: <code>foxadmin</code><br />
                                Password: <code>FoxShrine2025!</code>
                            </p>
                        </div>
                    </div>

                    {/* Register Card */}
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Join the Shrine!</h3>
                            <p className="text-gray-600 mb-6">
                                Create a free account to become part of our fox family.
                            </p>
                        </div>
                        <button 
                            onClick={openRegister}
                            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        >
                            Create Account
                        </button>
                        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-purple-700">
                                Join as a <strong>Member</strong> and get access to exclusive content and community features!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features Overview */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">User Roles & Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Guest Features */}
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-gray-600 font-bold">👥</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Guest</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Browse website content</li>
                                <li>• View stream information</li>
                                <li>• Access social media links</li>
                            </ul>
                        </div>

                        {/* Member Features */}
                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-purple-600 font-bold">👤</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Member</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• All guest features</li>
                                <li>• Personalized experience</li>
                                <li>• Member-only content</li>
                                <li>• Community participation</li>
                            </ul>
                        </div>

                        {/* Admin Features */}
                        <div className="text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-red-600 font-bold">⚙️</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Admin</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Full website control</li>
                                <li>• User management</li>
                                <li>• Content publishing</li>
                                <li>• System monitoring</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Access Instructions */}
                <div className="bg-gray-50 rounded-lg p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">How to Access Login</h3>
                    <div className="space-y-4 text-gray-700">
                        <p><strong>Method 1:</strong> Click the <span className="bg-blue-100 px-2 py-1 rounded text-blue-800">"Login"</span> or <span className="bg-purple-100 px-2 py-1 rounded text-purple-800">"Sign Up"</span> buttons in the navigation bar at the top of any page.</p>
                        <p><strong>Method 2:</strong> Visit <code className="bg-gray-200 px-2 py-1 rounded">/login</code> directly in your browser.</p>
                        <p><strong>Method 3:</strong> Use the buttons on this page above.</p>
                        <p><strong>Admin Access:</strong> After logging in as an admin, you'll see an <span className="bg-purple-100 px-2 py-1 rounded text-purple-800">"Admin"</span> button in the navigation or visit <code className="bg-gray-200 px-2 py-1 rounded">/admin</code> directly.</p>
                    </div>
                </div>
            </div>

            {/* Authentication Modal */}
            <AuthModal 
                isOpen={showAuthModal} 
                onClose={() => setShowAuthModal(false)} 
                mode={authMode} 
            />
        </div>
    );
};

export default LoginPage;
