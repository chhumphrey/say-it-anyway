
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppTheme, ThemeName } from '@/types';
import { getTheme } from '@/utils/themes';
import { StorageService } from '@/utils/storage';

interface ThemeContextType {
  theme: AppTheme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeName] = useState<ThemeName>('Gentle Sky');
  const [theme, setThemeState] = useState<AppTheme>(getTheme('Gentle Sky'));

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const savedTheme = await StorageService.getTheme();
    setThemeName(savedTheme);
    setThemeState(getTheme(savedTheme));
  };

  const setTheme = async (newThemeName: ThemeName) => {
    setThemeName(newThemeName);
    setThemeState(getTheme(newThemeName));
    await StorageService.saveTheme(newThemeName);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
};
