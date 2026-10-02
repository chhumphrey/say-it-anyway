
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

// 'none' -- not applicable (text messages have nothing to transcribe).
// 'untranscribed' -- no attempt in progress; the initial state for a new
//   audio message and the state after a user declines a retry or a
//   background-recovery prompt.
// 'pending' -- an attempt is actively running right now.
// 'failed' -- display-only transitional state shown briefly while a
//   retry prompt is up after a failed attempt; resolves immediately to
//   either another 'pending' attempt or back to 'untranscribed'.
// 'unavailable' -- terminal. Reached once transcriptionAttempts hits the
//   cap. No further prompting.
// 'successful' -- terminal. A transcript was produced and self-harm
//   screening has completed on it.
export type TranscriptionStatus = 'none' | 'untranscribed' | 'pending' | 'failed' | 'unavailable' | 'successful';

export interface Message {
  id: string;
  recipientId: string;
  timestamp: number;
  type: 'text' | 'audio';
  textContent?: string;
  // The absolute path as originally recorded. Preserved for backward
  // compatibility with old backups and pre-1.3.1 data, but never trusted as
  // current on its own -- see audioRelativePath, which normalizeMessage()
  // resolves this back into on every read once migration has run.
  audioUri?: string;
  // Path relative to the app's Documents directory, resolved to a fresh
  // absolute audioUri at read time. The source of truth for every
  // recording's location since 1.3.1; absent until the one-time migration
  // locates and copies an older recording.
  audioRelativePath?: string;
  // Set by the migration pass when the underlying audio file could not be
  // found anywhere on disk. The message and any transcript are preserved;
  // only playback/re-transcription are unavailable.
  audioMissing?: boolean;
  audioDuration?: number;
  transcript?: string;
  transcriptionStatus?: TranscriptionStatus;
  transcriptionError?: string;
  // Which stage of transcribe() produced transcriptionError -- 'model'
  // (download/init), 'decode', or 'transcribe' (whisper.rn's own call).
  // Only 'decode' is intrinsic to this recording's bytes; see
  // utils/transcriptionAttempt.ts for why that's the only one that counts
  // toward transcriptionAttempts.
  transcriptionErrorStage?: 'model' | 'decode' | 'transcribe';
  // Number of DECODE-stage attempts that have failed for this message --
  // the only stage intrinsic to the recording itself, so the only one that
  // counts toward the cap. Never incremented by a decline, an ignored
  // prompt, or a transient (model/transcribe-stage) failure.
  // Capped at MAX_TRANSCRIPTION_ATTEMPTS (see utils/transcriptionAttempt.ts).
  transcriptionAttempts?: number;
  // How many times the background-recovery banner has been dismissed or
  // ignored for this message without a real attempt running. Reset to 0
  // whenever a real attempt starts. See utils/transcriptionAttempt.ts.
  transcriptionBannerDismissals?: number;
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
  | 'Gentle Mint'
  | 'Emerald Jewel'
  | 'Sapphire Jewel'
  | 'Ruby Jewel'
  | 'Custom';

export type BackgroundScene = 
  | 'Ocean' 
  | 'Forest' 
  | 'Mountains' 
  | 'Moody Sky' 
  | 'Dawn' 
  | 'Dusk'
  | 'Custom Photo';

export interface CustomColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  danger: string;
}

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

export interface BackgroundSettings {
  scene: BackgroundScene;
  customPhotoUri?: string;
  transparency: number; // 0-100, percentage of transparency
}

export type SupportRegion = 
  | 'United States'
  | 'United Kingdom'
  | 'Canada'
  | 'Australia'
  | 'New Zealand'
  | 'Ireland'
  | 'India'
  | 'South Africa'
  | 'Germany'
  | 'France'
  | 'Spain'
  | 'Italy'
  | 'Netherlands'
  | 'Belgium'
  | 'Switzerland'
  | 'Austria'
  | 'Sweden'
  | 'Norway'
  | 'Denmark'
  | 'Finland'
  | 'Poland'
  | 'Japan'
  | 'South Korea'
  | 'Singapore'
  | 'Hong Kong'
  | 'Brazil'
  | 'Mexico'
  | 'Argentina'
  | 'Chile';

export interface SupportResource {
  name: string;
  description: string;
  phone?: string;
  sms?: string;
  website?: string;
  type: 'crisis' | 'emergency' | 'support';
  icon: 'phone' | 'message' | 'warning';
}

export interface RegionalSupportResources {
  region: SupportRegion;
  message: string;
  resources: SupportResource[];
  additionalResources: Array<{
    title: string;
    description: string;
    url: string;
  }>;
}
