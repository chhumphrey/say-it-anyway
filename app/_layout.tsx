
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { runAudioMigration } from '@/utils/audioMigration';
import { resetLegacyTranscriptionLockouts } from '@/utils/transcriptionLockoutReset';
import { awaitMigrationOrTimeout } from '@/utils/migrationGate';
import { emitAudioMigrationSettled } from '@/utils/audioMigrationEvents';

// Prevent the splash screen from auto-hiding -- called at module scope, so
// it runs before anything else in this file, and holds the *native* splash
// screen (not a JS-rendered substitute) up for the entire migration gate
// below.
SplashScreen.preventAutoHideAsync();

// The transcription-lockout reset needs to know each message's current
// audioMissing status (set by the audio migration) to correctly skip
// messages with no audio at all -- so it must run after, not alongside,
// the migration.
async function runStartupTasks() {
  const migrationSummary = await runAudioMigration();
  // Fires whether this happens before or after the gate below times out --
  // a screen that's been open and mounted the whole time (the one case
  // useFocusEffect can't already cover) refreshes as soon as this does.
  emitAudioMigrationSettled();
  const resetSummary = await resetLegacyTranscriptionLockouts();
  return { migrationSummary, resetSummary };
}

function RootLayoutContent() {
  // No screen may read a message's audio reference before the one-time
  // migration (legacy recordings out of Caches, into Paths.document) has
  // run -- otherwise a screen could grab a stale absolute path moments
  // before it gets corrected. Keep the splash screen up and render nothing
  // else until it's done.
  //
  // This must never block launch indefinitely, though: startup work that
  // throws or simply takes too long (a huge library, a slow device, a
  // filesystem hiccup) still has to let the app open. awaitMigrationOrTimeout
  // races it against a timeout and resolves on whichever comes first; work
  // that times out keeps running in the background and whatever it doesn't
  // finish is retried next launch (see audioMigration.ts and
  // migrationGate.ts for why that's safe).
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    awaitMigrationOrTimeout(runStartupTasks).then(() => {
      if (!cancelled) {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'default',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="formsheet"
          options={{
            presentation: 'formSheet',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="transparent-modal"
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="backup-restore"
          options={{
            headerShown: false,
            animation: 'default',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
