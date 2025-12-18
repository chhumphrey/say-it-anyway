
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Recipient, Gender } from '@/types';
import { StorageService } from '@/utils/storage';
import { useAppTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/IconSymbol';

export default function EditRecipientScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useAppTheme();
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<Gender | undefined>();
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState('');
  const [notes, setNotes] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const genderOptions: Gender[] = ['Male', 'Female', 'Non-Binary', 'Decline to State'];

  const loadRecipient = useCallback(async () => {
    const recipients = await StorageService.getRecipients();
    const recipient = recipients.find(r => r.id === id);
    
    if (recipient) {
      setName(recipient.name);
      setNickname(recipient.nickname || '');
      setGender(recipient.gender);
      setPhotoUri(recipient.photoUri);
      setDateOfBirth(recipient.dateOfBirth || '');
      setDateOfDeath(recipient.dateOfDeath || '');
      setNotes(recipient.notes || '');
      setIsDefault(recipient.isDefault || false);
    }
  }, [id]);

  useEffect(() => {
    loadRecipient();
  }, [loadRecipient]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photos to add a picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a name for this person.');
      return;
    }

    const updates: Partial<Recipient> = {
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      gender,
      photoUri,
      dateOfBirth: dateOfBirth.trim() || undefined,
      dateOfDeath: dateOfDeath.trim() || undefined,
      notes: notes.trim() || undefined,
      isDefault,
    };

    if (isDefault) {
      const recipients = await StorageService.getRecipients();
      recipients.forEach(r => {
        if (r.id !== id) {
          r.isDefault = false;
        }
      });
      await StorageService.saveRecipients(recipients);
    }

    await StorageService.updateRecipient(id as string, updates);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Recipient',
      'Are you sure you want to delete this recipient? This will also delete all their messages.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const recipients = await StorageService.getRecipients();
            const filtered = recipients.filter(r => r.id !== id);
            await StorageService.saveRecipients(filtered);
            
            // Also delete all messages for this recipient
            const allMessages = await StorageService.getMessages();
            const filteredMessages = allMessages.filter(m => m.recipientId !== id);
            await StorageService.saveMessage(filteredMessages[0]); // This will overwrite
            
            router.replace('/(tabs)/(home)');
          },
        },
      ]
    );
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
          Edit Recipient
        </Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={[styles.saveText, { color: theme.colors.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={pickImage} style={styles.photoSection}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={[styles.photoPlaceholder, { backgroundColor: theme.colors.secondary }]}>
              <IconSymbol
                ios_icon_name="camera.fill"
                android_material_icon_name="add-a-photo"
                size={40}
                color={theme.colors.primary}
              />
              <Text style={[styles.photoText, { color: theme.colors.primary }]}>
                Add Photo
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Nickname</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={nickname}
            onChangeText={setNickname}
            placeholder="Optional"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Gender</Text>
          <View style={styles.genderButtons}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.genderButton,
                  { borderColor: theme.colors.border },
                  gender === option && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                ]}
                onPress={() => setGender(option)}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    { color: theme.colors.text },
                    gender === option && { color: '#FFFFFF' },
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Date of Birth</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="MM/DD/YYYY"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Date of Death</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={dateOfDeath}
            onChangeText={setDateOfDeath}
            placeholder="MM/DD/YYYY"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Notes</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special memories or notes..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={styles.defaultSection}
          onPress={() => setIsDefault(!isDefault)}
        >
          <View style={[styles.checkbox, { borderColor: theme.colors.border }, isDefault && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}>
            {isDefault && (
              <IconSymbol
                ios_icon_name="checkmark"
                android_material_icon_name="check"
                size={18}
                color="#FFFFFF"
              />
            )}
          </View>
          <Text style={[styles.defaultText, { color: theme.colors.text }]}>
            Set as default recipient
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.colors.danger }]}
          onPress={handleDelete}
        >
          <IconSymbol
            ios_icon_name="trash.fill"
            android_material_icon_name="delete"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.deleteButtonText}>Delete Recipient</Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
  },
  genderButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  defaultSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultText: {
    fontSize: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
