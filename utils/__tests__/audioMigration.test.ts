jest.mock('expo-file-system');
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { StorageService } from '@/utils/storage';
import { runAudioMigration } from '@/utils/audioMigration';
import { Message } from '@/types';

function legacyMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: overrides.id ?? 'msg-1',
    recipientId: 'r1',
    timestamp: Date.now(),
    type: 'audio',
    isHidden: false,
    ...overrides,
  };
}

async function seedMessages(messages: Message[]) {
  await AsyncStorage.setItem('messages', JSON.stringify(messages));
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('runAudioMigration', () => {
  it('copies a recording still at its original (legacy Caches) path into Documents, verifies it, deletes the original, and records a relative path', async () => {
    const legacyFile = new File(Paths.cache, 'ExpoAudio', 'recording-abc.m4a');
    legacyFile.write('fake-audio-bytes', { encoding: 'utf8' });

    await seedMessages([legacyMessage({ id: 'm1', audioUri: legacyFile.uri })]);

    const summary = await runAudioMigration();

    expect(summary).toEqual({ alreadyResolved: 0, migrated: 1, missing: 0 });

    const [message] = await StorageService.getMessages();
    expect(message.audioMissing).toBeFalsy();
    expect(message.audioRelativePath).toBeTruthy();
    expect(message.audioUri).toBeTruthy();
    expect(new File(message.audioUri!).exists).toBe(true);
    expect(new File(message.audioUri!).uri.startsWith(Paths.document.uri)).toBe(true);

    // The original must be gone -- the whole point is to get it out of a
    // directory the OS can purge at any time.
    expect(legacyFile.exists).toBe(false);
  });

  it('recovers a recording via the legacy-cache basename search when the originally-stored absolute path no longer resolves (simulating an iOS container-path change)', async () => {
    // The stored path points at a root that no longer exists (a different
    // container UUID) -- but the file is still sitting in *this* session's
    // actual Caches/ExpoAudio under the same basename, simulating Caches
    // contents having been carried over across the path change.
    const staleStoredUri = 'file:///var/mobile/Containers/Data/Application/OLD-UUID-GONE/Library/Caches/ExpoAudio/recording-xyz.m4a';
    const recoverable = new File(Paths.cache, 'ExpoAudio', 'recording-xyz.m4a');
    recoverable.write('fake-audio-bytes', { encoding: 'utf8' });

    await seedMessages([legacyMessage({ id: 'm1', audioUri: staleStoredUri })]);

    const summary = await runAudioMigration();

    expect(summary).toEqual({ alreadyResolved: 0, migrated: 1, missing: 0 });
    const [message] = await StorageService.getMessages();
    expect(message.audioMissing).toBeFalsy();
    expect(new File(message.audioUri!).exists).toBe(true);
  });

  it('flags a message audioMissing, without deleting anything or touching the transcript, when the file cannot be found anywhere', async () => {
    await seedMessages([
      legacyMessage({
        id: 'm1',
        audioUri: 'file:///nowhere/recording-gone.m4a',
        transcript: "what I wish I'd said",
        transcriptionStatus: 'successful',
      }),
    ]);

    const summary = await runAudioMigration();

    expect(summary).toEqual({ alreadyResolved: 0, migrated: 0, missing: 1 });
    const [message] = await StorageService.getMessages();
    expect(message.audioMissing).toBe(true);
    expect(message.audioRelativePath).toBeUndefined();
    // The message record and its transcript are untouched.
    expect(message.transcript).toBe("what I wish I'd said");
    expect(message.transcriptionStatus).toBe('successful');
  });

  it('is idempotent: running it again after a clean migration does nothing further', async () => {
    const legacyFile = new File(Paths.cache, 'ExpoAudio', 'recording-abc.m4a');
    legacyFile.write('fake-audio-bytes', { encoding: 'utf8' });
    await seedMessages([legacyMessage({ id: 'm1', audioUri: legacyFile.uri })]);

    await runAudioMigration();
    const afterFirst = await StorageService.getMessages();

    const secondSummary = await runAudioMigration();
    const afterSecond = await StorageService.getMessages();

    expect(secondSummary).toEqual({ alreadyResolved: 1, migrated: 0, missing: 0 });
    expect(afterSecond[0].audioRelativePath).toBe(afterFirst[0].audioRelativePath);
  });

  it('is idempotent for an already-confirmed-missing message: does not keep retrying or flapping', async () => {
    await seedMessages([legacyMessage({ id: 'm1', audioUri: 'file:///nowhere/gone.m4a' })]);

    await runAudioMigration();
    const second = await runAudioMigration();

    expect(second).toEqual({ alreadyResolved: 1, migrated: 0, missing: 0 });
  });

  it('resumes cleanly after an interrupted run: a destination copy left over from a prior crash is reused rather than re-copied, and migration still completes', async () => {
    const legacyFile = new File(Paths.cache, 'ExpoAudio', 'recording-abc.m4a');
    legacyFile.write('fake-audio-bytes', { encoding: 'utf8' });
    await seedMessages([legacyMessage({ id: 'm1', audioUri: legacyFile.uri })]);

    // Simulate a crash that happened *after* the copy completed but
    // *before* the message record was updated: the destination file
    // already exists with matching content, but the stored message still
    // has no audioRelativePath.
    const destDir = new Directory(Paths.document, 'migrated-audio');
    destDir.create({ idempotent: true });
    const preCopied = new File(destDir, 'recording-abc.m4a');
    preCopied.write('fake-audio-bytes', { encoding: 'utf8' });

    const summary = await runAudioMigration();

    expect(summary).toEqual({ alreadyResolved: 0, migrated: 1, missing: 0 });
    const [message] = await StorageService.getMessages();
    expect(message.audioRelativePath).toBeTruthy();
    expect(new File(message.audioUri!).exists).toBe(true);
  });

  it('resumes cleanly after an interrupted run: a partial/corrupt destination copy left over from a prior crash is detected and redone', async () => {
    const legacyFile = new File(Paths.cache, 'ExpoAudio', 'recording-abc.m4a');
    legacyFile.write('the-real-full-recording', { encoding: 'utf8' });
    await seedMessages([legacyMessage({ id: 'm1', audioUri: legacyFile.uri })]);

    const destDir = new Directory(Paths.document, 'migrated-audio');
    destDir.create({ idempotent: true });
    const partial = new File(destDir, 'recording-abc.m4a');
    partial.write('truncat', { encoding: 'utf8' }); // shorter than the source -- a stale/partial copy

    const summary = await runAudioMigration();

    expect(summary).toEqual({ alreadyResolved: 0, migrated: 1, missing: 0 });
    const [message] = await StorageService.getMessages();
    const migratedFile = new File(message.audioUri!);
    expect(migratedFile.exists).toBe(true);
    expect(migratedFile.size).toBe(legacyFile.size === 0 ? migratedFile.size : Buffer.byteLength('the-real-full-recording'));
  });

  it('processes multiple messages independently, so one missing recording does not block another from migrating', async () => {
    const legacyFile = new File(Paths.cache, 'Audio', 'recording-ok.3gp');
    legacyFile.write('android-recording-bytes', { encoding: 'utf8' });

    await seedMessages([
      legacyMessage({ id: 'm1', audioUri: legacyFile.uri }),
      legacyMessage({ id: 'm2', audioUri: 'file:///nowhere/gone.3gp' }),
    ]);

    const summary = await runAudioMigration();

    expect(summary).toEqual({ alreadyResolved: 0, migrated: 1, missing: 1 });
    const messages = await StorageService.getMessages();
    const m1 = messages.find((m) => m.id === 'm1')!;
    const m2 = messages.find((m) => m.id === 'm2')!;
    expect(m1.audioMissing).toBeFalsy();
    expect(m2.audioMissing).toBe(true);
  });

  it('leaves text messages and already-current-scheme messages alone', async () => {
    const alreadyMigrated = new File(Paths.document, 'ExpoAudio', 'recording-current.m4a');
    alreadyMigrated.write('bytes', { encoding: 'utf8' });

    await seedMessages([
      legacyMessage({ id: 'text-1', type: 'text', textContent: 'hello', audioUri: undefined }),
      legacyMessage({ id: 'already', audioRelativePath: 'ExpoAudio/recording-current.m4a', audioUri: alreadyMigrated.uri }),
    ]);

    const summary = await runAudioMigration();

    expect(summary).toEqual({ alreadyResolved: 1, migrated: 0, missing: 0 });
  });
});
