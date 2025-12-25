
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
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

  useEffect(() => {
    loadRecipients();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadRecipients();
    }, [])
  );

  const loadRecipients = async () => {
    const data = await StorageService.getRecipients();
    const sorted = data.sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0);
    });
    setRecipients(sorted);
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

  console.log('Home screen background:', { scene: backgroundSettings.scene, uri: backgroundUri });

  return (
    <ImageBackground
      source={{ uri: backgroundUri }}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.15 }}
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
                !!!
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
          {recipients.length === 0 ? (
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
              {recipients.map((recipient, index) => (
                <TouchableOpacity
                  key={recipient.id || `recipient-${index}`}
                  style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                  onPress={() => router.push(`/recipient/${recipient.id}`)}
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
              ))}
            </View>
          )}
        </ScrollView>

        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
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
    fontSize: 28,
    fontWeight: '900',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
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
  settingsButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
});
