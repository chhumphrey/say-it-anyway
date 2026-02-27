
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from './storage';
import { Recipient, Message } from '@/types';

const BACKUP_VERSION = 1;
const LAST_BACKUP_KEY = 'last_backup_date';

// Use string literal — FileSystem.EncodingType is undefined on web
const BASE64 = 'base64' as const;

interface BackupManifest {
  version: number;
  exportedAt: string;
  data: {
    recipients: Recipient[];
    messages: Message[];
    profile: any | null;
    theme: string | null;
    customColors: any | null;
    backgroundSettings: any | null;
    supportRegion: string | null;
  };
  // Maps messageId -> path within the zip archive e.g. "audio/messageId.m4a"
  audioIndex: Record<string, string>;
}

export interface RestoreResult {
  recipientsImported: number;
  recipientsSkipped: number;
  messagesImported: number;
  messagesSkipped: number;
  audioRestored: number;
  audioFailed: number;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  // Process in chunks to avoid call stack overflow on large audio files
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

// Trigger a file download in the browser
function webDownload(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Read picked file bytes on web using fetch (FileSystem is unavailable)
async function webReadPickedFile(uri: string): Promise<Uint8Array> {
  const response = await fetch(uri);
  if (!response.ok) throw new Error('Could not read the selected file.');
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

// ─── Build manifest and zip files (shared between platforms) ─────────────────

async function buildZip(
  zipFiles: Record<string, Uint8Array>,
  manifest: BackupManifest
): Promise<Uint8Array> {
  zipFiles['backup.json'] = strToU8(JSON.stringify(manifest));
  // level 1 = fast; audio is already compressed so high levels gain nothing
  return zipSync(zipFiles, { level: 1 });
}

// ─── createBackup ─────────────────────────────────────────────────────────────

export async function createBackup(): Promise<void> {
  console.log('backup.createBackup: Starting backup creation');

  const [recipients, messages, profile, theme, customColors, backgroundSettings, supportRegion] =
    await Promise.all([
      StorageService.getRecipients(),
      StorageService.getMessages(),
      StorageService.getProfile(),
      StorageService.getTheme(),
      StorageService.getCustomColors(),
      StorageService.getBackgroundSettings(),
      StorageService.getSupportRegion(),
    ]);

  console.log('backup.createBackup: Loaded', recipients.length, 'recipients,', messages.length, 'messages');

  const audioIndex: Record<string, string> = {};
  const zipFiles: Record<string, Uint8Array> = {};

  // Audio files only exist on native — skip entirely on web
  if (Platform.OS !== 'web') {
    for (const message of messages) {
      if (message.type === 'audio' && message.audioUri) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(message.audioUri);
          if (!fileInfo.exists) {
            console.log('backup.createBackup: Audio file missing, skipping:', message.id);
            continue;
          }
          const ext = message.audioUri.split('.').pop() || 'm4a';
          const zipPath = `audio/${message.id}.${ext}`;
          const base64 = await FileSystem.readAsStringAsync(message.audioUri, {
            encoding: BASE64,
          });
          zipFiles[zipPath] = base64ToUint8Array(base64);
          audioIndex[message.id] = zipPath;
          console.log('backup.createBackup: Packed audio for message', message.id);
        } catch (err) {
          console.warn('backup.createBackup: Could not read audio for message', message.id, err);
        }
      }
    }
  }

  const manifest: BackupManifest = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: { recipients, messages, profile, theme, customColors, backgroundSettings, supportRegion },
    audioIndex,
  };

  const zipped = await buildZip(zipFiles, manifest);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `say-it-anyway-backup-${dateStr}.zip`;

  if (Platform.OS === 'web') {
    webDownload(zipped, filename);
  } else {
    const zipPath = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(zipPath, uint8ArrayToBase64(zipped), {
      encoding: BASE64,
    });
    console.log('backup.createBackup: Zip written to', zipPath);
    await Sharing.shareAsync(zipPath, {
      mimeType: 'application/zip',
      dialogTitle: 'Save Your Backup File',
      UTI: 'public.zip-archive',
    });
  }

  await AsyncStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
  console.log('backup.createBackup: Complete');
}

// ─── restoreFromBackup ────────────────────────────────────────────────────────

