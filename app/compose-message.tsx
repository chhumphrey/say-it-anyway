
import React, { useState, useEffect, useCallback } from 'react';
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
import { generateUUID } from '@/utils/uuid';
import { useAppTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/IconSymbol';
import { screenMessage } from '@/utils/mentalHealthScreening';
import { transcribeAudio, getTranscriptionMessage } from '@/utils/transcription';

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
  const [isTranscribing, setIsTranscribing] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);

  const configureAudioMode = useCallback(async () => {
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
  }, []);

  const checkAndRequestPermissions = useCallback(async () => {
    try {
      console.log('Checking audio recording permissions...');
      setIsCheckingPermission(true);
      
      const existingPermission = await getRecordingPermissionsAsync();
      console.log('Existing permission status:', existingPermission);
      
      if (existingPermission.granted) {
        setHasPermission(true);
        await configureAudioMode();
        setIsCheckingPermission(false);
        return;
      }

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
  }, [configureAudioMode, router]);

  useEffect(() => {
    if (type === 'audio') {
      checkAndRequestPermissions();
    } else {
      setIsCheckingPermission(false);
    }
  }, [type, checkAndRequestPermissions]);

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
      
      let transcript: string | undefined = undefined;
      let transcriptionStatus: 'pending' | 'completed' | 'failed' | 'none' = 'none';
      let transcriptionError: string | undefined = undefined;
      
      // Attempt transcription for audio messages
      if (type === 'audio' && audioRecorder.uri) {
        const audioDuration = recordingDuration;
        
        console.log('Attempting to transcribe audio...');
        setIsTranscribing(true);
        transcriptionStatus = 'pending';
        
        const transcriptionResult = await transcribeAudio(audioRecorder.uri, audioDuration);
        
        if (transcriptionResult.success && transcriptionResult.transcript) {
          transcript = transcriptionResult.transcript;
          transcriptionStatus = 'completed';
          console.log('Transcription successful:', transcript);
        } else {
          transcriptionStatus = 'failed';
          transcriptionError = transcriptionResult.error;
          console.log('Transcription failed:', transcriptionResult.error);
        }
        
        setIsTranscribing(false);
      }
      
      const message: Message = {
        id: generateUUID(),
        recipientId: recipientId as string,
        timestamp: Date.now(),
        type: type as 'text' | 'audio',
        textContent: type === 'text' ? textContent.trim() : undefined,
        audioUri: type === 'audio' ? audioRecorder.uri || undefined : undefined,
        audioDuration: type === 'audio' ? recordingDuration : undefined,
        transcript: transcript,
        transcriptionStatus: transcriptionStatus,
        transcriptionError: transcriptionError,
        isHidden: false,
      };

      console.log('Created message with ID:', message.id);
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
      // For text messages, use the text content
      // For audio messages, use the transcript if available
      let contentToScreen = '';
      let shouldScreen = false;
      
      if (type === 'text' && textContent.trim()) {
        contentToScreen = textContent.trim();
        shouldScreen = true;
        console.log('Screening text message for mental health concerns');
      } else if (type === 'audio' && transcript && transcript !== '(Transcription pending – coming soon)') {
        contentToScreen = transcript;
        shouldScreen = true;
        console.log('Screening transcribed audio for mental health concerns');
      } else if (type === 'audio' && !transcript) {
        console.log('Audio message cannot be screened - no transcript available');
        shouldScreen = false;
      }
      
      if (shouldScreen && contentToScreen) {
        const screeningResult = screenMessage(contentToScreen);
        console.log('Mental health screening result:', screeningResult);

        if (screeningResult.isFlagged) {
          console.log('Message flagged for mental health concerns:', screeningResult.matchedPatterns);
          // Show support resources
          router.replace('/support-resources');
          return;
        }
      }
      
      // If not flagged or couldn't be screened, go back
      router.back();
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Could not save message. Please try again.');
    } finally {
      setIsSaving(false);
      setIsTranscribing(false);
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
        <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={isSaving || isTranscribing}>
          {isSaving || isTranscribing ? (
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
              This is a safe space to express your thoughts and feelings. Your messages are automatically screened for mental health concerns.
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
                      Recording saved ({formatDuration(recordingDuration)})
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

                <View style={[styles.infoBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <IconSymbol
                    ios_icon_name="info.circle.fill"
                    android_material_icon_name="info"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                    {getTranscriptionMessage()}
                  </Text>
                </View>
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    maxWidth: '100%',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
