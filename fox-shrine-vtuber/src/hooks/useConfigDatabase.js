import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';

/**
 * @fileoverview Database-backed configuration management hook with real-time updates
 * @author Fox Shrine Development Team
 * @version 1.0.0
 */

// Create Configuration Context
const ConfigContext = createContext();

/**
 * Custom hook to access database configuration context
 * Must be used within a ConfigProvider component
 * 
 * @returns {Object} Configuration context containing state and methods
 * @throws {Error} If used outside of ConfigProvider
 * 
 * @example
 * const { config, updateConfig, loading, error } = useConfig();
 * 
 * // Access configuration values
 * console.log(config.siteTitle);
 * console.log(config.theme.primaryColor);
 * 
 * // Update configuration
 * await updateConfig('theme.primaryColor', '#FF0000');
 */
export const useConfig = () => useContext(ConfigContext);

/**
 * Default configuration fallback object
 * Used when database is unavailable or for new installations
 */
const defaultConfig = {
  /** @type {string} Site title displayed in browser and headers */
  siteTitle: 'Fox Shrine VTuber',
  
  /** @type {string} Site description for SEO and meta tags */
  siteDescription: 'Join the Fox Shrine for games, laughs, and shrine fox adventures!',
  
  /** @type {string} Path to site logo image */
  siteLogo: '/images/fox-shrine-logo.png',
  
  /** @type {string} Canonical site URL */
  siteUrl: 'https://foxshrinevtuber.com',
  
  /** @type {Object} VTuber character information */
  character: {
    /** @type {string} Character name */
    name: 'Fox Shrine Guardian',
    
    /** @type {string} Character description/bio */
    description: 'A mischievous fox spirit who guards an ancient shrine and streams for fun!',
    
    /** @type {string} Path to character image */
    image: '/images/fox-character.png',
    
    /** @type {string} Character greeting message */
    greeting: 'Welcome to my shrine, fellow foxes! 🦊'
  },
  
  /** @type {Object} Social media platform URLs */
  social: {
    twitchUrl: 'https://twitch.tv/foxshrinevtuber',
    youtubeUrl: 'https://youtube.com/@foxshrinevtuber',
    twitterUrl: 'https://twitter.com/foxshrinevtuber',
    discordUrl: 'https://discord.gg/foxshrine',
    instagramUrl: 'https://instagram.com/foxshrinevtuber'
  },
  
  /** @type {Object} Live streaming configuration */
  stream: {
    title: 'Fox Friday Funtime!',
    category: 'Just Chatting',
    isLive: false,
    nextStreamDate: '2025-09-15T21:00:00Z',
    notification: 'Join me tonight for some cozy games! 🎮'
  },
  
  /** @type {Object} Visual theme configuration */
  theme: {
    primaryColor: '#C41E3A',
    secondaryColor: '#FF9500',
    accentColor: '#5FB4A2',
    backgroundColor: '#F5F1E8',
    fontFamily: 'Cinzel, serif'
  },
  
  /** @type {Object} Feature toggle configuration */
  features: {
    showMerch: true,
    showDonations: true,
    showSchedule: true,
    showLatestVideos: true,
    enableNotifications: true
  },
  
  /** @type {Object} Site content and messaging */
  content: {
    heroTitle: 'Welcome to the Fox Shrine',
    heroSubtitle: 'Join me on a magical journey filled with laughter, games, and shrine fox mischief!',
    aboutText: 'Legend has it that I was once a regular fox who stumbled upon an abandoned shrine deep in the mystical forest.'
  },
  
  /** @type {Object} Contact information */
  contact: {
    businessEmail: 'business@foxshrinevtuber.com',
    fanEmail: 'fanart@foxshrinevtuber.com',
    supportEmail: 'support@foxshrinevtuber.com'
  },
  
  /** @type {Object} System-level settings */
  system: {
    maintenanceMode: false,
    maintenanceMessage: 'The shrine is currently under magical maintenance! Please check back soon! 🦊✨',
    emergencyNotice: ''
  }
};

/**
 * Utility function to check if a value is a plain object
 * Used for deep merging configuration objects
 * 
 * @param {any} item - Value to check
 * @returns {boolean} True if item is a plain object (not array or null)
 */
const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

/**
 * Deep merge two objects, combining nested properties
 * Used to merge default configuration with database configuration
 * 
 * @param {Object} target - Target object to merge into
 * @param {Object} source - Source object to merge from
 * @returns {Object} Merged object with combined properties
 */
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

/**
 * Configuration Provider Component with Database Persistence
 * Manages configuration state with real-time database synchronization and offline fallback
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap with config context
 * @returns {JSX.Element} ConfigContext.Provider with configuration state and methods
 */
export const ConfigProvider = ({ children }) => {
  /** @type {[Object, Function]} Current configuration state */
  const [config, setConfig] = useState(defaultConfig);
  
  /** @type {[boolean, Function]} Configuration loading state */
  const [loading, setLoading] = useState(true);
  
  /** @type {[string|null, Function]} Configuration error state */
  const [error, setError] = useState(null);
  
  /** @type {[Date|null, Function]} Last successful database sync timestamp */
  const [lastSync, setLastSync] = useState(null);
  
  /** @type {[boolean, Function]} Network connectivity status */
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  /** Authentication hook for making authenticated API calls */
  const { apiCall } = useAuth(); // Keep this to use the authenticated apiCall for updates

  /** API base URL based on environment */
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

  /**
   * Loads configuration from database with error handling and fallback
   * Attempts to fetch configuration from API, falls back to localStorage if unavailable
   * 
   * @returns {Promise<Object>} Configuration object from database or cache
   * @throws {Error} When both database and cache are unavailable
   */
  const loadConfigFromDatabase = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging requests
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

      // Try to load from localStorage as fallback
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

  /**
   * Updates configuration in database with optimistic updates and rollback
   * Immediately updates local state, then syncs with database
   * 
   * @param {string} key - Configuration key with dot notation (e.g., 'theme.primaryColor')
   * @param {any} value - New value to set
   * @param {string} [category='general'] - Configuration category for organization
   * @returns {Promise<Object>} Updated configuration data from server
   * @throws {Error} When update fails or user lacks permissions
   * 
   * @example
   * await updateConfig('theme.primaryColor', '#FF0000', 'theme');
   * await updateConfig('social.twitchUrl', 'https://twitch.tv/newchannel', 'social');
   */
  const updateConfig = useCallback(async (key, value, category = 'general') => {
    try {
      setError(null);
      
      // Optimistic update - immediately update local state
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

      // Send update to API server
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
      
      // Update localStorage backup
      localStorage.setItem('foxshrine_config', JSON.stringify(newConfig));
      localStorage.setItem('foxshrine_config_timestamp', new Date().toISOString());
      
      setLastSync(new Date());
      return result.data;
    } catch (error) {
      console.error('❌ Failed to update configuration:', error);
      setError(error.message);
      
      // Revert optimistic update on error
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
