import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthModal from './AuthModal';
import { AuthProvider } from '../hooks/useAuth';

// Mock the useAuth hook
const mockLogin = jest.fn();
const mockRegister = jest.fn();

jest.mock('../hooks/useAuth', () => ({
  ...jest.requireActual('../hooks/useAuth'),
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    error: null,
    loading: false,
  }),
}));

describe('AuthModal', () => {
  it('renders login form by default', () => {
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={() => {}} />
      </AuthProvider>
    );
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('switches to register form', () => {
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={() => {}} />
      </AuthProvider>
    );
    fireEvent.click(screen.getByText(/Sign up/i));
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
  });
});
