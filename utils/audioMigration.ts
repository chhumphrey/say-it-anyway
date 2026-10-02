// One-time migration: moves every recording still referenced by a legacy
// absolute path (anything without audioRelativePath set) out of the
// platform's Caches directory and into Paths.document, where it's immune to
// both OS-driven Caches eviction and iOS container-path changes.
//
// Crash-safety / idempotency, by construction:
// - A message is only ever touched if it still lacks audioRelativePath AND
//   audioMissing -- both are terminal once set, so a message already
//   resolved by a prior (possibly interrupted) run is never reprocessed.
// - Per message, the order is always: copy -> verify -> persist the record
//   update -> delete the original. The original is never removed before the
//   record naming its replacement has been durably saved. If the process is
//   killed between "copy" and "persist", the next run just redoes the copy
//   (overwrite: true makes this safe) and tries again. If it's killed
//   between "persist" and "delete", the leftover original is simply never
//   cleaned up -- harmless (it's an orphaned copy sitting in Caches, with no
//   message referencing it), not retried, and not a correctness problem.
// - Each message's record update is persisted individually (not batched
//   into one write at the end), so progress already made survives a crash
//   partway through a run with many messages.
import { File } from 'expo-file-system';

import { Message } from '@/types';
import { StorageService } from '@/utils/storage';
import { basenameOf, legacyCacheCandidates, migratedAudioDestination, toRelativeAudioPath } from '@/utils/audioPaths';

export interface AudioMigrationSummary {
  /** Messages that already had audioRelativePath or audioMissing set. */
  alreadyResolved: number;
  /** Successfully located (at the original path or a legacy-cache fallback) and copied. */
  migrated: number;
  /** Not found anywhere searched; message and transcript preserved, flagged unavailable. */
  missing: number;
}

function needsMigration(message: Message): boolean {
  return message.type === 'audio' && !!message.audioUri && !message.audioRelativePath && !message.audioMissing;
}

/**
 * Finds a File instance that actually exists on disk for a legacy message,
 * trying its originally-stored path first, then the legacy Caches locations
 * this app has ever written to (covers the case where the container's root
 * changed but Caches itself was carried over).
 */
function locateLegacyFile(message: Message): File | null {
  const candidates: File[] = [];

  if (message.audioUri) {
    try {
      candidates.push(new File(message.audioUri));
    } catch {
      // Malformed stored URI -- fall through to the basename-search fallback.
    }
    candidates.push(...legacyCacheCandidates(basenameOf(message.audioUri)));
  }

  for (const candidate of candidates) {
    try {
      if (candidate.exists && candidate.size > 0) {
        return candidate;
      }
    } catch {
      // Treat any native error probing this candidate as "not this one".
    }
  }
  return null;
}

/**
 * Migrates a single message. Returns the outcome so the caller can tally a
 * summary; never throws -- a per-message failure is recorded as a "missing"
 * outcome rather than aborting the whole pass.
 */
async function migrateOne(message: Message): Promise<'migrated' | 'missing'> {
  const source = locateLegacyFile(message);
  if (!source) {
    await StorageService.updateMessage({ ...message, audioMissing: true });
    return 'missing';
  }

  const destination = migratedAudioDestination(basenameOf(source.uri));

  try {
    if (!(destination.exists && destination.size === source.size)) {
      await source.copy(destination, { overwrite: true });
    }

    // Verify before touching anything else -- this is the one hard
    // requirement: never remove the original or commit the new reference
    // on an unverified copy.
    if (!destination.exists || destination.size !== source.size || destination.size === 0) {
      await StorageService.updateMessage({ ...message, audioMissing: true });
      return 'missing';
    }

    const relativePath = toRelativeAudioPath(destination.uri);
    if (!relativePath) {
      // Should be unreachable -- migratedAudioDestination always builds
      // under Paths.document. Treat as missing rather than silently
      // leaving the message on a path we can't express as relative.
      await StorageService.updateMessage({ ...message, audioMissing: true });
      return 'missing';
    }

    // Persist the new reference before deleting the original.
    await StorageService.updateMessage({ ...message, audioRelativePath: relativePath });

    if (source.uri !== destination.uri) {
      try {
        source.delete();
      } catch (cleanupError) {
        // The migration is already durably recorded via audioRelativePath;
        // a leftover original is harmless and won't be retried.
        console.warn('audioMigration: could not delete original after migrating', message.id, cleanupError);
      }
    }

    return 'migrated';
  } catch (error) {
    console.warn('audioMigration: failed to migrate message', message.id, error);
    await StorageService.updateMessage({ ...message, audioMissing: true });
    return 'missing';
  }
}

/**
 * Runs the one-time migration over every stored message. Safe to call on
 * every launch -- messages already resolved (migrated or confirmed missing)
 * are skipped immediately, so a fully-migrated library costs one cheap
 * getMessages() call and nothing else.
 *
 * Must be awaited before any screen reads message/audio data.
 */
export async function runAudioMigration(): Promise<AudioMigrationSummary> {
  const messages = await StorageService.getMessages();
  const summary: AudioMigrationSummary = { alreadyResolved: 0, migrated: 0, missing: 0 };

  for (const message of messages) {
    if (message.type !== 'audio' || !message.audioUri) {
      continue;
    }
    if (!needsMigration(message)) {
      summary.alreadyResolved += 1;
      continue;
    }
    const outcome = await migrateOne(message);
    summary[outcome] += 1;
  }

  return summary;
}
