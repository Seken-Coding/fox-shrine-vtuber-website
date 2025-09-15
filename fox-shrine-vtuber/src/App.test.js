import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the providers to prevent actual API calls and context issues
jest.mock('./hooks/useAuth', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({
    user: null,
    loading: false,
  }),
}));

jest.mock('./hooks/useConfigDatabase', () => ({
  ConfigProvider: ({ children }) => <div>{children}</div>,
  useConfig: () => ({
    config: {
      siteTitle: 'Fox Shrine VTuber',
      // Mock other necessary config properties
    },
    loading: false,
  }),
}));

test('renders the hero section title', async () => {
  render(<App />);
  const titleElement = await screen.findByText(/Welcome to the Fox Shrine/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders learn react link', () => {
  render(<App />);
  // A simple test to ensure the component renders without crashing.
  // The actual content is less important here than preventing test side-effects.
  expect(screen.getByText(/Fox Shrine VTuber/i)).toBeInTheDocument();
});
