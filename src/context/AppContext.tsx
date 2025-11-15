import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings } from '../types';

interface AppContextType {
  appSettings: AppSettings;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
}

const defaultAppSettings: AppSettings = {
  isAppDarkMode: false,
  useVividColors: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : defaultAppSettings;
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
    if (appSettings.isAppDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appSettings]);

  const updateAppSettings = (settings: Partial<AppSettings>) => {
    setAppSettings(prev => ({ ...prev, ...settings }));
  };

  return (
    <AppContext.Provider value={{ appSettings, updateAppSettings }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};