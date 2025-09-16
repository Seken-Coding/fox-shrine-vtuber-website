import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * @fileoverview Local configuration management hook with localStorage persistence
 * @author Fox Shrine Development Team
 * @version 1.0.0
 */

// Create Configuration Context
const ConfigContext = createContext();

/**
 * Gets the default configuration object with localStorage fallback
 * Attempts to load cached configuration from localStorage before falling back to defaults
 * 
 * @returns {Object} Complete configuration object with all default values
 */
const getDefaultConfig = () => {
  // Try to load from localStorage first
  try {
    const cached = localStorage.getItem('foxshrine_config');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('Failed to load cached config:', error);
  }

  // Fallback to default values
  return {
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
      /** @type {string} Twitch channel URL */
      twitchUrl: 'https://twitch.tv/foxshrinevtuber',
      
      /** @type {string} YouTube channel URL */
      youtubeUrl: 'https://youtube.com/@foxshrinevtuber',
      
      /** @type {string} Twitter profile URL */
      twitterUrl: 'https://twitter.com/foxshrinevtuber',
      
      /** @type {string} Discord server invite URL */
      discordUrl: 'https://discord.gg/foxshrine',
      
      /** @type {string} Instagram profile URL */
      instagramUrl: 'https://instagram.com/foxshrinevtuber'
    },
    
    /** @type {Object} Live streaming configuration */
    stream: {
      /** @type {string} Current stream title */
      title: 'Fox Friday Funtime!',
      
      /** @type {string} Stream category/game */
      category: 'Just Chatting',
      
      /** @type {boolean} Live streaming status */
      isLive: false,
      
      /** @type {string} Next scheduled stream date (ISO format) */
      nextStreamDate: '2025-09-15T21:00:00Z',
      
      /** @type {string} Stream notification message */
      notification: 'Join me tonight for some cozy games! 🎮'
    },
    
    /** @type {Object} Visual theme configuration */
    theme: {
      /** @type {string} Primary brand color (hex) */
      primaryColor: '#C41E3A',
      
      /** @type {string} Secondary accent color (hex) */
      secondaryColor: '#FF9500',
      
      /** @type {string} Tertiary accent color (hex) */
      accentColor: '#5FB4A2',
      
      /** @type {string} Background color (hex) */
      backgroundColor: '#F5F1E8',
      
      /** @type {string} Primary font family */
      fontFamily: 'Cinzel, serif'
    },
    
    /** @type {Object} Feature toggle configuration */
    features: {
      /** @type {boolean} Show merchandise section */
      showMerch: true,
      
      /** @type {boolean} Show donation/support options */
      showDonations: true,
      
      /** @type {boolean} Show streaming schedule */
      showSchedule: true,
      
      /** @type {boolean} Show latest videos section */
      showLatestVideos: true,
      
      /** @type {boolean} Enable browser notifications */
      enableNotifications: true
    },
    
    /** @type {Object} Site content and messaging */
    content: {
      /** @type {string} Main hero section title */
      heroTitle: 'Welcome to the Fox Shrine',
      
      /** @type {string} Hero section subtitle */
      heroSubtitle: 'Join me on a magical journey filled with laughter, games, and shrine fox mischief!',
      
      /** @type {string} About section text content */
      aboutText: 'Legend has it that I was once a regular fox who stumbled upon an abandoned shrine deep in the mystical forest. After years of guarding it and absorbing its magical energy, I gained the ability to take human form and connect with the human world!'
    },
    
    /** @type {Object} Contact information */
    contact: {
      /** @type {string} Business inquiries email */
      businessEmail: 'business@foxshrinevtuber.com',
      
      /** @type {string} Fan art submissions email */
      fanEmail: 'fanart@foxshrinevtuber.com',
      
      /** @type {string} Technical support email */
      supportEmail: 'support@foxshrinevtuber.com'
    },
    
    /** @type {Object} System-level settings */
    system: {
      /** @type {boolean} Site maintenance mode toggle */
      maintenanceMode: false,
      
      /** @type {string} Maintenance mode message */
      maintenanceMessage: 'The shrine is currently under magical maintenance! Please check back soon! 🦊✨',
      
      /** @type {string} Emergency notice banner text */
      emergencyNotice: ''
    }
  };
};

/**
 * Configuration Provider Component
 * Manages local configuration state with localStorage persistence
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap with config context
 * @returns {JSX.Element} ConfigContext.Provider with configuration state and methods
 */
