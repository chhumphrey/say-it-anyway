// Audio recordings must never be referenced by a bare absolute path. On iOS,
// the app's container path (everything above Documents/Caches) is not
// guaranteed stable across an app update -- Apple makes no promise that it
// survives, and separately, anything under Caches can be purged by the OS at
// any time regardless of updates. A path persisted today can point at
// nothing tomorrow.
//
// The fix: every recording lives under Paths.document (never purged, backed
// up), and only the portion of its path *relative* to Paths.document is
// persisted. The absolute path is reconstructed fresh, from the current
// session's actual Paths.document, every time it's needed -- see
// resolveAudioUri(). This makes storage immune to container-path changes by
// construction, not by hoping a given update happens to preserve them.
import { Directory, File, Paths } from 'expo-file-system';

const MIGRATED_AUDIO_SUBDIR = 'migrated-audio';

// Historical (pre-1.3.1) recording locations, both platforms. These are the
// *only* two places any recording has ever been written by this app (see
// RecordingPresets.LOW_QUALITY, which has never set a `directory` override),
// so they're the complete search space for migration.
const LEGACY_CACHE_SUBFOLDERS = ['ExpoAudio', 'Audio'];

/**
 * Converts an absolute file:// URI into a path relative to Paths.document,
 * if it's under there at all. Returns null for anything else (a legacy
 * absolute path elsewhere, e.g. still under Caches) -- the caller is
 * responsible for deciding what to do with those (see audioMigration.ts).
 */
export function toRelativeAudioPath(absoluteUri: string): string | null {
  const root = Paths.document.uri;
  if (!absoluteUri.startsWith(root)) {
    return null;
  }
  return absoluteUri.slice(root.length).replace(/^\/+/, '');
}

/**
 * Reconstructs a usable absolute URI from a stored relative path, using the
 * *current* session's actual Paths.document. Safe to call on every read --
 * it does no I/O, just string construction.
 */
export function resolveAudioUri(relativePath: string): string {
  return new File(Paths.document, relativePath).uri;
}

/**
 * Where a just-migrated (copied) recording should live. A dedicated
 * subfolder, distinct from the one expo-audio's native recorder creates for
 * brand-new recordings (ExpoAudio/Audio), so a device inspection can tell
 * at a glance which recordings were migrated vs. recorded fresh.
 */
export function migratedAudioDestination(filename: string): File {
  const dir = new Directory(Paths.document, MIGRATED_AUDIO_SUBDIR);
  if (!dir.exists) {
    dir.create({ idempotent: true });
  }
  return new File(dir, filename);
}

/**
 * Every place a recording from before this fix could still be sitting,
 * given the exact basename recorded in its (possibly now-stale) stored
 * path. Covers the iOS container-path-changed-but-Caches-contents-survived
 * case: the absolute root may have changed, but the relative structure
 * under Caches (ExpoAudio/<filename>) is reconstructable from the current
 * session's own Caches directory.
 */
export function legacyCacheCandidates(filename: string): File[] {
  return LEGACY_CACHE_SUBFOLDERS.map((subfolder) => new File(Paths.cache, subfolder, filename));
}

/**
 * The bare filename from any file:// URI or plain path, regardless of how
 * many path segments precede it.
 */
export function basenameOf(uriOrPath: string): string {
  const withoutQuery = uriOrPath.split('?')[0];
  const segments = withoutQuery.split('/');
  return segments[segments.length - 1];
}
