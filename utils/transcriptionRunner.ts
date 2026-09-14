// Kicks off on-device transcription for a just-saved audio message in the
// background, without blocking the UI. Persists the result (or failure)
// back onto the message, and -- since the self-harm screening pass for
// audio messages can only run once a transcript exists -- runs that
// screening here too, once the transcript actually lands.
import { router } from 'expo-router';

import { Message } from '@/types';
import { StorageService } from '@/utils/storage';
import { TranscriptionService } from '@/utils/transcriptionService';
import { screenMessage } from '@/utils/mentalHealthScreening';

export function startBackgroundTranscription(message: Message): void {
  if (message.type !== 'audio' || !message.audioUri) {
    return;
  }

  TranscriptionService.transcribe(message.audioUri)
    .then(async (transcript) => {
      const updated: Message = {
        ...message,
        transcript: transcript || undefined,
        transcriptionStatus: transcript ? 'completed' : 'failed',
        transcriptionError: transcript ? undefined : 'Transcription produced no text',
      };
      await StorageService.updateMessage(updated);
      console.log('Background transcription completed for message', message.id);

      if (transcript) {
        const screeningResult = screenMessage(transcript);
        if (screeningResult.isFlagged) {
          console.log(
            'Background transcription flagged for mental health concerns:',
            screeningResult.matchedPatterns
          );
          router.replace('/support-resources');
        }
      }
    })
    .catch(async (error) => {
      console.error('Background transcription failed for message', message.id, error);
      const updated: Message = {
        ...message,
        transcriptionStatus: 'failed',
        transcriptionError: error instanceof Error ? error.message : String(error),
      };
      try {
        await StorageService.updateMessage(updated);
      } catch (persistError) {
        console.error('Failed to persist transcription failure status:', persistError);
      }
    });
}
