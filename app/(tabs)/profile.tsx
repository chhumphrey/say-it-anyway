
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppTheme } from '@/contexts/ThemeContext';
import { StorageService } from '@/utils/storage';
import { UserProfile } from '@/types';

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    const data = await StorageService.getUserProfile();
    setProfile(data);
  };

  if (!profile) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Profile
        </Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push('/edit-profile')}
        >
          <IconSymbol
            ios_icon_name="pencil.circle.fill"
            android_material_icon_name="edit"
            size={28}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar
        ]}
      >
        <View style={[styles.profileHeader, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {profile.photoUri ? (
            <Image source={{ uri: profile.photoUri }} style={styles.photo} />
          ) : (
            <View style={[styles.photoPlaceholder, { backgroundColor: theme.colors.secondary }]}>
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="person"
                size={50}
                color={theme.colors.primary}
              />
            </View>
          )}
          <Text style={[styles.name, { color: theme.colors.text }]}>{profile.name}</Text>
          {profile.preferredPronouns && (
            <Text style={[styles.pronouns, { color: theme.colors.textSecondary }]}>
              ({profile.preferredPronouns})
            </Text>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {profile.email && (
            <View style={styles.infoRow}>
              <IconSymbol
                ios_icon_name="envelope.fill"
                android_material_icon_name="email"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>{profile.email}</Text>
            </View>
          )}
          {profile.phone && (
            <View style={styles.infoRow}>
              <IconSymbol
                ios_icon_name="phone.fill"
                android_material_icon_name="phone"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>{profile.phone}</Text>
            </View>
          )}
          {profile.location && (
            <View style={styles.infoRow}>
              <IconSymbol
                ios_icon_name="location.fill"
                android_material_icon_name="location-on"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>{profile.location}</Text>
            </View>
          )}
          {!profile.email && !profile.phone && !profile.location && (
            <View style={styles.emptyInfo}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Tap the edit button to add your information
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.infoBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <IconSymbol
            ios_icon_name="lock.fill"
            android_material_icon_name="lock"
            size={24}
            color={theme.colors.primary}
          />
          <Text style={[styles.infoBoxText, { color: theme.colors.textSecondary }]}>
            Your profile information is stored securely on your device and is never shared.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
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
  editButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    marginBottom: 16,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
  },
  pronouns: {
    fontSize: 16,
    marginTop: 4,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    flex: 1,
  },
  emptyInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'flex-start',
  },
  infoBoxText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
