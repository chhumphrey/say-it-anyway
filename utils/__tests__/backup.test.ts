jest.mock('expo-file-system');
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('expo-sharing', () => ({ shareAsync: jest.fn() }));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDocumentAsync } from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { zipSync, strToU8 } from 'fflate';
import { StorageService } from '@/utils/storage';
import { createBackup, restoreFromBackup } from '@/utils/backup';
import { Message, Recipient } from '@/types';

function recipient(id: string): Recipient {
  return { id, name: 'Someone I miss', isDefault: true };
}

function audioMessage(id: string, overrides: Partial<Message> = {}): Message {
  return {
    id,
    recipientId: 'r1',
    timestamp: Date.now(),
    type: 'audio',
    isHidden: false,
    ...overrides,
  };
}

/** Builds a backup zip buffer directly (bypassing createBackup's UI side effects) with a given manifest and audio payloads, exactly as the real format does. */
function buildZipBuffer(manifest: object, audioFiles: Record<string, string> = {}): Uint8Array {
  const files: Record<string, Uint8Array> = { 'backup.json': strToU8(JSON.stringify(manifest)) };
  for (const [zipPath, contents] of Object.entries(audioFiles)) {
    files[zipPath] = strToU8(contents);
  }
  return zipSync(files, { level: 1 });
}

function mockPickedZip(bytes: Uint8Array) {
  (getDocumentAsync as jest.Mock).mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///picked/backup.zip', name: 'backup.zip', size: bytes.length }],
  });
  (global as any).fetch = jest.fn().mockResolvedValue({
    ok: true,
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  });
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('createBackup', () => {
  it('reports missingAudioCount instead of silently dropping an audio message whose file is gone, while still including the rest', async () => {
    const present = new File(Paths.document, 'ExpoAudio', 'recording-ok.m4a');
    present.write('real bytes', { encoding: 'utf8' });

    await StorageService.saveRecipients([recipient('r1')]);
    await StorageService.saveMessages([
      audioMessage('present', { audioRelativePath: 'ExpoAudio/recording-ok.m4a', audioUri: present.uri }),
      audioMessage('missing', { audioMissing: true }),
    ]);

    const result = await createBackup();

    expect(result.missingAudioCount).toBe(1);
  });

  it('reports zero missing when every recording is present', async () => {
    const present = new File(Paths.document, 'ExpoAudio', 'recording-ok.m4a');
    present.write('real bytes', { encoding: 'utf8' });
    await StorageService.saveRecipients([recipient('r1')]);
    await StorageService.saveMessages([
      audioMessage('present', { audioRelativePath: 'ExpoAudio/recording-ok.m4a', audioUri: present.uri }),
    ]);

    const result = await createBackup();

    expect(result.missingAudioCount).toBe(0);
  });
});

describe('restoreFromBackup', () => {
  it('resolves a NEW-style backup (relative-path message) to a working audioRelativePath on this device', async () => {
    const manifest = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        recipients: [recipient('r1')],
        messages: [
          {
            id: 'm1',
            recipientId: 'r1',
            timestamp: 1,
            type: 'audio',
            isHidden: false,
            audioRelativePath: 'ExpoAudio/recording-on-old-device.m4a',
            audioUri: 'file:///some/other/devices/container/ExpoAudio/recording-on-old-device.m4a',
          },
        ],
        profile: null,
        theme: null,
        customColors: null,
        backgroundSettings: null,
        supportRegion: null,
      },
      audioIndex: { m1: 'audio/m1.m4a' },
    };
    mockPickedZip(buildZipBuffer(manifest, { 'audio/m1.m4a': 'the-actual-audio-bytes' }));

    const result = await restoreFromBackup();

    expect(result?.audioRestored).toBe(1);
    expect(result?.audioFailed).toBe(0);

    const [restored] = await StorageService.getMessages();
    expect(restored.audioRelativePath).toBeTruthy();
    expect(new File(restored.audioUri!).exists).toBe(true);
    expect(new File(restored.audioUri!).uri.startsWith(Paths.document.uri)).toBe(true);
  });

  it('resolves an OLD-style backup (absolute-path-only message, no audioRelativePath field at all) correctly on this device', async () => {
    // Exactly what a backup made before this fix looks like: only a bare
    // absolute audioUri, meaningless on a different device/install.
    const manifest = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        recipients: [recipient('r1')],
        messages: [
          {
            id: 'm1',
            recipientId: 'r1',
            timestamp: 1,
            type: 'audio',
            isHidden: false,
            audioUri: 'file:///var/mobile/Containers/Data/Application/SOME-OLD-UUID/Library/Caches/ExpoAudio/recording-old.m4a',
          },
        ],
        profile: null,
        theme: null,
        customColors: null,
        backgroundSettings: null,
        supportRegion: null,
      },
      audioIndex: { m1: 'audio/m1.m4a' },
    };
    mockPickedZip(buildZipBuffer(manifest, { 'audio/m1.m4a': 'the-actual-audio-bytes' }));

    const result = await restoreFromBackup();

    expect(result?.audioRestored).toBe(1);
    const [restored] = await StorageService.getMessages();
    expect(restored.audioRelativePath).toBeTruthy();
    expect(new File(restored.audioUri!).exists).toBe(true);
    // Resolves to *this* device's Documents directory, not the old device's
    // (now-meaningless) absolute path.
    expect(new File(restored.audioUri!).uri.startsWith(Paths.document.uri)).toBe(true);
  });

  it('keeps the message and transcript, and sets audioMissing, when the archive has no audio for a message at all', async () => {
    const manifest = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        recipients: [recipient('r1')],
        messages: [
          {
            id: 'm1',
            recipientId: 'r1',
            timestamp: 1,
            type: 'audio',
            isHidden: false,
            transcript: 'what I wanted to say',
            transcriptionStatus: 'successful',
          },
        ],
        profile: null,
        theme: null,
        customColors: null,
        backgroundSettings: null,
        supportRegion: null,
      },
      audioIndex: {},
    };
    mockPickedZip(buildZipBuffer(manifest));

    const result = await restoreFromBackup();

    expect(result?.audioFailed).toBe(1);
    const [restored] = await StorageService.getMessages();
    expect(restored.audioMissing).toBe(true);
    expect(restored.transcript).toBe('what I wanted to say');
    expect(restored.transcriptionStatus).toBe('successful');
  });
});
