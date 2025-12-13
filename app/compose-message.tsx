
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  useAudioRecorder, 
  RecordingPresets, 
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
  getRecordingPermissionsAsync,
} from 'expo-audio';
import { Message } from '@/types';
import { StorageService } from '@/utils/storage';
import { useAppTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/IconSymbol';
import { screenMessage } from '@/utils/mentalHealthScreening';

export default function ComposeMessageScreen() {
  const router = useRouter();
  const { recipientId, type } = useLocalSearchParams();
  const { theme } = useAppTheme();
  const [textContent, setTextContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);

  const audioRecorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);

  useEffect(() => {
    if (type === 'audio') {
      checkAndRequestPermissions();
    } else {
      setIsCheckingPermission(false);
    }
  }, [type]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const checkAndRequestPermissions = async () => {
    try {
      console.log('Checking audio recording permissions...');
      setIsCheckingPermission(true);
      
      // First check if we already have permission
      const existingPermission = await getRecordingPermissionsAsync();
      console.log('Existing permission status:', existingPermission);
      
      if (existingPermission.granted) {
        setHasPermission(true);
        await configureAudioMode();
        setIsCheckingPermission(false);
        return;
      }

      // Request permission if not granted
      console.log('Requesting audio recording permissions...');
      const permission = await requestRecordingPermissionsAsync();
      console.log('Permission request result:', permission);
      
      setHasPermission(permission.granted);
      
      if (permission.granted) {
        await configureAudioMode();
      } else {
        Alert.alert(
          'Permission Required',
          'Microphone access is required to record audio messages. Please enable it in your device settings.',
          [
            { text: 'Go Back', onPress: () => router.back() },
            { text: 'Try Again', onPress: checkAndRequestPermissions },
          ]
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert(
        'Permission Error',
        'Could not request microphone permission. Please check your device settings.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setIsCheckingPermission(false);
    }
  };

  const configureAudioMode = async () => {
    try {
      console.log('Configuring audio mode...');
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      console.log('Audio mode configured successfully');
    } catch (error) {
      console.error('Error configuring audio mode:', error);
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant microphone permission first.');
      await checkAndRequestPermissions();
      return;
    }

    try {
      console.log('Starting recording...');
      await audioRecorder.prepareToRecordAsync();
      await audioRecorder.record();
      setIsRecording(true);
      setRecordingDuration(0);
      console.log('Recording started');
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Recording Error', 'Could not start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      console.log('Stopping recording...');
      await audioRecorder.stop();
      setIsRecording(false);
      console.log('Recording stopped. URI:', audioRecorder.uri);
    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert('Error', 'Could not stop recording properly.');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    if (type === 'text' && !textContent.trim()) {
      Alert.alert('Empty message', 'Please write something before saving.');
      return;
    }

    if (type === 'audio' && !audioRecorder.uri) {
      Alert.alert('No recording', 'Please record an audio message before saving.');
      return;
    }

    setIsSaving(true);

    try {
      console.log('Saving message...');
      const message: Message = {
        id: Date.now().toString(),
        recipientId: recipientId as string,
        timestamp: Date.now(),
        type: type as 'text' | 'audio',
        textContent: type === 'text' ? textContent.trim() : undefined,
        audioUri: type === 'audio' ? audioRecorder.uri || undefined : undefined,
        transcript: type === 'audio' ? 'Audio transcription not available in this version' : undefined,
        isHidden: false,
      };

      await StorageService.saveMessage(message);
      console.log('Message saved:', message.id);

      // Update recipient's last message timestamp
      const recipients = await StorageService.getRecipients();
      const recipientIndex = recipients.findIndex(r => r.id === recipientId);
      if (recipientIndex !== -1) {
        recipients[recipientIndex].lastMessageTimestamp = Date.now();
        await StorageService.saveRecipients(recipients);
      }

      // Screen message for mental health concerns
      const contentToScreen = type === 'text' ? textContent : message.transcript || '';
      const screeningResult = screenMessage(contentToScreen);

      if (screeningResult.isFlagged) {
        console.log('Mental health screening flagged:', screeningResult);
        router.replace('/support-resources');
      } else {
        router.back();
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Could not save message. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={28}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {type === 'text' ? 'Write Message' : 'Record Audio'}
        </Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text style={[styles.saveText, { color: theme.colors.primary }]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {type === 'text' ? (
          <View style={styles.textSection}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Your message
            </Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
              value={textContent}
              onChangeText={setTextContent}
              placeholder="Write what&apos;s on your heart..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              autoFocus
              textAlignVertical="top"
            />
            <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
              This is a safe space to express your thoughts and feelings.
            </Text>
          </View>
        ) : (
          <View style={styles.audioSection}>
            {isCheckingPermission ? (
              <View style={styles.permissionBox}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.permissionText, { color: theme.colors.text }]}>
                  Checking permissions...
                </Text>
              </View>
            ) : !hasPermission ? (
              <View style={styles.permissionBox}>
                <IconSymbol
                  ios_icon_name="mic.slash.fill"
                  android_material_icon_name="mic-off"
                  size={48}
                  color={theme.colors.textSecondary}
                />
                <Text style={[styles.permissionText, { color: theme.colors.text }]}>
                  Microphone permission required
                </Text>
                <Text style={[styles.permissionSubtext, { color: theme.colors.textSecondary }]}>
                  We need access to your microphone to record audio messages.
                </Text>
                <TouchableOpacity
                  style={[styles.permissionButton, { backgroundColor: theme.colors.primary }]}
                  onPress={checkAndRequestPermissions}
                >
                  <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={[styles.recordingBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <IconSymbol
                    ios_icon_name={isRecording ? 'waveform' : 'mic.fill'}
                    android_material_icon_name={isRecording ? 'graphic-eq' : 'mic'}
                    size={64}
                    color={isRecording ? theme.colors.danger : theme.colors.primary}
                  />
                  
                  {isRecording && (
                    <Text style={[styles.recordingDuration, { color: theme.colors.danger }]}>
                      {formatDuration(recordingDuration)}
                    </Text>
                  )}
                  
                  {audioRecorder.uri && !isRecording && (
                    <Text style={[styles.recordedText, { color: theme.colors.primary }]}>
                      Recording saved
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.recordButton,
                    { backgroundColor: isRecording ? theme.colors.danger : theme.colors.primary },
                  ]}
                  onPress={isRecording ? stopRecording : startRecording}
                >
                  <IconSymbol
                    ios_icon_name={isRecording ? 'stop.fill' : 'mic.fill'}
                    android_material_icon_name={isRecording ? 'stop' : 'mic'}
                    size={24}
                    color="#FFFFFF"
                  />
                  <Text style={styles.recordButtonText}>
                    {isRecording ? 'Stop Recording' : audioRecorder.uri ? 'Record Again' : 'Start Recording'}
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
                  Tap the button to {isRecording ? 'stop' : 'start'} recording your message.
                </Text>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  saveButton: {
    padding: 4,
  },
  saveText: {
    fontSize: 17,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  textSection: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 300,
  },
  hint: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  audioSection: {
    alignItems: 'center',
    paddingTop: 40,
  },
  permissionBox: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  permissionSubtext: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  recordingBox: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  recordingDuration: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  },
  recordedText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
