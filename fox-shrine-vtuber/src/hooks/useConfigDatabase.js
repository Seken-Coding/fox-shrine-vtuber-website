import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create Context
const ConfigContext = createContext();

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

// Configuration Provider Component
export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

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
      const cachedTimestamp = localStorage.getItem('foxshrine_config_timestamp');
      
      if (cachedConfig) {
        try {
          const parsedConfig = JSON.parse(cachedConfig);
          setConfig(parsedConfig);
          setLastSync(new Date(cachedTimestamp));
          console.log('📦 Using cached configuration');
          setError(`Using cached data (${error.message})`);
          return parsedConfig;
        } catch (parseError) {
          console.error('❌ Failed to parse cached configuration:', parseError);
        }
      }
      
      // Fallback to default config
      setError(error.message);
      setConfig(defaultConfig);
      console.log('🔄 Using default configuration as fallback');
      return defaultConfig;
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
      const response = await fetch(`${API_BASE_URL}/config/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value, category }),
        signal: AbortSignal.timeout(10000)
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
  }, [config, API_BASE_URL]);

  // Bulk update configuration
  const updateMultipleConfig = useCallback(async (updates) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ configs: updates }),
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Bulk update failed');
      }

      // Reload configuration after bulk update
      await loadConfigFromDatabase();
      
      console.log(`✅ Bulk configuration updated: ${updates.length} items`);
      return result.data;
    } catch (error) {
      console.error('❌ Failed to bulk update configuration:', error);
      setError(error.message);
      throw error;
    }
  }, [API_BASE_URL, loadConfigFromDatabase]);

  // Get stream status
  const getStreamStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stream/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('❌ Failed to get stream status:', error);
      return null;
    }
  }, [API_BASE_URL]);

  // Update stream status
  const updateStreamStatus = useCallback(async (streamData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stream/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(streamData),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Update local stream config
        const updatedConfig = { ...config };
        if (streamData.isLive !== undefined) updatedConfig.stream.isLive = streamData.isLive;
        if (streamData.title) updatedConfig.stream.title = streamData.title;
        if (streamData.category) updatedConfig.stream.category = streamData.category;
        if (streamData.nextStream) updatedConfig.stream.nextStreamDate = streamData.nextStream;
        if (streamData.notification) updatedConfig.stream.notification = streamData.notification;
        
        setConfig(updatedConfig);
        localStorage.setItem('foxshrine_config', JSON.stringify(updatedConfig));
      }
      
      return result.success ? result.data : null;
    } catch (error) {
      console.error('❌ Failed to update stream status:', error);
      throw error;
    }
  }, [config, API_BASE_URL]);

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

  // Deep merge helper function
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

  const isObject = (item) => {
    return item && typeof item === 'object' && !Array.isArray(item);
  };

  const contextValue = {
    config,
    loading,
    error,
    lastSync,
    isOnline,
    updateConfig,
    updateMultipleConfig,
    refreshConfig: loadConfigFromDatabase,
    getStreamStatus,
    updateStreamStatus
  };

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