export const ConfigProvider = ({ children }) => {
  /** @type {[Object, Function]} Current configuration state */
  const [config, setConfig] = useState(getDefaultConfig);
  
  /** @type {[string|null, Function]} Configuration error state */
  const [error, setError] = useState(null);

  // Save to localStorage whenever config changes
  useEffect(() => {
    try {
      localStorage.setItem('foxshrine_config', JSON.stringify(config));
      localStorage.setItem('foxshrine_config_timestamp', new Date().toISOString());
    } catch (error) {
      console.warn('Failed to save config to localStorage:', error);
    }
  }, [config]);

  /**
   * Updates a configuration value using dot notation
   * Supports nested object paths like 'theme.primaryColor' or 'social.twitchUrl'
   * 
   * @param {string} key - Configuration key with dot notation (e.g., 'theme.primaryColor')
   * @param {any} value - New value to set
   * @returns {boolean} True if update was successful, false otherwise
   * 
   * @example
   * updateConfig('theme.primaryColor', '#FF0000');
   * updateConfig('social.twitchUrl', 'https://twitch.tv/newchannel');
   * updateConfig('features.showMerch', false);
   */
  const updateConfig = (key, value) => {
    try {
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
      console.log(`✅ Configuration updated: ${key} = ${value}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to update configuration:', error);
      setError(error.message);
      return false;
    }
  };

  /**
   * Updates multiple configuration values at once
   * More efficient than multiple individual updates
   * 
   * @param {Array<{key: string, value: any}>} updates - Array of update objects
   * @returns {boolean} True if all updates were successful, false otherwise
   * 
   * @example
   * updateMultipleConfig([
   *   { key: 'siteTitle', value: 'New Site Title' },
   *   { key: 'theme.primaryColor', value: '#00FF00' },
   *   { key: 'features.showMerch', value: false }
   * ]);
   */
  const updateMultipleConfig = (updates) => {
    try {
      const newConfig = { ...config };
      
      updates.forEach(({ key, value }) => {
        const keyPath = key.split('.');
        let current = newConfig;
        
        for (let i = 0; i < keyPath.length - 1; i++) {
          if (!current[keyPath[i]]) {
            current[keyPath[i]] = {};
          }
          current = current[keyPath[i]];
        }
        current[keyPath[keyPath.length - 1]] = value;
      });
      
      setConfig(newConfig);
      console.log(`✅ Bulk configuration updated: ${updates.length} items`);
      return true;
    } catch (error) {
      console.error('❌ Failed to bulk update configuration:', error);
      setError(error.message);
      return false;
    }
  };

  /**
   * Resets configuration to default values
   * Clears localStorage cache and restores factory defaults
   * 
   * @returns {boolean} True if reset was successful, false otherwise
   * 
   * @example
   * const success = resetConfig();
   * if (success) {
   *   console.log('Configuration reset to defaults');
   * }
   */
  const resetConfig = () => {
    try {
      localStorage.removeItem('foxshrine_config');
      localStorage.removeItem('foxshrine_config_timestamp');
      setConfig(getDefaultConfig());
      setError(null);
      console.log('✅ Configuration reset to defaults');
      return true;
    } catch (error) {
      console.error('❌ Failed to reset configuration:', error);
      setError(error.message);
      return false;
    }
  };

  /**
   * Context value object containing all configuration state and methods
   */
  const contextValue = {
    /** @type {Object} Current configuration object */
    config,
    
    /** @type {string|null} Current error message */
    error,
    
    /** @type {Function} Update single configuration value */
    updateConfig,
    
    /** @type {Function} Update multiple configuration values */
    updateMultipleConfig,
    
    /** @type {Function} Reset configuration to defaults */
    resetConfig,
    
    /** @type {boolean} Always true for localStorage version */
    isOnline: true,
    
    /** @type {Date} Last sync timestamp */
    lastSync: new Date()
  };

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};

/**
 * Custom hook to access configuration context
 * Must be used within a ConfigProvider component
 * 
 * @returns {Object} Configuration context containing state and methods
 * @throws {Error} If used outside of ConfigProvider
 * 
 * @example
 * const { config, updateConfig, resetConfig } = useConfig();
 * 
 * // Update a configuration value
 * updateConfig('theme.primaryColor', '#FF0000');
 * 
 * // Access configuration values
 * console.log(config.siteTitle);
 * console.log(config.theme.primaryColor);
 */
export const useConfig = () => {
  const context = useContext(ConfigContext);
  
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  
  return context;
};

export default useConfig;
