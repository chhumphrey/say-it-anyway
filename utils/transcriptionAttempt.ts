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
// Imported directly from the dependency-free module (not re-exported via
// transcriptionService) so that mocking transcriptionService.ts in tests
// (which pulls in whisper.rn/expo-file-system) never shadows the class
// this file's `instanceof` check relies on.
import { TranscriptionStageError, type TranscriptionFailureStage } from '@/utils/transcriptionStageError';
import { screenMessage } from '@/utils/mentalHealthScreening';

export const MAX_TRANSCRIPTION_ATTEMPTS = 3;

// Identical wording is required everywhere an attempt count is shown (the
// modal's retry prompt and the message list) -- route both through this.
export function attemptCountLabel(attempts: number): string {
  return `Attempt ${attempts} of ${MAX_TRANSCRIPTION_ATTEMPTS}`;
}

export type TranscriptionAttemptResult =
  | { outcome: 'success'; flagged: boolean }
  // Only ever reached for a 'decode' failure -- see below.
  | { outcome: 'failed'; attempts: number; exhausted: boolean; stage: TranscriptionFailureStage }
  // The message is flagged audioMissing; no attempt was made at all.
  | { outcome: 'missing' };

/**
 * Runs exactly one transcription attempt for `message`. On success, screens
 * the transcript immediately -- before returning, never waiting on any modal
 * or further UI interaction -- and marks the message 'successful'.
 *
 * On failure, only a 'decode' failure -- the decoder rejecting this
 * specific recording's bytes, the one stage that's actually a property of
 * the file -- counts toward transcriptionAttempts and can reach the
 * terminal 'unavailable' state. A 'model' (download/init) or 'transcribe'
 * (whisper.rn's own call) failure is environmental, not a property of the
 * recording, so it never counts against the cap and always leaves the
 * message retryable ('untranscribed'). This is safe from looping without
 * user action: every retry path (this modal's own retry prompt, the
 * manual Transcribe/Try Again button, the recovery banner's Review
 * button) requires an explicit tap -- nothing here or upstream ever
 * re-invokes this on its own.
 *
 * Never attempts a message flagged audioMissing -- there's no file to
 * decode, so this would otherwise be misclassified as a 'decode' failure
 * and wrongly count against the cap. The caller (the UI) should never
 * reach this for such a message either; this is the defensive backstop.
 */
export async function runTranscriptionAttempt(
  message: Message,
  callbacks?: TranscriptionAttemptCallbacks
): Promise<TranscriptionAttemptResult> {
  if (message.audioMissing) {
    console.warn('runTranscriptionAttempt: refusing to attempt a message flagged audioMissing', message.id);
    return { outcome: 'missing' };
  }

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
      throw new TranscriptionStageError('transcribe', 'Transcription produced no text');
    }

    const screeningResult = screenMessage(transcript);
    const successMessage: Message = {
      ...pendingMessage,
      transcript,
      transcriptionStatus: 'successful',
      transcriptionError: undefined,
      transcriptionErrorStage: undefined,
    };
    await StorageService.updateMessage(successMessage);

    if (screeningResult.isFlagged) {
      console.log('Transcription flagged for mental health concerns:', screeningResult.matchedPatterns);
      router.replace('/support-resources');
    }

    return { outcome: 'success', flagged: screeningResult.isFlagged };
  } catch (error) {
    console.error('Transcription attempt failed for message', message.id, error);
    const stage: TranscriptionFailureStage =
      error instanceof TranscriptionStageError ? error.stage : 'transcribe';
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (stage !== 'decode') {
      // Transient: never counts against the cap, always leaves the
      // message retryable.
      await StorageService.updateMessage({
        ...pendingMessage,
        transcriptionStatus: 'untranscribed',
        transcriptionError: errorMessage,
        transcriptionErrorStage: stage,
      });
      return { outcome: 'failed', attempts: startingAttempts, exhausted: false, stage };
    }

    const attempts = startingAttempts + 1;
    const exhausted = attempts >= MAX_TRANSCRIPTION_ATTEMPTS;
    const failedMessage: Message = {
      ...pendingMessage,
      transcriptionStatus: exhausted ? 'unavailable' : 'failed',
      transcriptionAttempts: attempts,
      transcriptionError: errorMessage,
      transcriptionErrorStage: stage,
    };
    await StorageService.updateMessage(failedMessage);
    return { outcome: 'failed', attempts, exhausted, stage };
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
 * a message stuck in 'pending' from an interrupted attempt. This never
 * counts against transcriptionAttempts and never reaches 'unavailable' --
 * nothing actually ran, so it says nothing about whether the recording
 * itself can be decoded. transcriptionBannerDismissals is kept only as a
 * display/throttling count, not a path to the terminal state.
 */
export async function dismissRecoveryPrompt(message: Message): Promise<void> {
  await StorageService.updateMessage({
    ...message,
    transcriptionStatus: 'untranscribed',
    transcriptionBannerDismissals: (message.transcriptionBannerDismissals ?? 0) + 1,
  });
}
