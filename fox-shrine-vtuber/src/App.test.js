import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the providers to prevent actual API calls and context issues
jest.mock('./hooks/useAuth', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({
    user: null,
    loading: false,
    isAuthenticated: () => false,
    isAdmin: () => false,
  }),
}));

jest.mock('./hooks/useConfigDatabase', () => ({
  ConfigProvider: ({ children }) => <div>{children}</div>,
  useConfig: () => ({
    config: {
      siteTitle: 'Fox Shrine VTuber',
      social: {
        twitchUrl: 'https://twitch.tv/foxshrine',
        youtubeUrl: 'https://youtube.com/@foxshrine',
        twitterUrl: 'https://twitter.com/foxshrine',
        discordUrl: 'https://discord.gg/foxshrine',
        instagramUrl: 'https://instagram.com/foxshrine',
      },
      stream: {
        latestStreamEmbedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      },
      content: {
        latestVideos: [],
        schedule: [],
        merch: [],
      },
    },
    loading: false,
  }),
  useConfigDatabase: () => ({
    config: {
      siteTitle: 'Fox Shrine VTuber',
      social: {
        twitchUrl: 'https://twitch.tv/foxshrine',
        youtubeUrl: 'https://youtube.com/@foxshrine',
        twitterUrl: 'https://twitter.com/foxshrine',
        discordUrl: 'https://discord.gg/foxshrine',
        instagramUrl: 'https://instagram.com/foxshrine',
      },
      stream: {
        latestStreamEmbedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      },
      content: {
        latestVideos: [],
        schedule: [],
        merch: [],
      },
    },
    loading: false,
    error: null,
    lastSync: null,
    isOnline: true,
    updateConfig: jest.fn(),
    refreshConfig: jest.fn(),
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
