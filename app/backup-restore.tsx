
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/IconSymbol';
import { getSceneImageUrl } from '@/utils/themes';
import { createBackup, restoreFromBackup, getLastBackupDate, RestoreResult, BackupResult } from '@/utils/backup';

export default function BackupRestoreScreen() {
  const router = useRouter();
  const { theme, backgroundSettings } = useAppTheme();

  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null);
  // Captured but not yet surfaced in the UI below -- the "N recordings
  // couldn't be included" wording needs sign-off first (see conversation).
  // Wire missingAudioCount into the UI once approved.
  const [backupResult, setBackupResult] = useState<BackupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLastBackupDate().then(setLastBackupDate);
  }, []);

  const formatDate = (isoString: string): string => {
    try {
      return new Date(isoString).toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const handleCreateBackup = async () => {
    setIsCreating(true);
    setError(null);
    setRestoreResult(null);
    setBackupResult(null);
    try {
      const result = await createBackup();
      setBackupResult(result);
      const date = await getLastBackupDate();
      setLastBackupDate(date);
    } catch (err: any) {
      console.error('BackupRestoreScreen: backup error', err);
      setError(err?.message || 'An error occurred while creating the backup.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    setError(null);
    setRestoreResult(null);
    try {
      const result = await restoreFromBackup();
      if (result !== null) {
        setRestoreResult(result);
      }
    } catch (err: any) {
      console.error('BackupRestoreScreen: restore error', err);
      setError(err?.message || 'An error occurred while restoring the backup.');
    } finally {
      setIsRestoring(false);
    }
  };

  const isLoading = isCreating || isRestoring;

  const currentBackgroundUri =
    backgroundSettings.scene === 'Custom Photo' && backgroundSettings.customPhotoUri
      ? backgroundSettings.customPhotoUri
      : getSceneImageUrl(backgroundSettings.scene);

  const backgroundOpacity = backgroundSettings.transparency / 100;

  return (
    <ImageBackground
      source={{ uri: currentBackgroundUri }}
      style={styles.backgroundImage}
      imageStyle={{ opacity: backgroundOpacity }}
    >
      <View style={[styles.container, { backgroundColor: 'transparent' }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={28}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Backup & Restore
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

          {/* Back Up Section */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Back Up Your Data
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Creates an archive of all your recipients, messages, and audio recordings. Use the share sheet to save it to Files, email it to yourself, or store it in cloud storage.
          </Text>

          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.lastBackupRow}>
              <IconSymbol
                ios_icon_name="clock"
                android_material_icon_name="schedule"
                size={18}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.lastBackupText, { color: theme.colors.textSecondary }]}>
                {lastBackupDate ? `Last backup: ${formatDate(lastBackupDate)}` : 'No backup created yet'}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.primary },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleCreateBackup}
              disabled={isLoading}
            >
              {isCreating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <IconSymbol
                  ios_icon_name="arrow.up.doc.fill"
                  android_material_icon_name="upload-file"
                  size={20}
                  color="#FFFFFF"
                />
              )}
              <Text style={styles.actionButtonText}>
                {isCreating ? 'Creating Backup…' : 'Create Backup'}
              </Text>
            </TouchableOpacity>

            {backupResult && backupResult.missingAudioCount > 0 && (
              <Text style={[styles.resultLine, { color: theme.colors.textSecondary, marginTop: 12 }]}>
                {backupResult.missingAudioCount === 1
                  ? "Backup created. 1 recording couldn't be included because its audio is no longer on this device."
                  : `Backup created. ${backupResult.missingAudioCount} recordings couldn't be included because their audio is no longer on this device.`}
              </Text>
            )}
          </View>

          {/* Restore Section */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 32 }]}>
            Restore Data
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Select a backup file to import. Only new entries will be added — anything already on this device won't be changed or duplicated.
          </Text>

          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.secondary },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleRestore}
              disabled={isLoading}
            >
              {isRestoring ? (
                <ActivityIndicator color={theme.colors.text} size="small" />
              ) : (
                <IconSymbol
                  ios_icon_name="arrow.down.doc.fill"
                  android_material_icon_name="download"
                  size={20}
                  color={theme.colors.text}
                />
              )}
              <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
                {isRestoring ? 'Restoring…' : 'Restore from Backup'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error display */}
          {error && (
            <View style={[styles.resultCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.danger }]}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="error"
                size={20}
                color={theme.colors.danger}
              />
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
            </View>
          )}

          {/* Restore result summary */}
          {restoreResult && (
            <View style={[styles.resultCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={styles.resultHeader}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={22}
                  color={theme.colors.primary}
                />
                <Text style={[styles.resultTitle, { color: theme.colors.text }]}>Import Complete</Text>
              </View>

              <ResultRow
                label="Recipients added"
                value={restoreResult.recipientsImported}
                skipped={restoreResult.recipientsSkipped}
                textColor={theme.colors.text}
                secondaryColor={theme.colors.textSecondary}
              />
              <ResultRow
                label="Messages added"
                value={restoreResult.messagesImported}
                skipped={restoreResult.messagesSkipped}
                textColor={theme.colors.text}
                secondaryColor={theme.colors.textSecondary}
              />
              {restoreResult.audioRestored > 0 && (
                <Text style={[styles.resultLine, { color: theme.colors.textSecondary }]}>
                  {restoreResult.audioRestored} audio recording{restoreResult.audioRestored !== 1 ? 's' : ''} restored
                </Text>
              )}
              {restoreResult.audioFailed > 0 && (
                <Text style={[styles.resultLine, { color: theme.colors.danger }]}>
                  {restoreResult.audioFailed} audio file{restoreResult.audioFailed !== 1 ? 's' : ''} could not be found in the backup
                </Text>
              )}
            </View>
          )}

          {/* Privacy note */}
          <View style={[styles.infoBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <IconSymbol
              ios_icon_name="lock.fill"
              android_material_icon_name="lock"
              size={20}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              Your data never leaves your device except in the backup file you create.
            </Text>
          </View>

        </ScrollView>
      </View>
    </ImageBackground>
  );
}

function ResultRow({
  label,
  value,
  skipped,
  textColor,
  secondaryColor,
}: {
  label: string;
  value: number;
  skipped: number;
  textColor: string;
  secondaryColor: string;
}) {
  return (
    <View style={styles.resultRow}>
      <Text style={[styles.resultLabel, { color: textColor }]}>{label}:</Text>
      <Text style={[styles.resultValue, { color: textColor }]}>{value}</Text>
      {skipped > 0 && (
        <Text style={[styles.resultSkipped, { color: secondaryColor }]}>({skipped} already existed)</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
  },
  sectionDescription: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  lastBackupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lastBackupText: {
    fontSize: 14,
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
    gap: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultLabel: {
    fontSize: 15,
  },
  resultValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  resultSkipped: {
    fontSize: 13,
  },
  resultLine: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});
