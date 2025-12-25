
import { AppTheme, ThemeName, BackgroundScene, CustomColors } from '@/types';

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
      background: '#E8F4F8',
      card: '#FFFFFF',
      text: '#1A3A4A',
      textSecondary: '#5D7A8A',
      primary: '#5BA3C5',
      secondary: '#A8D5E8',
      accent: '#3A7A9C',
      border: '#C8E3EF',
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
      background: '#F2F5F0',
      card: '#FFFFFF',
      text: '#2E3B2E',
      textSecondary: '#5A6B5A',
      primary: '#7A9B7A',
      secondary: '#B8C9B8',
      accent: '#5A7A5A',
      border: '#DDE8DD',
      danger: '#E57373',
    },
  },
  'Calm Ocean': {
    name: 'Calm Ocean',
    colors: {
      background: '#E8F5F5',
      card: '#FFFFFF',
      text: '#1A3A3A',
      textSecondary: '#4A6A6A',
      primary: '#4A8A8C',
      secondary: '#8FC1C3',
      accent: '#2A6A6C',
      border: '#C8E3E3',
      danger: '#E57373',
    },
  },
  'Sunset Rose': {
    name: 'Sunset Rose',
    colors: {
      background: '#FFF0F3',
      card: '#FFFFFF',
      text: '#3A2A2E',
      textSecondary: '#6A5A5E',
      primary: '#D47A8A',
      secondary: '#E8B8C3',
      accent: '#B85A6A',
      border: '#F5D8E0',
      danger: '#E57373',
    },
  },
  'Misty Gray': {
    name: 'Misty Gray',
    colors: {
      background: '#F2F2F5',
      card: '#FFFFFF',
      text: '#2C2C2E',
      textSecondary: '#5C5C5E',
      primary: '#7A7A8C',
      secondary: '#C8C8CA',
      accent: '#5A5A6C',
      border: '#E0E0E5',
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
      primary: '#5FB98A',
      secondary: '#A8E0C3',
      accent: '#3A9A6A',
      border: '#D0F0E0',
      danger: '#E57373',
    },
  },
  'Emerald Jewel': {
    name: 'Emerald Jewel',
    colors: {
      background: '#E8F5F0',
      card: '#FFFFFF',
      text: '#0D3B2E',
      textSecondary: '#2D5B4E',
      primary: '#50C878',
      secondary: '#7FD99F',
      accent: '#2E8B57',
      border: '#C8E8DC',
      danger: '#E57373',
    },
  },
  'Sapphire Jewel': {
    name: 'Sapphire Jewel',
    colors: {
      background: '#E8F0F8',
      card: '#FFFFFF',
      text: '#0A2540',
      textSecondary: '#2A4560',
      primary: '#0F52BA',
      secondary: '#4A7FD9',
      accent: '#082A5E',
      border: '#C8D8E8',
      danger: '#E57373',
    },
  },
  'Ruby Jewel': {
    name: 'Ruby Jewel',
    colors: {
      background: '#F8E8F0',
      card: '#FFFFFF',
      text: '#3A0D2E',
      textSecondary: '#5A2D4E',
      primary: '#E0115F',
      secondary: '#F04A8F',
      accent: '#9B0A3C',
      border: '#E8C8DC',
      danger: '#E57373',
    },
  },
  'Custom': {
    name: 'Custom',
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
};

export const getTheme = (themeName: ThemeName): AppTheme => {
  return themes[themeName];
};

export const themeNames: ThemeName[] = Object.keys(themes) as ThemeName[];

export const backgroundScenes: BackgroundScene[] = [
  'Ocean',
  'Forest',
  'Mountains',
  'Moody Sky',
  'Dawn',
  'Dusk',
  'Custom Photo',
];

// Generate a background gradient based on scene and color palette
export const generateSceneBackground = (scene: BackgroundScene, colors: CustomColors): string => {
  console.log('Generating background for scene:', scene);
  
  switch (scene) {
    case 'Ocean':
      // Blue gradient from light to deep
      return `linear-gradient(180deg, ${colors.secondary}40, ${colors.primary}60)`;
    
    case 'Forest':
      // Green gradient with earthy tones
      return `linear-gradient(180deg, ${colors.accent}30, ${colors.primary}50)`;
    
    case 'Mountains':
      // Gray-blue gradient for mountain peaks
      return `linear-gradient(180deg, ${colors.background}, ${colors.secondary}50)`;
    
    case 'Moody Sky':
      // Darker, more dramatic gradient
      return `linear-gradient(180deg, ${colors.primary}50, ${colors.accent}70)`;
    
    case 'Dawn':
      // Warm sunrise colors
      return `linear-gradient(180deg, ${colors.secondary}30, ${colors.accent}40)`;
    
    case 'Dusk':
      // Warm sunset colors with deeper tones
      return `linear-gradient(180deg, ${colors.accent}50, ${colors.primary}60)`;
    
    case 'Custom Photo':
      // No gradient for custom photos
      return 'transparent';
    
    default:
      return `linear-gradient(180deg, ${colors.background}, ${colors.secondary}40)`;
  }
};

// Get Unsplash image URL for scene
export const getSceneImageUrl = (scene: BackgroundScene): string => {
  switch (scene) {
    case 'Ocean':
      return 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&q=80';
    
    case 'Forest':
      return 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80';
    
    case 'Mountains':
      return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80';
    
    case 'Moody Sky':
      return 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1200&q=80';
    
    case 'Dawn':
      return 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1200&q=80';
    
    case 'Dusk':
      return 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1200&q=80';
    
    case 'Custom Photo':
      return '';
    
    default:
      return 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80';
  }
};
