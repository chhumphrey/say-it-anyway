jest.mock('expo-file-system');

import { Paths, File } from 'expo-file-system';
import {
  toRelativeAudioPath,
  resolveAudioUri,
  migratedAudioDestination,
  legacyCacheCandidates,
  basenameOf,
} from '@/utils/audioPaths';

describe('toRelativeAudioPath', () => {
  it('strips the Paths.document root from an absolute uri under it', () => {
    const absolute = new File(Paths.document, 'ExpoAudio', 'recording-abc.m4a').uri;
    expect(toRelativeAudioPath(absolute)).toBe('ExpoAudio/recording-abc.m4a');
  });

  it('returns null for a path outside Paths.document (e.g. still under Caches)', () => {
    const absolute = new File(Paths.cache, 'ExpoAudio', 'recording-abc.m4a').uri;
    expect(toRelativeAudioPath(absolute)).toBeNull();
  });
});

describe('resolveAudioUri', () => {
  it('round-trips with toRelativeAudioPath', () => {
    const original = new File(Paths.document, 'ExpoAudio', 'recording-xyz.m4a').uri;
    const relative = toRelativeAudioPath(original)!;
    expect(resolveAudioUri(relative)).toBe(original);
  });

  it('reflects the *current* Paths.document, not whatever root the path was first created under', () => {
    // Simulates exactly the bug this exists to prevent: the absolute root
    // can change (container path rotation) between when a path was stored
    // and when it's read back. resolveAudioUri must never bake in a root
    // captured at an earlier point in time.
    const relative = 'ExpoAudio/recording-xyz.m4a';
    expect(resolveAudioUri(relative)).toBe(new File(Paths.document, relative).uri);
  });
});

describe('migratedAudioDestination', () => {
  it('creates the migrated-audio directory on demand and places the file under it', () => {
    const dest = migratedAudioDestination('recording-123.m4a');
    expect(dest.uri).toContain('migrated-audio');
    expect(dest.uri.endsWith('recording-123.m4a')).toBe(true);
  });
});

describe('legacyCacheCandidates', () => {
  it('returns both historical per-platform cache subfolders for the same filename', () => {
    const candidates = legacyCacheCandidates('recording-abc.m4a');
    expect(candidates).toHaveLength(2);
    expect(candidates.some((f) => f.uri.includes('ExpoAudio'))).toBe(true);
    expect(candidates.some((f) => f.uri.includes('/Audio/'))).toBe(true);
    candidates.forEach((f) => expect(f.uri.endsWith('recording-abc.m4a')).toBe(true));
  });
});

describe('basenameOf', () => {
  it('extracts the filename from a full file:// uri', () => {
    expect(basenameOf('file:///var/mobile/Containers/.../ExpoAudio/recording-abc.m4a')).toBe('recording-abc.m4a');
  });

  it('strips a query string if present', () => {
    expect(basenameOf('file:///tmp/recording-abc.m4a?cache=1')).toBe('recording-abc.m4a');
  });

  it('handles a bare filename with no path', () => {
    expect(basenameOf('recording-abc.m4a')).toBe('recording-abc.m4a');
  });
});
