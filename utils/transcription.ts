
import { StorageService } from './storage';

export interface TranscriptionResult {
  success: boolean;
  transcript?: string;
  error?: string;
  method?: 'stub' | 'cloud' | 'unavailable';
}

/**
 * Pluggable transcription service interface.
 * Currently returns a placeholder transcript.
 * Can be replaced with AWS Transcribe, Google Cloud Speech, etc. later.
 */
export const transcribeAudio = async (
  audioUri: string,
  durationSeconds: number
): Promise<TranscriptionResult> => {
  console.log('Transcription requested:', { audioUri, durationSeconds });

  try {
    // Round up duration to nearest second
    const roundedDuration = Math.ceil(durationSeconds);

    // Check if sufficient recording time is available
    const totalAvailable = await StorageService.getTotalRecordingTime();
    
    if (totalAvailable < roundedDuration) {
      console.log('Insufficient recording time for transcription:', {
        available: totalAvailable,
        needed: roundedDuration,
      });
      
      return {
        success: false,
        error: `Insufficient Recording Time. You need ${roundedDuration} seconds but only have ${totalAvailable} seconds available.`,
        method: 'unavailable',
      };
    }

    // Deduct recording time
    const deducted = await StorageService.deductRecordingTime(roundedDuration);
    
    if (!deducted) {
      console.log('Failed to deduct recording time');
      return {
        success: false,
        error: 'Could not deduct recording time. Please try again.',
        method: 'unavailable',
      };
    }

    console.log(`Recording time deducted: ${roundedDuration} seconds`);

    // Return placeholder transcript
    // TODO: Replace with actual cloud transcription service
    const placeholderTranscript = '(Transcription pending – coming soon)';
    
    return {
      success: true,
      transcript: placeholderTranscript,
      method: 'stub',
    };
  } catch (error) {
    console.error('Transcription error:', error);
    return {
      success: false,
      error: 'An error occurred during transcription. Please try again.',
      method: 'unavailable',
    };
  }
};

/**
 * Retry transcription for a message that previously failed.
 */
export const retryTranscription = async (
  audioUri: string,
  durationSeconds: number
): Promise<TranscriptionResult> => {
  console.log('Retrying transcription:', { audioUri, durationSeconds });
  return transcribeAudio(audioUri, durationSeconds);
};

/**
 * Check if transcription is available (always true for stub, can check API availability later).
 */
export const isTranscriptionAvailable = (): boolean => {
  // For now, always return true since we have a stub implementation
  return true;
};

/**
 * Get a user-friendly message about transcription status.
 */
export const getTranscriptionMessage = (): string => {
  return 'Audio messages will be transcribed using your available Recording Time. Transcripts are used for mental health screening.';
};

/**
 * Format seconds into a human-readable time string.
 */
export const formatRecordingTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
};
