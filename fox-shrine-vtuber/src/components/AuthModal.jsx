import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthModal = ({ isOpen, onClose, mode = 'login' }) => {
    const [currentMode, setCurrentMode] = useState(mode);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        displayName: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [localError, setLocalError] = useState('');

    const { login, register, error } = useAuth();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setLocalError(''); // Clear error when user types
    };

    const validateForm = () => {
        if (currentMode === 'register') {
            if (!formData.username || !formData.email || !formData.password) {
                setLocalError('All fields are required');
                return false;
            }
            if (formData.password.length < 8) {
                setLocalError('Password must be at least 8 characters long');
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setLocalError('Passwords do not match');
                return false;
            }
        } else {
            if (!formData.username || !formData.password) {
                setLocalError('Username and password are required');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setLocalError('');

        try {
            let result;
            if (currentMode === 'register') {
                result = await register({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    displayName: formData.displayName || formData.username
                });
            } else {
                result = await login(formData.username, formData.password);
            }

            if (result.success) {
                onClose();
                // Reset form
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    displayName: '',
                    confirmPassword: ''
                });
            } else {
                setLocalError(result.error);
            }
        } catch (error) {
            setLocalError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = () => {
        setCurrentMode(currentMode === 'login' ? 'register' : 'login');
        setLocalError('');
        setFormData({
            username: '',
            email: '',
            password: '',
            displayName: '',
            confirmPassword: ''
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {currentMode === 'login' ? 'Welcome Back!' : 'Join Fox Shrine'}
                    </h2>
                    <p className="text-gray-600">
                        {currentMode === 'login' 
                            ? 'Sign in to access exclusive content and features'
                            : 'Create an account to become part of our community'
                        }
                    </p>
                </div>

                {/* Error Message */}
                {(localError || error) && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {localError || error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter your username"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Email (Register only) */}
                    {currentMode === 'register' && (
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                placeholder="Enter your email"
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    {/* Display Name (Register only) */}
                    {currentMode === 'register' && (
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                                Display Name (Optional)
                            </label>
                            <input
                                type="text"
                                id="displayName"
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                placeholder="Enter your display name"
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Confirm Password (Register only) */}
                    {currentMode === 'register' && (
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                placeholder="Confirm your password"
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                {currentMode === 'login' ? 'Signing in...' : 'Creating account...'}
                            </div>
                        ) : (
                            currentMode === 'login' ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>

                {/* Switch Mode */}
                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        {currentMode === 'login' ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={switchMode}
                            className="ml-1 text-purple-600 hover:text-purple-700 font-medium"
                            disabled={isLoading}
                        >
                            {currentMode === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>

                {/* Guest Note */}
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600 text-center">
                        🦊 You can browse as a guest, but creating an account unlocks exclusive features!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
