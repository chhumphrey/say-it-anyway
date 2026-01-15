
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Recipient } from '@/types';
import { StorageService } from '@/utils/storage';
import { useAppTheme } from '@/contexts/ThemeContext';
import { getSceneImageUrl } from '@/utils/themes';
import { IconSymbol } from '@/components/IconSymbol';

export default function HomeScreen() {
  const router = useRouter();
  const { theme, backgroundSettings } = useAppTheme();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    console.log('HomeScreen (iOS): Initial mount, loading recipients');
    loadRecipients();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log('HomeScreen (iOS): Screen focused, reloading recipients');
      loadRecipients();
    }, [])
  );

  const loadRecipients = async () => {
    try {
      setIsLoading(true);
      console.log('HomeScreen (iOS): Loading recipients from storage...');
      const data = await StorageService.getRecipients();
      console.log('HomeScreen (iOS): Loaded', data.length, 'recipients');
      data.forEach(r => console.log('  - Recipient:', r.id, r.name));
      
      const sorted = data.sort((a, b) => {
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        return (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0);
      });
      
      console.log('HomeScreen (iOS): Setting recipients state with', sorted.length, 'recipients');
      setRecipients(sorted);
    } catch (error) {
      console.error('HomeScreen (iOS): Error loading recipients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastMessage = (timestamp?: number) => {
    if (!timestamp) return 'No messages yet';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const backgroundUri = backgroundSettings.scene === 'Custom Photo' && backgroundSettings.customPhotoUri
    ? backgroundSettings.customPhotoUri
    : getSceneImageUrl(backgroundSettings.scene);

  const backgroundOpacity = backgroundSettings.transparency / 100;

  console.log('HomeScreen (iOS): Rendering with', recipients.length, 'recipients');

  return (
    <ImageBackground
      source={{ uri: backgroundUri }}
      style={styles.backgroundImage}
      imageStyle={{ opacity: backgroundOpacity }}
    >
      <View style={[styles.container, { backgroundColor: 'transparent' }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Say It Anyway
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push('/support-resources')}
            >
              <Text style={[styles.emergencyButton, { color: theme.colors.danger }]}>
                SOS
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push('/add-recipient')}
            >
              <IconSymbol
                ios_icon_name="plus.circle.fill"
                android_material_icon_name="add-circle"
                size={32}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingState}>
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                Loading...
              </Text>
            </View>
          ) : recipients.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol
                ios_icon_name="heart.fill"
                android_material_icon_name="favorite"
                size={64}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No recipients yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                Tap the + button to add someone special
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {recipients.map((recipient) => {
                console.log('HomeScreen (iOS): Rendering recipient card for:', recipient.id, recipient.name);
                return (
                  <TouchableOpacity
                    key={recipient.id}
                    style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                    onPress={() => {
                      console.log('HomeScreen (iOS): Navigating to recipient:', recipient.id);
                      router.push(`/recipient/${recipient.id}`);
                    }}
                  >
                    <View style={styles.cardContent}>
                      {recipient.photoUri ? (
                        <Image source={{ uri: recipient.photoUri }} style={styles.photo} />
                      ) : (
                        <View style={[styles.photoPlaceholder, { backgroundColor: theme.colors.secondary }]}>
                          <IconSymbol
                            ios_icon_name="person.fill"
                            android_material_icon_name="person"
                            size={40}
                            color={theme.colors.primary}
                          />
                        </View>
                      )}
                      
                      <View style={styles.cardInfo}>
                        <View style={styles.nameRow}>
                          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
                            {recipient.name}
                          </Text>
                          {recipient.isDefault && (
                            <IconSymbol
                              ios_icon_name="star.fill"
                              android_material_icon_name="star"
                              size={16}
                              color={theme.colors.accent}
                            />
                          )}
                        </View>
                        
                        {recipient.nickname && (
                          <Text style={[styles.nickname, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                            &quot;{recipient.nickname}&quot;
                          </Text>
                        )}
                        
                        <Text style={[styles.lastMessage, { color: theme.colors.textSecondary }]}>
                          {formatLastMessage(recipient.lastMessageTimestamp)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        <View style={styles.floatingButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => setShowHelpModal(true)}
          >
            <IconSymbol
              ios_icon_name="questionmark.circle.fill"
              android_material_icon_name="help"
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => router.push('/settings')}
          >
            <IconSymbol
              ios_icon_name="gearshape.fill"
              android_material_icon_name="settings"
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>

        <Modal
          visible={showHelpModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowHelpModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  How to Use Say It Anyway
                </Text>
                <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                  <IconSymbol
                    ios_icon_name="xmark.circle.fill"
                    android_material_icon_name="close"
                    size={28}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.helpScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.helpSection}>
                  <View style={styles.helpIconContainer}>
                    <IconSymbol
                      ios_icon_name="person.badge.plus.fill"
                      android_material_icon_name="person-add"
                      size={32}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={[styles.helpTitle, { color: theme.colors.text }]}>
                    Adding Recipients
                  </Text>
                  <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
                    Tap the + button in the top right to add a loved one. You can include their name, nickname, photo, dates, and notes. Mark one recipient as default to make them appear first.
                  </Text>
                </View>

                <View style={styles.helpSection}>
                  <View style={styles.helpIconContainer}>
                    <IconSymbol
                      ios_icon_name="message.fill"
                      android_material_icon_name="message"
                      size={32}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={[styles.helpTitle, { color: theme.colors.text }]}>
                    Writing Messages
                  </Text>
                  <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
                    Tap on a recipient to view their messages. Use the &quot;Write Message&quot; button to compose a text message or record an audio message. All messages are stored privately on your device.
                  </Text>
                </View>

                <View style={styles.helpSection}>
                  <View style={styles.helpIconContainer}>
                    <IconSymbol
                      ios_icon_name="mic.fill"
                      android_material_icon_name="mic"
                      size={32}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={[styles.helpTitle, { color: theme.colors.text }]}>
                    Audio Messages
                  </Text>
                  <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
                    Record voice messages to express yourself naturally. Audio is automatically transcribed to text and stored locally. You can play back recordings anytime.
                  </Text>
                </View>

                <View style={styles.helpSection}>
                  <View style={styles.helpIconContainer}>
                    <IconSymbol
                      ios_icon_name="eye.slash.fill"
                      android_material_icon_name="visibility-off"
                      size={32}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={[styles.helpTitle, { color: theme.colors.text }]}>
                    Hiding Messages
                  </Text>
                  <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
                    Long-press any message to hide it from view without deleting it. Hidden messages can be revealed again from the message options.
                  </Text>
                </View>

                <View style={styles.helpSection}>
                  <View style={styles.helpIconContainer}>
                    <IconSymbol
                      ios_icon_name="paintbrush.fill"
                      android_material_icon_name="palette"
                      size={32}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={[styles.helpTitle, { color: theme.colors.text }]}>
                    Customizing Themes
                  </Text>
                  <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
                    Tap the settings icon to choose from calming color themes and background scenes. Adjust transparency and create custom color schemes that feel right for you.
                  </Text>
                </View>

                <View style={styles.helpSection}>
                  <View style={styles.helpIconContainer}>
                    <Text style={[styles.sosIcon, { color: theme.colors.danger }]}>SOS</Text>
                  </View>
                  <Text style={[styles.helpTitle, { color: theme.colors.text }]}>
                    Support Resources
                  </Text>
                  <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
                    The SOS button in the top right provides immediate access to mental health support resources, including the 988 Suicide &amp; Crisis Lifeline and Crisis Text Line. Help is always available.
                  </Text>
                </View>

                <View style={[styles.privacyNote, { backgroundColor: theme.colors.secondary, borderColor: theme.colors.border }]}>
                  <IconSymbol
                    ios_icon_name="lock.fill"
                    android_material_icon_name="lock"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text style={[styles.privacyText, { color: theme.colors.text }]}>
                    All your data is stored privately on your device. Nothing is sent to the cloud or shared with anyone.
                  </Text>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowHelpModal(false)}
              >
                <Text style={styles.closeButtonText}>Got It</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  emergencyButton: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  grid: {
    gap: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  photoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  nickname: {
    fontSize: 14,
    marginTop: 2,
  },
  lastMessage: {
    fontSize: 13,
    marginTop: 4,
  },
  floatingButtons: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    gap: 12,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
  },
  helpScroll: {
    maxHeight: '75%',
  },
  helpSection: {
    marginBottom: 24,
  },
  helpIconContainer: {
    marginBottom: 8,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 15,
    lineHeight: 22,
  },
  sosIcon: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 16,
  },
  privacyText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
