// Keeps app launch from ever blocking indefinitely on startup work that
// must run before any screen reads message/audio data (the audio
// migration, and the one-time transcription-lockout reset that runs after
// it). Resolves as soon as EITHER the wrapped task settles (success or
// failure) OR a timeout elapses, whichever comes first. A task that times
// out keeps running in the background rather than being cancelled -- there's
// no clean way to abort an in-flight file copy, and it doesn't matter: the
// audio migration is per-message and resumable (see audioMigration.ts), so
// whatever it completes still persists normally, and anything it doesn't
// reach in time is simply retried on the next launch.
const DEFAULT_TIMEOUT_MS = 8000;

export interface MigrationGateOptions {
  timeoutMs?: number;
}

export function awaitMigrationOrTimeout(
  task: () => Promise<unknown>,
  { timeoutMs = DEFAULT_TIMEOUT_MS }: MigrationGateOptions = {}
): Promise<void> {
  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const timeoutId = setTimeout(() => {
      console.warn(
        `Startup task did not complete within ${timeoutMs}ms; opening the app now. ` +
          'Anything it has not yet reached will be retried on the next launch.'
      );
      finish();
    }, timeoutMs);

    task()
      .then((summary) => {
        console.log('Startup task result:', summary);
      })
      .catch((error) => {
        console.error('Startup task failed; unprocessed work will be retried on the next launch:', error);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        finish();
      });
  });
}
