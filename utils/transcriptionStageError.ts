// Deliberately dependency-free (no expo-file-system, no whisper.rn) so it
// can be imported directly in tests without pulling in or needing to mock
// any of transcriptionService.ts's heavier native dependencies.
//
// Which step of transcribe() failed. 'decode' is the only one that's a
// property of the recording itself (the decoder rejected these specific
// bytes) -- 'model' (download/init) and 'transcribe' (whisper.rn's own
// call) are both environmental, not intrinsic to the file, which is why
// runTranscriptionAttempt treats them differently. See transcriptionAttempt.ts.
export type TranscriptionFailureStage = 'model' | 'decode' | 'transcribe';

export class TranscriptionStageError extends Error {
  readonly stage: TranscriptionFailureStage;

  constructor(stage: TranscriptionFailureStage, message: string) {
    super(message);
    this.name = 'TranscriptionStageError';
    this.stage = stage;
  }
}
