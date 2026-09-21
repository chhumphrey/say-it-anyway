// Tracks which messages have a transcription attempt actively running in
// this JS session right now (a mounted TranscriptionAttemptModal driving
// it). Purely in-memory and never persisted -- that's exactly what makes it
// useful: after an app relaunch this is empty again, so every message still
// left in 'pending' status is unambiguously stuck from an interrupted
// attempt in a previous session, never one that's still legitimately
// running (see utils/transcriptionAttempt.ts and PendingTranscriptionBanner).
const activeMessageIds = new Set<string>();

export function markTranscriptionActive(messageId: string): void {
  activeMessageIds.add(messageId);
}

export function markTranscriptionInactive(messageId: string): void {
  activeMessageIds.delete(messageId);
}

export function isTranscriptionActive(messageId: string): boolean {
  return activeMessageIds.has(messageId);
}
