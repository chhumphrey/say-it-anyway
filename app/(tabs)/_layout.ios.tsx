
import React from 'react';
import { Stack } from 'expo-router';

export default function TabLayout() {
  // No tabs needed - this is a single-screen app with navigation handled by buttons
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      <Stack.Screen key="home" name="(home)" />
    </Stack>
  );
}
