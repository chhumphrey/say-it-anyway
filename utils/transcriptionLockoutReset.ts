// One-time reset for messages permanently locked out of transcription by
// the pre-fix bug, where a transient failure (no network, model not yet
// downloaded) counted identically to a real decode failure against the
// same 3-attempt cap. Any message already sitting in the terminal
// 'unavailable' state when this runs could have gotten there for either
// reason, and the original error text wasn't retained to tell them apart
// -- so rather than guess, every such message gets a clean slate under
// the corrected (decode-only) classification.
//
// Runs once (tracked via a persisted flag), not on every launch -- a
// message that genuinely exhausts the cap *after* this reset, under the
// now-correct decode-only accounting, must stay locked.
import AsyncStorage from '@react-native-async-storage/async-storage';

import { StorageService } from '@/utils/storage';

const RESET_FLAG_KEY = 'transcription_lockout_reset_v1';

export interface TranscriptionLockoutResetSummary {
  reset: number;
  alreadyDone: boolean;
}

export async function resetLegacyTranscriptionLockouts(): Promise<TranscriptionLockoutResetSummary> {
  const alreadyDone = await AsyncStorage.getItem(RESET_FLAG_KEY);
  if (alreadyDone) {
    return { reset: 0, alreadyDone: true };
  }

  const messages = await StorageService.getMessages();
  let reset = 0;

  for (const message of messages) {
    if (message.type !== 'audio' || message.transcriptionStatus !== 'unavailable') {
      continue;
    }
    // A message with no audio to begin with must never become retryable
    // -- resetting it would offer a "Transcribe" button for a recording
    // that was never there.
    if (message.audioMissing) {
      continue;
    }

    await StorageService.updateMessage({
      ...message,
      transcriptionStatus: 'untranscribed',
      transcriptionAttempts: 0,
      transcriptionError: undefined,
      transcriptionErrorStage: undefined,
    });
    reset += 1;
  }

  await AsyncStorage.setItem(RESET_FLAG_KEY, 'true');
  return { reset, alreadyDone: false };
}
