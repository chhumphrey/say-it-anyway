// Tiny in-memory signal so a mounted screen can refresh itself once the
// audio migration finishes, even when it finishes *after* app launch
// already proceeded (the migrationGate timeout case) -- without this, a
// screen opened and left open during that window would show stale data
// until the user navigated away and back (see app/recipient/[id].tsx's
// existing useFocusEffect, which already covers every other case: that
// one picks up the change on the next focus, but a screen that's never
// unfocused in the meantime has nothing to trigger a refetch).
type Listener = () => void;

const listeners = new Set<Listener>();

export function onAudioMigrationSettled(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitAudioMigrationSettled(): void {
  listeners.forEach((listener) => listener());
}
