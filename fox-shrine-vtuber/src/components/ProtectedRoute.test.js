import React from 'react';
import { render, screen } from '@testing-library/react';

// Do not import ProtectedRoute statically; we will require it after setting mocks per test

describe('ProtectedRoute (unit)', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('shows Authentication Required when not authenticated', () => {
    // Default mock: not authenticated
    jest.doMock('../hooks/useAuth', () => ({
      useAuth: () => ({
        isAuthenticated: () => false,
        isAdmin: () => false,
      }),
    }));
    let ProtectedRouteReloaded;
    jest.isolateModules(() => {
      ProtectedRouteReloaded = require('./ProtectedRoute').default;
    });
    render(
      <ProtectedRouteReloaded>
        <div>Secret</div>
      </ProtectedRouteReloaded>
    );
    expect(screen.getByText(/Authentication Required/i)).toBeInTheDocument();
  });

  it('blocks when requireAdmin and not admin', () => {
    jest.doMock('../hooks/useAuth', () => ({
      useAuth: () => ({
        isAuthenticated: () => true,
        isAdmin: () => false,
      }),
    }));
    let ProtectedRouteReloaded;
    jest.isolateModules(() => {
      ProtectedRouteReloaded = require('./ProtectedRoute').default;
    });
    render(
      <ProtectedRouteReloaded requireAdmin>
        <div>Admin Secret</div>
      </ProtectedRouteReloaded>
    );
    expect(screen.getByText(/Unauthorized/i)).toBeInTheDocument();
  });

  it('renders children when authenticated and admin (if required)', () => {
    jest.doMock('../hooks/useAuth', () => ({
      useAuth: () => ({
        isAuthenticated: () => true,
        isAdmin: () => true,
      }),
    }));
    let ProtectedRouteReloaded;
    jest.isolateModules(() => {
      ProtectedRouteReloaded = require('./ProtectedRoute').default;
    });
    render(
      <ProtectedRouteReloaded requireAdmin>
        <div>Admin Area</div>
      </ProtectedRouteReloaded>
    );
    expect(screen.getByText(/Admin Area/i)).toBeInTheDocument();
  });
});
