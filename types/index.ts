
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

// Recording Time Management
export interface RecordingTime {
  freeMonthly: number; // Seconds remaining in free monthly pool (300 max)
  subscriberMonthly: number; // Seconds remaining in subscriber monthly pool (3600 max)
  purchasedExtra: number; // Seconds remaining in purchased extra pool (rolls over)
  lastResetMonth: number; // Month (1-12) when pools were last reset
  lastResetYear: number; // Year when pools were last reset
}

// Subscription Status
export type SubscriptionTier = 'Free' | 'Subscriber' | 'Subscriber (Unlocked)';

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  isUnlocked: boolean; // True if unlocked via access code
  unlockedDate?: number; // Timestamp when unlocked via access code
  storeSubscriptionActive?: boolean; // True if store subscription is active
  subscriptionActivatedDate?: number; // Timestamp when store subscription was activated
}
