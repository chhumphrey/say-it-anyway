
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppTheme, ThemeName, CustomColors } from '@/types';
import { getTheme } from '@/utils/themes';
import { StorageService } from '@/utils/storage';

interface ThemeContextType {
  theme: AppTheme;
  themeName: ThemeName;
  customColors: CustomColors | null;
  setTheme: (themeName: ThemeName) => void;
  setCustomColors: (colors: CustomColors) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeName] = useState<ThemeName>('Gentle Sky');
  const [theme, setThemeState] = useState<AppTheme>(getTheme('Gentle Sky'));
  const [customColors, setCustomColorsState] = useState<CustomColors | null>(null);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const savedTheme = await StorageService.getTheme();
    const savedCustomColors = await StorageService.getCustomColors();
    
    setThemeName(savedTheme);
    setCustomColorsState(savedCustomColors);
    
    if (savedTheme === 'Custom' && savedCustomColors) {
      setThemeState({
        name: 'Custom',
        colors: savedCustomColors,
      });
    } else {
      setThemeState(getTheme(savedTheme));
    }
  };

  const setTheme = async (newThemeName: ThemeName) => {
    setThemeName(newThemeName);
    
    if (newThemeName === 'Custom' && customColors) {
      setThemeState({
        name: 'Custom',
        colors: customColors,
      });
    } else {
      setThemeState(getTheme(newThemeName));
    }
    
    await StorageService.saveTheme(newThemeName);
  };

  const setCustomColors = async (colors: CustomColors) => {
    setCustomColorsState(colors);
    await StorageService.saveCustomColors(colors);
    
    if (themeName === 'Custom') {
      setThemeState({
        name: 'Custom',
        colors: colors,
      });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, customColors, setTheme, setCustomColors }}>
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
