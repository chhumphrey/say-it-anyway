
// Transcription service for audio messages
// This is a placeholder implementation that returns a message indicating
// transcription is coming soon. In the future, this can be replaced with
// an actual on-device or cloud-based transcription service.

export interface TranscriptionResult {
  success: boolean;
  transcript?: string;
  error?: string;
}

export async function transcribeAudio(
  audioUri: string,
  durationSeconds: number
): Promise<TranscriptionResult> {
  console.log('Transcription requested for:', audioUri, 'Duration:', durationSeconds);
  
  // Placeholder implementation
  // In the future, integrate with a transcription service like:
  // - Expo Speech Recognition (when available)
  // - Web Speech API (for web platform)
  // - Cloud services (Google Cloud Speech-to-Text, AWS Transcribe, etc.)
  
  return {
    success: true,
    transcript: '(Transcription pending – coming soon)',
    error: undefined,
  };
}

export function getTranscriptionMessage(): string {
  return 'Audio transcription is coming soon. Your audio will be saved and can be played back anytime.';
}

export function formatRecordingTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  
  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
}
