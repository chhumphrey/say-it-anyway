
export interface TranscriptionResult {
  success: boolean;
  transcript?: string;
  error?: string;
  method?: 'web-speech-api' | 'manual' | 'unavailable';
}

export const transcribeAudio = async (audioUri: string): Promise<TranscriptionResult> => {
  console.log('Attempting to transcribe audio:', audioUri);
  
  // Check if we're on web platform
  if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
    console.log('Web Speech API available, but cannot transcribe pre-recorded audio');
    return {
      success: false,
      error: 'Web Speech API only works with live audio. Please use text messages for mental health screening.',
      method: 'web-speech-api',
    };
  }
  
  // For native platforms (iOS/Android), there's no free built-in solution
  console.log('No free transcription service available on this platform');
  return {
    success: false,
    error: 'Audio transcription requires a paid cloud service (Google Cloud Speech, AWS Transcribe, etc.). For mental health screening, please use text messages.',
    method: 'unavailable',
  };
};

export const isTranscriptionAvailable = (): boolean => {
  // Web Speech API is available on web, but only for live recording
  // For now, we'll return false since we need to transcribe recorded files
  return false;
};

export const getTranscriptionMessage = (): string => {
  if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
    return 'Note: Audio messages cannot be automatically screened for mental health concerns. If you need support, please tap the "!!!" button or write a text message.';
  }
  
  return 'Note: Audio transcription is not available. Audio messages will not be screened for mental health concerns. If you need support, please tap the "!!!" button or write a text message.';
};
