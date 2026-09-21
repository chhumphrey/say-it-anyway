import { Message, TranscriptionStatus } from '@/types';

// Messages saved before on-device transcription existed went through a
// placeholder that stored this exact string as the "transcript" and marked
// the message as done -- treat it as no transcript at all.
export const LEGACY_PLACEHOLDER_TRANSCRIPT = '(Transcription pending – coming soon)';

export function hasRealTranscript(message: Message): boolean {
  return !!message.transcript && message.transcript !== LEGACY_PLACEHOLDER_TRANSCRIPT;
}

const KNOWN_STATUSES: TranscriptionStatus[] = [
  'none',
  'untranscribed',
  'pending',
  'failed',
  'unavailable',
  'successful',
];

/**
 * Reconciles a message saved under an older transcription status scheme
 * (pending/completed/failed/none, pre-dating the untranscribed/pending/
 * failed/unavailable/successful attempt state machine) into the current
 * one, so old data displays and behaves correctly without a one-time
 * migration script.
 */
export function normalizeMessage(message: Message): Message {
  if (message.type !== 'audio') {
    return message;
  }

  const attempts = typeof message.transcriptionAttempts === 'number' ? message.transcriptionAttempts : 0;
  let status = message.transcriptionStatus as string | undefined;

  if (status === 'completed') {
    status = hasRealTranscript(message) ? 'successful' : 'untranscribed';
  } else if (status === 'failed') {
    // 'failed' only makes sense while a retry prompt is actively up; found
    // in storage on its own (e.g. the app closed mid-prompt) it means no
    // attempt is running, so resolve it back to 'untranscribed'.
    status = 'untranscribed';
  } else if (!status || !KNOWN_STATUSES.includes(status as TranscriptionStatus)) {
    status = 'untranscribed';
  }

  return {
    ...message,
    transcriptionStatus: status as TranscriptionStatus,
    transcriptionAttempts: attempts,
  };
}
