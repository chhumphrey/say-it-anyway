
import { AppTheme, ThemeName } from '@/types';

export const themes: Record<ThemeName, AppTheme> = {
  'Soft Lavender': {
    name: 'Soft Lavender',
    colors: {
      background: '#F8F7FF',
      card: '#FFFFFF',
      text: '#2D2D3A',
      textSecondary: '#6B6B7B',
      primary: '#9B8FD9',
      secondary: '#C4B8E8',
      accent: '#7B6FC4',
      border: '#E8E4F3',
      danger: '#E57373',
    },
  },
  'Gentle Sky': {
    name: 'Gentle Sky',
    colors: {
      background: '#F0F8FF',
      card: '#FFFFFF',
      text: '#2C3E50',
      textSecondary: '#5D6D7E',
      primary: '#87CEEB',
      secondary: '#B0E2FF',
      accent: '#4682B4',
      border: '#D6EAF8',
      danger: '#E57373',
    },
  },
  'Warm Sand': {
    name: 'Warm Sand',
    colors: {
      background: '#FFF8F0',
      card: '#FFFFFF',
      text: '#3E2723',
      textSecondary: '#6D4C41',
      primary: '#D4A574',
      secondary: '#E8C9A0',
      accent: '#A67C52',
      border: '#F5E6D3',
      danger: '#E57373',
    },
  },
  'Peaceful Sage': {
    name: 'Peaceful Sage',
    colors: {
      background: '#F5F8F5',
      card: '#FFFFFF',
      text: '#2E3B2E',
      textSecondary: '#5A6B5A',
      primary: '#8FA88F',
      secondary: '#B8C9B8',
      accent: '#6B8E6B',
      border: '#DDE8DD',
      danger: '#E57373',
    },
  },
  'Calm Ocean': {
    name: 'Calm Ocean',
    colors: {
      background: '#F0F7F7',
      card: '#FFFFFF',
      text: '#1A3A3A',
      textSecondary: '#4A6A6A',
      primary: '#5F9EA0',
      secondary: '#8FC1C3',
      accent: '#3A7A7C',
      border: '#D4E8E8',
      danger: '#E57373',
    },
  },
  'Sunset Rose': {
    name: 'Sunset Rose',
    colors: {
      background: '#FFF5F7',
      card: '#FFFFFF',
      text: '#3A2A2E',
      textSecondary: '#6A5A5E',
      primary: '#D4A5A5',
      secondary: '#E8C9C9',
      accent: '#B87A7A',
      border: '#F5E0E5',
      danger: '#E57373',
    },
  },
  'Misty Gray': {
    name: 'Misty Gray',
    colors: {
      background: '#F5F5F7',
      card: '#FFFFFF',
      text: '#2C2C2E',
      textSecondary: '#5C5C5E',
      primary: '#9E9EA0',
      secondary: '#C8C8CA',
      accent: '#6E6E70',
      border: '#E5E5E7',
      danger: '#E57373',
    },
  },
  'Gentle Mint': {
    name: 'Gentle Mint',
    colors: {
      background: '#F0FFF4',
      card: '#FFFFFF',
      text: '#1A3A2A',
      textSecondary: '#4A6A5A',
      primary: '#7FC9A0',
      secondary: '#A8E0C3',
      accent: '#5AA87C',
      border: '#D4F0E0',
      danger: '#E57373',
    },
  },
};

export const getTheme = (themeName: ThemeName): AppTheme => {
  return themes[themeName];
};

export const themeNames: ThemeName[] = Object.keys(themes) as ThemeName[];
