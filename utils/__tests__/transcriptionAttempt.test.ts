jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
// A manual factory, not an automock: automocking would still need to load
// the real module to introspect its shape, which pulls in whisper.rn (a
// native module with no usable Jest transform here). Safe to fully stub --
// transcriptionAttempt.ts only ever gets TranscriptionStageError from the
// separate, dependency-free transcriptionStageError.ts module, never from
// this one, so stubbing this module's TranscriptionService.transcribe
// can't shadow the class identity the `instanceof` check relies on.
jest.mock('@/utils/transcriptionService', () => ({
  TranscriptionService: { transcribe: jest.fn(), warmUp: jest.fn() },
}));
jest.mock('@/utils/mentalHealthScreening', () => ({
  screenMessage: jest.fn().mockReturnValue({ isFlagged: false, matchedPatterns: [] }),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '@/utils/storage';
import {
  runTranscriptionAttempt,
  dismissRecoveryPrompt,
  MAX_TRANSCRIPTION_ATTEMPTS,
} from '@/utils/transcriptionAttempt';
import { TranscriptionService } from '@/utils/transcriptionService';
import { TranscriptionStageError } from '@/utils/transcriptionStageError';
import { Message } from '@/types';

function audioMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 'm1',
    recipientId: 'r1',
    timestamp: Date.now(),
    type: 'audio',
    isHidden: false,
    audioUri: 'file:///document/ExpoAudio/recording-1.m4a',
    ...overrides,
  };
}

const transcribeMock = TranscriptionService.transcribe as jest.Mock;

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('runTranscriptionAttempt: missing-audio short-circuit', () => {
  it('never calls TranscriptionService.transcribe, and leaves the message untouched, for a message flagged audioMissing', async () => {
    await StorageService.saveMessages([audioMessage({ audioMissing: true, transcriptionStatus: 'untranscribed' })]);
    const [message] = await StorageService.getMessages();

    const result = await runTranscriptionAttempt(message);

    expect(result).toEqual({ outcome: 'missing' });
    expect(transcribeMock).not.toHaveBeenCalled();

    const [after] = await StorageService.getMessages();
    expect(after.transcriptionStatus).toBe('untranscribed');
    expect(after.transcriptionAttempts).toBeFalsy();
  });
});

describe('runTranscriptionAttempt: stage classification', () => {
  it('a "model" stage failure never increments attempts and leaves the message retryable', async () => {
    transcribeMock.mockRejectedValue(new TranscriptionStageError('model', 'no network'));
    await StorageService.saveMessages([audioMessage()]);
    const [message] = await StorageService.getMessages();

    const result = await runTranscriptionAttempt(message);

    expect(result).toEqual({ outcome: 'failed', attempts: 0, exhausted: false, stage: 'model' });
    const [after] = await StorageService.getMessages();
    expect(after.transcriptionStatus).toBe('untranscribed');
    expect(after.transcriptionAttempts ?? 0).toBe(0);
    expect(after.transcriptionErrorStage).toBe('model');
    expect(after.transcriptionError).toBe('no network');
  });

  it('a "transcribe" stage failure never increments attempts and leaves the message retryable', async () => {
    transcribeMock.mockRejectedValue(new TranscriptionStageError('transcribe', 'native engine error'));
    await StorageService.saveMessages([audioMessage()]);
    const [message] = await StorageService.getMessages();

    const result = await runTranscriptionAttempt(message);

    expect(result).toEqual({ outcome: 'failed', attempts: 0, exhausted: false, stage: 'transcribe' });
    const [after] = await StorageService.getMessages();
    expect(after.transcriptionStatus).toBe('untranscribed');
    expect(after.transcriptionAttempts ?? 0).toBe(0);
  });

  it('a "decode" stage failure increments attempts and does not exhaust before the cap', async () => {
    transcribeMock.mockRejectedValue(new TranscriptionStageError('decode', 'no audio track'));
    await StorageService.saveMessages([audioMessage()]);
    const [message] = await StorageService.getMessages();

    const result = await runTranscriptionAttempt(message);

    expect(result).toEqual({ outcome: 'failed', attempts: 1, exhausted: false, stage: 'decode' });

    // Read the raw persisted record directly -- getMessages() normalizes a
    // standalone 'failed' (no retry prompt actually active, since this is
    // a fresh read, not the live modal session) back to 'untranscribed' by
    // design (see transcriptionState.ts); that's a separate, pre-existing
    // concern from what this test is checking.
    const raw = JSON.parse((await AsyncStorage.getItem('messages'))!);
    expect(raw[0].transcriptionStatus).toBe('failed');
    expect(raw[0].transcriptionAttempts).toBe(1);
    expect(raw[0].transcriptionErrorStage).toBe('decode');
  });

  it('only decode-stage failures count toward exhaustion -- interleaved transient failures do not speed it up or slow it down', async () => {
    await StorageService.saveMessages([audioMessage()]);

    const sequence: [string, string][] = [
      ['model', 'no network'],
      ['decode', 'bad file'],
      ['transcribe', 'engine hiccup'],
      ['decode', 'bad file'],
      ['model', 'no network again'],
      ['decode', 'bad file'],
    ];

    let last;
    for (const [stage, msg] of sequence) {
      transcribeMock.mockRejectedValueOnce(new TranscriptionStageError(stage as any, msg));
      const [message] = await StorageService.getMessages();
      last = await runTranscriptionAttempt(message);
    }

    // 3 decode failures total -> exhausted, regardless of the 2 transient
    // failures mixed in between.
    expect(last).toEqual({ outcome: 'failed', attempts: 3, exhausted: true, stage: 'decode' });
    const [after] = await StorageService.getMessages();
    expect(after.transcriptionStatus).toBe('unavailable');
    expect(after.transcriptionAttempts).toBe(3);
  });

  it('an untyped/unknown error defaults to the "transcribe" stage rather than being misclassified as a decode failure', async () => {
    transcribeMock.mockRejectedValue(new Error('something unexpected'));
    await StorageService.saveMessages([audioMessage()]);
    const [message] = await StorageService.getMessages();

    const result = await runTranscriptionAttempt(message);

    expect(result).toMatchObject({ stage: 'transcribe', exhausted: false });
    const [after] = await StorageService.getMessages();
    expect(after.transcriptionAttempts ?? 0).toBe(0);
  });

  it('a successful attempt clears any previously-recorded error and stage', async () => {
    transcribeMock.mockResolvedValue('what I wanted to say');
    await StorageService.saveMessages([
      audioMessage({ transcriptionError: 'old error', transcriptionErrorStage: 'decode', transcriptionAttempts: 2 }),
    ]);
    const [message] = await StorageService.getMessages();

    const result = await runTranscriptionAttempt(message);

    expect(result).toEqual({ outcome: 'success', flagged: false });
    const [after] = await StorageService.getMessages();
    expect(after.transcriptionStatus).toBe('successful');
    expect(after.transcript).toBe('what I wanted to say');
    expect(after.transcriptionError).toBeUndefined();
    expect(after.transcriptionErrorStage).toBeUndefined();
  });
});

describe('dismissRecoveryPrompt', () => {
  it('never sets the terminal unavailable state, no matter how many times it is called', async () => {
    await StorageService.saveMessages([audioMessage({ transcriptionStatus: 'pending' })]);

    for (let i = 0; i < MAX_TRANSCRIPTION_ATTEMPTS + 5; i++) {
      const [message] = await StorageService.getMessages();
      await dismissRecoveryPrompt(message);
    }

    const [after] = await StorageService.getMessages();
    expect(after.transcriptionStatus).toBe('untranscribed');
    expect(after.transcriptionAttempts ?? 0).toBe(0);
    expect(after.transcriptionBannerDismissals).toBe(MAX_TRANSCRIPTION_ATTEMPTS + 5);
  });
});
