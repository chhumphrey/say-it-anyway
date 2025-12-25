
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppTheme, ThemeName, CustomColors, BackgroundSettings } from '@/types';
import { getTheme } from '@/utils/themes';
import { StorageService } from '@/utils/storage';

interface ThemeContextType {
  theme: AppTheme;
  themeName: ThemeName;
  customColors: CustomColors | null;
  backgroundSettings: BackgroundSettings;
  setTheme: (themeName: ThemeName) => void;
  setCustomColors: (colors: CustomColors) => void;
  setBackgroundSettings: (settings: BackgroundSettings) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeName] = useState<ThemeName>('Gentle Sky');
  const [theme, setThemeState] = useState<AppTheme>(getTheme('Gentle Sky'));
  const [customColors, setCustomColorsState] = useState<CustomColors | null>(null);
  const [backgroundSettings, setBackgroundSettingsState] = useState<BackgroundSettings>({ scene: 'Ocean' });

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const savedTheme = await StorageService.getTheme();
    const savedCustomColors = await StorageService.getCustomColors();
    const savedBackgroundSettings = await StorageService.getBackgroundSettings();
    
    console.log('Loaded theme settings:', { savedTheme, savedBackgroundSettings });
    
    setThemeName(savedTheme);
    setCustomColorsState(savedCustomColors);
    setBackgroundSettingsState(savedBackgroundSettings);
    
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
    console.log('Setting theme:', newThemeName);
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
    console.log('Setting custom colors:', colors);
    setCustomColorsState(colors);
    await StorageService.saveCustomColors(colors);
    
    if (themeName === 'Custom') {
      setThemeState({
        name: 'Custom',
        colors: colors,
      });
    }
  };

  const setBackgroundSettings = async (settings: BackgroundSettings) => {
    console.log('Setting background settings:', settings);
    setBackgroundSettingsState(settings);
    await StorageService.saveBackgroundSettings(settings);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      themeName, 
      customColors, 
      backgroundSettings,
      setTheme, 
      setCustomColors,
      setBackgroundSettings,
    }}>
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
