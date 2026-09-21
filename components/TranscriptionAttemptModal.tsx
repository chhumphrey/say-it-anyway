// Foreground transcription flow: shown for the message the user just
// recorded, or a message they're actively retrying/reviewing. Drives one
// attempt at a time via runTranscriptionAttempt, looping into another
// attempt on retry and stopping at a terminal outcome (success/unavailable)
// or a user decline.
import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

import { Message } from '@/types';
import { useAppTheme } from '@/contexts/ThemeContext';
import {
  runTranscriptionAttempt,
  declineRetry,
  attemptCountLabel,
} from '@/utils/transcriptionAttempt';
import { markTranscriptionActive, markTranscriptionInactive } from '@/utils/activeTranscriptions';
import type { TranscriptionDownloadProgress } from '@/utils/transcriptionService';

type Phase =
  | { kind: 'downloading'; progress: number | null }
  | { kind: 'transcribing' }
  | { kind: 'retry-prompt'; attempts: number }
  | { kind: 'unavailable' };

export type TranscriptionAttemptFinish =
  | { outcome: 'success'; flagged: boolean }
  | { outcome: 'declined' }
  | { outcome: 'unavailable' };

interface Props {
  message: Message | null;
  onFinished: (result: TranscriptionAttemptFinish) => void;
}

export function TranscriptionAttemptModal({ message, onFinished }: Props) {
  const { theme } = useAppTheme();
  const [phase, setPhase] = useState<Phase>({ kind: 'downloading', progress: null });
  const workingMessageRef = useRef<Message | null>(null);
  const attemptRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!message) {
      return;
    }

    let cancelled = false;
    workingMessageRef.current = message;
    markTranscriptionActive(message.id);

    const attemptOnce = async () => {
      const current = workingMessageRef.current;
      if (!current) return;

      setPhase({ kind: 'downloading', progress: null });
      const result = await runTranscriptionAttempt(current, {
        onDownloadProgress: (progress: TranscriptionDownloadProgress) => {
          if (cancelled) return;
          setPhase({
            kind: 'downloading',
            progress: progress.totalBytes > 0
              ? Math.round((progress.bytesWritten / progress.totalBytes) * 100)
              : null,
          });
        },
        onTranscribingStart: () => {
          if (!cancelled) setPhase({ kind: 'transcribing' });
        },
      });
      if (cancelled) return;

      if (result.outcome === 'success') {
        onFinished({ outcome: 'success', flagged: result.flagged });
        return;
      }

      workingMessageRef.current = { ...current, transcriptionAttempts: result.attempts };

      if (result.exhausted) {
        setPhase({ kind: 'unavailable' });
        return;
      }

      setPhase({ kind: 'retry-prompt', attempts: result.attempts });
    };

    attemptRef.current = () => {
      attemptOnce();
    };
    attemptOnce();

    return () => {
      cancelled = true;
      markTranscriptionInactive(message.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message?.id]);

  if (!message) {
    return null;
  }

  const handleRetry = () => {
    attemptRef.current();
  };

  const handleDecline = async () => {
    const current = workingMessageRef.current ?? message;
    await declineRetry(current);
    onFinished({ outcome: 'declined' });
  };

  const handleDismissUnavailable = () => {
    onFinished({ outcome: 'unavailable' });
  };

  // No cancelling mid-attempt (downloading/transcribing) -- there's nothing
  // useful to roll back to, and the modal will resolve to a retry prompt or
  // a terminal state on its own shortly either way.
  const handleRequestClose = () => {
    if (phase.kind === 'retry-prompt') {
      handleDecline();
    } else if (phase.kind === 'unavailable') {
      handleDismissUnavailable();
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={handleRequestClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {phase.kind === 'downloading' && (
            <>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Downloading transcription model…
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                {phase.progress !== null
                  ? `${phase.progress}% -- this only happens once.`
                  : 'This only happens once.'}
              </Text>
              {phase.progress !== null && (
                <View style={[styles.progressTrack, { backgroundColor: theme.colors.background }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: theme.colors.primary, width: `${phase.progress}%` },
                    ]}
                  />
                </View>
              )}
            </>
          )}

          {phase.kind === 'transcribing' && (
            <>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.title, { color: theme.colors.text }]}>Transcribing…</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                This stays entirely on your device.
              </Text>
            </>
          )}

          {phase.kind === 'retry-prompt' && (
            <>
              <Text style={[styles.title, { color: theme.colors.text }]}>Transcription failed</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                {attemptCountLabel(phase.attempts)}
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.text, marginTop: 4 }]}>
                Retry now?
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity onPress={handleDecline} style={styles.button}>
                  <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>Not Now</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleRetry} style={styles.button}>
                  <Text style={[styles.buttonText, { color: theme.colors.primary }]}>Retry</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {phase.kind === 'unavailable' && (
            <>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Transcription unavailable for this message.
              </Text>
              <TouchableOpacity onPress={handleDismissUnavailable} style={[styles.button, styles.okButton]}>
                <Text style={[styles.buttonText, { color: theme.colors.primary }]}>OK</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 20,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  okButton: {
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
