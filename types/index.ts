
export type Gender = 'Male' | 'Female' | 'Non-Binary' | 'Decline to State';

export interface Recipient {
  id: string;
  name: string;
  nickname?: string;
  gender?: Gender;
  photoUri?: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  notes?: string;
  lastMessageTimestamp?: number;
  isDefault?: boolean;
}

export type TranscriptionStatus = 'pending' | 'completed' | 'failed' | 'none';

export interface Message {
  id: string;
  recipientId: string;
  timestamp: number;
  type: 'text' | 'audio';
  textContent?: string;
  audioUri?: string;
  audioDuration?: number; // Duration in seconds
  transcript?: string;
  transcriptionStatus?: TranscriptionStatus;
  transcriptionError?: string;
  isHidden: boolean;
}

export interface UserProfile {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  preferredPronouns?: string;
  photoUri?: string;
}

export type ThemeName = 
  | 'Soft Lavender' 
  | 'Gentle Sky' 
  | 'Warm Sand' 
  | 'Peaceful Sage' 
  | 'Calm Ocean' 
  | 'Sunset Rose'
  | 'Misty Gray'
  | 'Gentle Mint';

export interface AppTheme {
  name: ThemeName;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    danger: string;
  };
}