export async function restoreFromBackup(): Promise<RestoreResult | null> {
  console.log('backup.restoreFromBackup: Opening document picker');

  const pickerResult = await DocumentPicker.getDocumentAsync({
    type: ['application/zip', 'application/octet-stream', '*/*'],
    copyToCacheDirectory: true,
  });

  if (pickerResult.canceled || !pickerResult.assets?.length) {
    console.log('backup.restoreFromBackup: Cancelled by user');
    return null;
  }

  const file = pickerResult.assets[0];
  console.log('backup.restoreFromBackup: Selected file:', file.name, file.size, 'bytes');

  // Read zip bytes — different approach per platform
  let zipBytes: Uint8Array;
  if (Platform.OS === 'web') {
    zipBytes = await webReadPickedFile(file.uri);
  } else {
    const base64Zip = await FileSystem.readAsStringAsync(file.uri, { encoding: BASE64 });
    zipBytes = base64ToUint8Array(base64Zip);
  }

  let unzipped: Record<string, Uint8Array>;
  try {
    unzipped = unzipSync(zipBytes);
  } catch {
    throw new Error('The selected file is not a valid backup archive.');
  }

  if (!unzipped['backup.json']) {
    throw new Error('This backup file is incomplete or corrupted.');
  }

  const manifest: BackupManifest = JSON.parse(strFromU8(unzipped['backup.json']));

  if (manifest.version > BACKUP_VERSION) {
    console.warn(
      `backup.restoreFromBackup: Backup version ${manifest.version} is newer than supported (${BACKUP_VERSION}). Proceeding anyway.`
    );
  }

  const [existingRecipients, existingMessages] = await Promise.all([
    StorageService.getRecipients(),
    StorageService.getMessages(),
  ]);

  const existingRecipientIds = new Set(existingRecipients.map((r) => r.id));
  const existingMessageIds = new Set(existingMessages.map((m) => m.id));

  console.log('backup.restoreFromBackup: Existing', existingRecipients.length, 'recipients,', existingMessages.length, 'messages');

  const result: RestoreResult = {
    recipientsImported: 0,
    recipientsSkipped: 0,
    messagesImported: 0,
    messagesSkipped: 0,
    audioRestored: 0,
    audioFailed: 0,
  };

  const newRecipients: Recipient[] = [];
  for (const recipient of (manifest.data.recipients || [])) {
    if (existingRecipientIds.has(recipient.id)) {
      result.recipientsSkipped++;
    } else {
      newRecipients.push(recipient);
      result.recipientsImported++;
    }
  }

  // Audio restoration is native-only; on web mark all packed audio as failed
  const audioDir = Platform.OS !== 'web' ? `${FileSystem.documentDirectory}audio/` : null;
  if (audioDir) {
    await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true }).catch(() => {});
  }

  const newMessages: Message[] = [];
  for (const message of (manifest.data.messages || [])) {
    if (existingMessageIds.has(message.id)) {
      result.messagesSkipped++;
      continue;
    }

    if (message.type === 'audio' && manifest.audioIndex[message.id]) {
      const zipPath = manifest.audioIndex[message.id];
      if (audioDir && unzipped[zipPath]) {
        try {
          const ext = zipPath.split('.').pop() || 'm4a';
          const newAudioPath = `${audioDir}${message.id}.${ext}`;
          const audioBase64 = uint8ArrayToBase64(unzipped[zipPath]);
          await FileSystem.writeAsStringAsync(newAudioPath, audioBase64, { encoding: BASE64 });
          message.audioUri = newAudioPath;
          result.audioRestored++;
          console.log('backup.restoreFromBackup: Restored audio for message', message.id);
        } catch (err) {
          console.warn('backup.restoreFromBackup: Failed to write audio for message', message.id, err);
          message.audioUri = undefined;
          result.audioFailed++;
        }
      } else {
        // Either web platform or audio not in archive
        message.audioUri = undefined;
        result.audioFailed++;
      }
    }

    newMessages.push(message);
    result.messagesImported++;
  }

  if (newRecipients.length > 0) {
    await StorageService.saveRecipients([...existingRecipients, ...newRecipients]);
  }
  if (newMessages.length > 0) {
    await StorageService.saveMessages([...existingMessages, ...newMessages]);
  }

  // Intentionally NOT restoring theme/customColors/backgroundSettings/supportRegion —
  // the user's current device preferences take precedence over imported ones.

  console.log('backup.restoreFromBackup: Complete —', JSON.stringify(result));
  return result;
}

export async function getLastBackupDate(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_BACKUP_KEY);
}
