// Dev-mode error logging — captures unhandled errors and promise rejections
// Only active in development builds (__DEV__ = false in production)

declare const __DEV__: boolean;

import { Platform } from "react-native";

// Messages to mute (noisy warnings that don't help debugging)
const MUTED_MESSAGES = [
  'each child in a list should have a unique "key" prop',
  'Each child in a list should have a unique "key" prop',
];

const shouldMuteMessage = (message: string): boolean =>
  MUTED_MESSAGES.some(muted => message.includes(muted));

export const setupErrorLogging = () => {
  if (!__DEV__) return;

  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  console.warn = (...args: any[]) => {
    const message = args.map(String).join(' ');
    if (!shouldMuteMessage(message)) {
      originalConsoleWarn.apply(console, args);
    }
  };

  console.error = (...args: any[]) => {
    const message = args.map(String).join(' ');
    if (!shouldMuteMessage(message)) {
      originalConsoleError.apply(console, args);
    }
  };

  if (typeof window !== 'undefined') {
    window.onerror = (message, source, lineno, colno, error) => {
      const sourceFile = source ? source.split('/').pop() : 'unknown';
      console.error(`[Error] ${message} at ${sourceFile}:${lineno}:${colno}`, error);
      return false;
    };

    if (Platform.OS === 'web') {
      window.addEventListener('unhandledrejection', (event) => {
        console.error('[UnhandledRejection]', event.reason);
      });
    }
  }
};

if (__DEV__) {
  setupErrorLogging();
}
