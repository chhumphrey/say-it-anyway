
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { SuperwallProvider, SuperwallLoading, SuperwallLoaded, SuperwallError } from 'expo-superwall';
import { BillingConfig } from '@/constants/BillingConfig';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Check if Superwall is available (won't be in Expo Go)
let isSuperwallAvailable = false;
try {
  require('expo-superwall');
  isSuperwallAvailable = Platform.OS !== 'web';
} catch (error) {
  console.log('Superwall not available - running in Expo Go or web');
}

function RootLayoutContent() {
  useEffect(() => {
    // Hide splash screen after a short delay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
      </Stack>
    </GestureHandlerRootView>
  );
}

function SuperwallWrapper({ children }: { children: React.ReactNode }) {
  if (!isSuperwallAvailable) {
    // If Superwall is not available (Expo Go or web), just render children
    console.log('Superwall not available - rendering without SuperwallProvider');
    return <>{children}</>;
  }

  return (
    <SuperwallProvider
      apiKeys={{
        ios: BillingConfig.superwall.apiKey,
        android: BillingConfig.superwall.apiKey,
      }}
      options={{
        logging: {
          level: 'debug',
          scopes: ['all'],
        },
      }}
      onConfigurationError={(error) => {
        console.error('Superwall configuration error:', error);
      }}
    >
      <SuperwallLoading>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>
      </SuperwallLoading>

      <SuperwallError>
        {(error) => (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Configuration Error</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorSubtext}>
              The app will continue in limited mode. Some features may not be available.
            </Text>
          </View>
        )}
      </SuperwallError>

      <SuperwallLoaded>{children}</SuperwallLoaded>
    </SuperwallProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SuperwallWrapper>
        <SubscriptionProvider>
          <RootLayoutContent />
        </SubscriptionProvider>
      </SuperwallWrapper>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 12,
  },
});
