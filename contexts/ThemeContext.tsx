
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppTheme, ThemeName, CustomColors, BackgroundSettings, SupportRegion } from '@/types';
import { getTheme } from '@/utils/themes';
import { StorageService } from '@/utils/storage';
import { getDefaultRegionFromLocale } from '@/utils/supportResources';
import * as Localization from 'expo-localization';

interface ThemeContextType {
  theme: AppTheme;
  themeName: ThemeName;
  customColors: CustomColors | null;
  backgroundSettings: BackgroundSettings;
  supportRegion: SupportRegion;
  setTheme: (themeName: ThemeName) => void;
  setCustomColors: (colors: CustomColors) => void;
  setBackgroundSettings: (settings: BackgroundSettings) => void;
  setSupportRegion: (region: SupportRegion) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeName] = useState<ThemeName>('Gentle Sky');
  const [theme, setThemeState] = useState<AppTheme>(getTheme('Gentle Sky'));
  const [customColors, setCustomColorsState] = useState<CustomColors | null>(null);
  const [backgroundSettings, setBackgroundSettingsState] = useState<BackgroundSettings>({ 
    scene: 'Ocean',
    transparency: 15,
  });
  const [supportRegion, setSupportRegionState] = useState<SupportRegion>('United States');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const savedTheme = await StorageService.getTheme();
    const savedCustomColors = await StorageService.getCustomColors();
    const savedBackgroundSettings = await StorageService.getBackgroundSettings();
    const savedSupportRegion = await StorageService.getSupportRegion();
    
    console.log('Loaded theme settings:', { savedTheme, savedBackgroundSettings, savedSupportRegion });
    
    setThemeName(savedTheme);
    setCustomColorsState(savedCustomColors);
    
    // Ensure transparency is set, default to 15 if not present
    const settingsWithTransparency = {
      ...savedBackgroundSettings,
      transparency: savedBackgroundSettings.transparency ?? 15,
    };
    setBackgroundSettingsState(settingsWithTransparency);
    
    // Set support region - use saved region or detect from device locale
    if (savedSupportRegion) {
      console.log('Using saved support region:', savedSupportRegion);
      setSupportRegionState(savedSupportRegion);
    } else {
      const deviceLocale = Localization.getLocales()[0]?.languageTag || 'en-US';
      const detectedRegion = getDefaultRegionFromLocale(deviceLocale);
      console.log('Detected support region from device locale:', deviceLocale, '→', detectedRegion);
      setSupportRegionState(detectedRegion);
      await StorageService.saveSupportRegion(detectedRegion);
    }
    
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

  const setSupportRegion = async (region: SupportRegion) => {
    console.log('Setting support region:', region);
    setSupportRegionState(region);
    await StorageService.saveSupportRegion(region);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      themeName, 
      customColors, 
      backgroundSettings,
      supportRegion,
      setTheme, 
      setCustomColors,
      setBackgroundSettings,
      setSupportRegion,
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
