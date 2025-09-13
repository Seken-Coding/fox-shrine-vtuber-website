import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Context
const ConfigContext = createContext();

// Default configuration with localStorage fallback
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
      aboutText: 'Legend has it that I was once a regular fox who stumbled upon an abandoned shrine deep in the mystical forest. After years of guarding it and absorbing its magical energy, I gained the ability to take human form and connect with the human world!'
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
};

// Configuration Provider Component
export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(getDefaultConfig);
  const [loading, setLoading] = useState(false);
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

  // Update configuration
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

  // Bulk update configuration
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

  // Reset to defaults
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

  const contextValue = {
    config,
    loading,
    error,
    updateConfig,
    updateMultipleConfig,
    resetConfig,
    isOnline: true, // Always true for localStorage version
    lastSync: new Date()
  };

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};

// Custom hook to use configuration
export const useConfig = () => {
  const context = useContext(ConfigContext);
  
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  
  return context;
};

export default useConfig;
