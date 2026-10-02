jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '@/utils/storage';
import { resetLegacyTranscriptionLockouts } from '@/utils/transcriptionLockoutReset';
import { Message } from '@/types';

function audioMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: overrides.id ?? 'm1',
    recipientId: 'r1',
    timestamp: Date.now(),
    type: 'audio',
    isHidden: false,
    ...overrides,
  };
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('resetLegacyTranscriptionLockouts', () => {
  it('resets an unavailable message to untranscribed with a clean slate', async () => {
    await StorageService.saveMessages([
      audioMessage({
        transcriptionStatus: 'unavailable',
        transcriptionAttempts: 3,
        transcriptionError: 'no network',
        transcriptionErrorStage: 'model',
      }),
    ]);

    const summary = await resetLegacyTranscriptionLockouts();

    expect(summary).toEqual({ reset: 1, alreadyDone: false });
    const [message] = await StorageService.getMessages();
    expect(message.transcriptionStatus).toBe('untranscribed');
    expect(message.transcriptionAttempts).toBe(0);
    expect(message.transcriptionError).toBeUndefined();
    expect(message.transcriptionErrorStage).toBeUndefined();
  });

  it('never resets a message flagged audioMissing, even if it is unavailable', async () => {
    await StorageService.saveMessages([
      audioMessage({
        audioMissing: true,
        transcriptionStatus: 'unavailable',
        transcriptionAttempts: 3,
      }),
    ]);

    const summary = await resetLegacyTranscriptionLockouts();

    expect(summary).toEqual({ reset: 0, alreadyDone: false });
    const [message] = await StorageService.getMessages();
    expect(message.transcriptionStatus).toBe('unavailable');
    expect(message.transcriptionAttempts).toBe(3);
  });

  it('leaves non-unavailable messages untouched', async () => {
    await StorageService.saveMessages([
      audioMessage({ id: 'untranscribed', transcriptionStatus: 'untranscribed' }),
      audioMessage({ id: 'successful', transcriptionStatus: 'successful', transcript: 'hello' }),
    ]);

    const summary = await resetLegacyTranscriptionLockouts();

    expect(summary).toEqual({ reset: 0, alreadyDone: false });
  });

  it('ignores text messages entirely', async () => {
    await StorageService.saveMessages([
      audioMessage({
        id: 'text-1',
        type: 'text',
        textContent: 'hello',
        transcriptionStatus: 'unavailable', // nonsensical for a text message, but must not crash or count
      }),
    ]);

    const summary = await resetLegacyTranscriptionLockouts();

    expect(summary.reset).toBe(0);
  });

  it('runs exactly once: a second call resets nothing, even for a newly-unavailable message', async () => {
    await StorageService.saveMessages([
      audioMessage({ id: 'first', transcriptionStatus: 'unavailable', transcriptionAttempts: 3 }),
    ]);
    const first = await resetLegacyTranscriptionLockouts();
    expect(first).toEqual({ reset: 1, alreadyDone: false });

    // A message that becomes unavailable *after* the one-time reset has
    // already run must stay locked -- the reset is for the historical
    // misclassification bug, not a perpetual "always reset unavailable"
    // rule that would defeat the cap going forward.
    await StorageService.saveMessages([
      audioMessage({ id: 'first', transcriptionStatus: 'untranscribed', transcriptionAttempts: 0 }),
      audioMessage({ id: 'second', transcriptionStatus: 'unavailable', transcriptionAttempts: 3 }),
    ]);

    const second = await resetLegacyTranscriptionLockouts();

    expect(second).toEqual({ reset: 0, alreadyDone: true });
    const messages = await StorageService.getMessages();
    const secondMessage = messages.find((m) => m.id === 'second')!;
    expect(secondMessage.transcriptionStatus).toBe('unavailable');
    expect(secondMessage.transcriptionAttempts).toBe(3);
  });

  it('resets multiple unavailable messages in one pass, skipping missing ones among them', async () => {
    await StorageService.saveMessages([
      audioMessage({ id: 'a', transcriptionStatus: 'unavailable', transcriptionAttempts: 3 }),
      audioMessage({ id: 'b', transcriptionStatus: 'unavailable', transcriptionAttempts: 3, audioMissing: true }),
      audioMessage({ id: 'c', transcriptionStatus: 'unavailable', transcriptionAttempts: 3 }),
    ]);

    const summary = await resetLegacyTranscriptionLockouts();

    expect(summary).toEqual({ reset: 2, alreadyDone: false });
    const messages = await StorageService.getMessages();
    expect(messages.find((m) => m.id === 'a')!.transcriptionStatus).toBe('untranscribed');
    expect(messages.find((m) => m.id === 'b')!.transcriptionStatus).toBe('unavailable');
    expect(messages.find((m) => m.id === 'c')!.transcriptionStatus).toBe('untranscribed');
  });
});
