// Drives a single transcription attempt end to end (mark pending ->
// transcribe -> screen -> mark successful, or mark failed/unavailable) and
// the small pieces of bookkeeping shared by every place that can trigger an
// attempt: the active-message modal shown right after recording, the manual
// "Transcribe"/"Try Again" button, and the background-recovery banner for
// messages left stuck in 'pending' by an interrupted attempt.
import { router } from 'expo-router';

import { Message } from '@/types';
import { StorageService } from '@/utils/storage';
import { TranscriptionService, type TranscriptionAttemptCallbacks } from '@/utils/transcriptionService';
import { screenMessage } from '@/utils/mentalHealthScreening';

export const MAX_TRANSCRIPTION_ATTEMPTS = 3;

// Identical wording is required everywhere an attempt count is shown (the
// modal's retry prompt and the message list) -- route both through this.
export function attemptCountLabel(attempts: number): string {
  return `Attempt ${attempts} of ${MAX_TRANSCRIPTION_ATTEMPTS}`;
}

export type TranscriptionAttemptResult =
  | { outcome: 'success'; flagged: boolean }
  | { outcome: 'failed'; attempts: number; exhausted: boolean };

/**
 * Runs exactly one transcription attempt for `message`. On success, screens
 * the transcript immediately -- before returning, never waiting on any modal
 * or further UI interaction -- and marks the message 'successful'. On
 * failure, increments transcriptionAttempts and leaves the message in the
 * transitional 'failed' state (or 'unavailable' if the cap is now reached);
 * the caller decides whether to prompt for a retry.
 */
export async function runTranscriptionAttempt(
  message: Message,
  callbacks?: TranscriptionAttemptCallbacks
): Promise<TranscriptionAttemptResult> {
  const startingAttempts = message.transcriptionAttempts ?? 0;
  const pendingMessage: Message = {
    ...message,
    transcriptionStatus: 'pending',
    transcriptionError: undefined,
    transcriptionBannerDismissals: 0,
  };
  await StorageService.updateMessage(pendingMessage);

  try {
    const transcript = await TranscriptionService.transcribe(message.audioUri!, callbacks);
    if (!transcript) {
      throw new Error('Transcription produced no text');
    }

    const screeningResult = screenMessage(transcript);
    const successMessage: Message = {
      ...pendingMessage,
      transcript,
      transcriptionStatus: 'successful',
      transcriptionError: undefined,
    };
    await StorageService.updateMessage(successMessage);

    if (screeningResult.isFlagged) {
      console.log('Transcription flagged for mental health concerns:', screeningResult.matchedPatterns);
      router.replace('/support-resources');
    }

    return { outcome: 'success', flagged: screeningResult.isFlagged };
  } catch (error) {
    console.error('Transcription attempt failed for message', message.id, error);
    const attempts = startingAttempts + 1;
    const exhausted = attempts >= MAX_TRANSCRIPTION_ATTEMPTS;
    const failedMessage: Message = {
      ...pendingMessage,
      transcriptionStatus: exhausted ? 'unavailable' : 'failed',
      transcriptionAttempts: attempts,
      transcriptionError: error instanceof Error ? error.message : String(error),
    };
    await StorageService.updateMessage(failedMessage);
    return { outcome: 'failed', attempts, exhausted };
  }
}

/**
 * Declines a retry after a failed attempt. The attempt itself already
 * counted (in runTranscriptionAttempt) regardless of this choice -- this
 * just settles the message back to 'untranscribed' instead of retrying.
 */
export async function declineRetry(message: Message): Promise<void> {
  await StorageService.updateMessage({ ...message, transcriptionStatus: 'untranscribed' });
}

/**
 * Handles the user declining or ignoring the background-recovery banner for
 * a message stuck in 'pending' from an interrupted attempt. This does NOT
 * count as an attempt -- nothing actually ran -- but repeated dismissals are
 * capped (reusing MAX_TRANSCRIPTION_ATTEMPTS) so a message can't sit
 * unresolved forever without ever reaching a terminal state: hitting the cap
 * counts as if one attempt had failed and proceeds through the normal
 * failure outcome (another 'untranscribed' round, or 'unavailable' if that
 * was the last one available).
 */
export async function dismissRecoveryPrompt(message: Message): Promise<void> {
  const dismissals = (message.transcriptionBannerDismissals ?? 0) + 1;

  if (dismissals < MAX_TRANSCRIPTION_ATTEMPTS) {
    await StorageService.updateMessage({
      ...message,
      transcriptionStatus: 'untranscribed',
      transcriptionBannerDismissals: dismissals,
    });
    return;
  }

  const attempts = (message.transcriptionAttempts ?? 0) + 1;
  const exhausted = attempts >= MAX_TRANSCRIPTION_ATTEMPTS;
  await StorageService.updateMessage({
    ...message,
    transcriptionStatus: exhausted ? 'unavailable' : 'untranscribed',
    transcriptionAttempts: attempts,
    transcriptionBannerDismissals: 0,
  });
}
