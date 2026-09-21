// Recovery path for messages left in 'pending' by a transcription attempt
// that never got to finish (app closed or killed mid-attempt -- there's no
// OS-level background task keeping it alive). Rather than silently
// auto-restarting those attempts on focus (the original bug), this surfaces
// them as a non-blocking banner the user can act on or ignore.
import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { Message } from '@/types';
import { StorageService } from '@/utils/storage';
import { useAppTheme } from '@/contexts/ThemeContext';
import { isTranscriptionActive } from '@/utils/activeTranscriptions';
import { dismissRecoveryPrompt } from '@/utils/transcriptionAttempt';
import { TranscriptionAttemptModal, type TranscriptionAttemptFinish } from '@/components/TranscriptionAttemptModal';

export function PendingTranscriptionBanner() {
  const { theme } = useAppTheme();
  const [stuckMessages, setStuckMessages] = useState<Message[]>([]);
  const [activeMessage, setActiveMessage] = useState<Message | null>(null);
  const stuckMessagesRef = useRef<Message[]>([]);

  const loadStuck = useCallback(async () => {
    const all = await StorageService.getMessages();
    const stuck = all.filter(
      (m) => m.type === 'audio' && m.transcriptionStatus === 'pending' && !isTranscriptionActive(m.id)
    );
    stuckMessagesRef.current = stuck;
    setStuckMessages(stuck);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStuck();

      // Leaving the screen without acting on the banner counts as an
      // ignored prompt -- same as tapping Dismiss -- so a stuck message
      // can't just sit unresolved forever. See dismissRecoveryPrompt.
      return () => {
        const stillStuck = stuckMessagesRef.current.filter((m) => !isTranscriptionActive(m.id));
        if (stillStuck.length > 0) {
          Promise.all(stillStuck.map((m) => dismissRecoveryPrompt(m))).catch((error) => {
            console.error('Failed to record ignored transcription-recovery prompt:', error);
          });
        }
      };
    }, [loadStuck])
  );

  const handleReview = () => {
    const next = stuckMessagesRef.current[0];
    if (!next) return;
    const remaining = stuckMessagesRef.current.filter((m) => m.id !== next.id);
    stuckMessagesRef.current = remaining;
    setStuckMessages(remaining);
    setActiveMessage(next);
  };

  const handleDismiss = async () => {
    const current = stuckMessagesRef.current;
    stuckMessagesRef.current = [];
    setStuckMessages([]);
    await Promise.all(current.map((m) => dismissRecoveryPrompt(m)));
  };

  const handleAttemptFinished = (_result: TranscriptionAttemptFinish) => {
    setActiveMessage(null);
    loadStuck();
  };

  if (stuckMessages.length === 0 && !activeMessage) {
    return null;
  }

  return (
    <>
      {stuckMessages.length > 0 && (
        <View style={[styles.banner, { backgroundColor: theme.colors.secondary, borderColor: theme.colors.border }]}>
          <Text style={[styles.text, { color: theme.colors.text }]}>
            {stuckMessages.length === 1
              ? '1 recording needs transcription'
              : `${stuckMessages.length} recordings need transcription`}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleDismiss} style={styles.actionButton}>
              <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>Dismiss</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleReview} style={styles.actionButton}>
              <Text style={[styles.actionText, { color: theme.colors.primary }]}>Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <TranscriptionAttemptModal message={activeMessage} onFinished={handleAttemptFinished} />
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
