import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';
import { AuthProvider } from '../hooks/useAuth';
import { ConfigProvider } from '../hooks/useConfigDatabase';

// Mock the hooks used by the component
jest.mock('../hooks/useAuth', () => ({
  ...jest.requireActual('../hooks/useAuth'),
  useAuth: () => ({
    user: { permissions: 'admin' },
    hasPermission: (role) => role === 'admin',
  }),
}));

jest.mock('../hooks/useConfigDatabase', () => ({
  ...jest.requireActual('../hooks/useConfigDatabase'),
  useConfig: () => ({
    config: {
      siteTitle: 'Test Site',
      // Add any other config properties the component might need
    },
    loading: false,
  }),
}));

describe('AdminDashboard', () => {
  it('renders without crashing', () => {
    render(
      <ConfigProvider>
        <AuthProvider>
          <AdminDashboard />
        </AuthProvider>
      </ConfigProvider>
    );
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });
});
