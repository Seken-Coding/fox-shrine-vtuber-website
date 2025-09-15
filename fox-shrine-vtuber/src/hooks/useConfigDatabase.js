import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';

// Create Context
const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

// Default configuration fallback
const defaultConfig = {
  siteTitle: 'Fox Shrine VTuber',
  siteDescription: 'Join the Fox Shrine for games, laughs, and shrine fox adventures!',
  siteLogo: '/images/fox-shrine-logo.png',
  siteUrl: 'https://foxshrinevtuber.com',
  
  character: {
    name: 'Fox Shrine Guardian',
    description: 'A mischievous fox spirit who guards an ancient shrine and streams for fun!',
    image: '/images/fox-character.png',
    greeting: 'Welcome to my shrine, fellow foxes! 🦊'
  },
  
  social: {
    twitchUrl: 'https://twitch.tv/foxshrinevtuber',
    youtubeUrl: 'https://youtube.com/@foxshrinevtuber',
    twitterUrl: 'https://twitter.com/foxshrinevtuber',
    discordUrl: 'https://discord.gg/foxshrine',
    instagramUrl: 'https://instagram.com/foxshrinevtuber'
  },
  
  stream: {
    title: 'Fox Friday Funtime!',
    category: 'Just Chatting',
    isLive: false,
    nextStreamDate: '2025-09-15T21:00:00Z',
    notification: 'Join me tonight for some cozy games! 🎮'
  },
  
  theme: {
    primaryColor: '#C41E3A',
    secondaryColor: '#FF9500',
    accentColor: '#5FB4A2',
    backgroundColor: '#F5F1E8',
    fontFamily: 'Cinzel, serif'
  },
  
  features: {
    showMerch: true,
    showDonations: true,
    showSchedule: true,
    showLatestVideos: true,
    enableNotifications: true
  },
  
  content: {
    heroTitle: 'Welcome to the Fox Shrine',
    heroSubtitle: 'Join me on a magical journey filled with laughter, games, and shrine fox mischief!',
    aboutText: 'Legend has it that I was once a regular fox who stumbled upon an abandoned shrine deep in the mystical forest.'
  },
  
  contact: {
    businessEmail: 'business@foxshrinevtuber.com',
    fanEmail: 'fanart@foxshrinevtuber.com',
    supportEmail: 'support@foxshrinevtuber.com'
  },
  
  system: {
    maintenanceMode: false,
    maintenanceMessage: 'The shrine is currently under magical maintenance! Please check back soon! 🦊✨',
    emergencyNotice: ''
  }
};

const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

const mergeDeep = (target, source) => {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  
  return output;
};

// Configuration Provider Component
export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { apiCall } = useAuth(); // Keep this to use the authenticated apiCall for updates

  const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://fox-shrine-vtuber-website.onrender.com/api'
    : 'http://localhost:3002/api';

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load configuration from API
  const loadConfigFromDatabase = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Merge with default config to ensure all properties exist
        const mergedConfig = mergeDeep(defaultConfig, result.data);
        setConfig(mergedConfig);
        setLastSync(new Date());
        
        // Save to localStorage as backup
        localStorage.setItem('foxshrine_config', JSON.stringify(mergedConfig));
        localStorage.setItem('foxshrine_config_timestamp', new Date().toISOString());
        
        console.log('✅ Configuration loaded from database successfully');
        return mergedConfig;
      } else {
        throw new Error(result.error || 'Invalid response format');
      }
    } catch (error) {
      console.error('❌ Failed to load configuration from database:', error);

      // Try to load from localStorage
      const cachedConfig = localStorage.getItem('foxshrine_config');
      if (cachedConfig) {
        console.log('🔄 Using cached configuration as fallback');
        setConfig(JSON.parse(cachedConfig));
      } else {
        // Fallback to default config
        setError(error.message);
        setConfig(defaultConfig);
        console.log('🔄 Using default configuration as fallback');
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Update configuration in database
  const updateConfig = useCallback(async (key, value, category = 'general') => {
    try {
      setError(null);
      
      // Optimistic update
      const keyPath = key.split('.');
      const newConfig = { ...config };
      let current = newConfig;
      
      for (let i = 0; i < keyPath.length - 1; i++) {
        if (!current[keyPath[i]]) {
          current[keyPath[i]] = {};
        }
        current = current[keyPath[i]];
      }
      current[keyPath[keyPath.length - 1]] = value;
      setConfig(newConfig);

      // Send to API
      const response = await apiCall(`${API_BASE_URL}/config/${key}`, 'PUT', {
        value,
        category
      });

      if (!response.ok) {
        // Revert optimistic update on failure
        setConfig(config);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        // Revert optimistic update on failure
        setConfig(config);
        throw new Error(result.error || 'Update failed');
      }

      console.log(`✅ Configuration updated: ${key} = ${value}`);
      
      // Update localStorage
      localStorage.setItem('foxshrine_config', JSON.stringify(newConfig));
      localStorage.setItem('foxshrine_config_timestamp', new Date().toISOString());
      
      setLastSync(new Date());
      return result.data;
    } catch (error) {
      console.error('❌ Failed to update configuration:', error);
      setError(error.message);
      
      // Revert optimistic update
      setConfig(config);
      throw error;
    }
  }, [config, API_BASE_URL, apiCall]);

  // Initial load
  useEffect(() => {
    const initializeConfig = async () => {
      setLoading(true);
      try {
        if (isOnline) {
          await loadConfigFromDatabase();
        } else {
          // Load from cache when offline
          const cachedConfig = localStorage.getItem('foxshrine_config');
          if (cachedConfig) {
            const parsedConfig = JSON.parse(cachedConfig);
            setConfig(parsedConfig);
            const cachedTimestamp = localStorage.getItem('foxshrine_config_timestamp');
            setLastSync(new Date(cachedTimestamp));
            setError('Offline - using cached data');
          }
        }
      } catch (error) {
        console.error('Failed to initialize config:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeConfig();
  }, [isOnline, loadConfigFromDatabase]);

  // Auto-refresh configuration every 5 minutes if online
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      loadConfigFromDatabase();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isOnline, loadConfigFromDatabase]);

  
  
  const contextValue = useMemo(() => ({
    config,
    loading,
    error,
    lastSync,
    isOnline,
    updateConfig,
    refreshConfig: loadConfigFromDatabase,
  }), [config, loading, error, lastSync, isOnline, updateConfig, loadConfigFromDatabase]);

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};

// Custom hook to use configuration
export const useConfigDatabase = () => {
  const context = useContext(ConfigContext);
  
  if (!context) {
    throw new Error('useConfigDatabase must be used within a ConfigProvider');
  }
  
  return context;
};

export default useConfigDatabase;
