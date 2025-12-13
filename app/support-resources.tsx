
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/IconSymbol';

export default function SupportResourcesScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();

  const resources = [
    {
      name: '988 Suicide & Crisis Lifeline',
      description: 'Free, confidential support 24/7',
      phone: '988',
      website: 'https://988lifeline.org',
    },
    {
      name: 'Crisis Text Line',
      description: 'Text HOME to 741741',
      phone: '741741',
      isSMS: true,
      website: 'https://www.crisistextline.org',
    },
    {
      name: 'SAMHSA National Helpline',
      description: 'Treatment referral and information',
      phone: '1-800-662-4357',
      website: 'https://www.samhsa.gov/find-help/national-helpline',
    },
    {
      name: 'Veterans Crisis Line',
      description: 'Support for veterans and their families',
      phone: '988',
      pressOne: true,
      website: 'https://www.veteranscrisisline.net',
    },
  ];

  const handleCall = (phone: string, isSMS: boolean = false) => {
    const url = isSMS ? `sms:${phone}` : `tel:${phone}`;
    Linking.openURL(url);
  };

  const handleWebsite = (url: string) => {
    Linking.openURL(url);
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
          Support Resources
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.messageBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.primary }]}>
          <IconSymbol
            ios_icon_name="heart.fill"
            android_material_icon_name="favorite"
            size={32}
            color={theme.colors.primary}
          />
          <Text style={[styles.messageTitle, { color: theme.colors.text }]}>
            You&apos;re not alone
          </Text>
          <Text style={[styles.messageText, { color: theme.colors.textSecondary }]}>
            If you&apos;re experiencing thoughts of self-harm or suicide, please reach out. 
            These resources are here to help, and speaking with someone can make a difference.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Crisis Support
        </Text>

        {resources.map((resource, index) => (
          <View
            key={index}
            style={[styles.resourceCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <Text style={[styles.resourceName, { color: theme.colors.text }]}>
              {resource.name}
            </Text>
            <Text style={[styles.resourceDescription, { color: theme.colors.textSecondary }]}>
              {resource.description}
            </Text>
            {resource.pressOne && (
              <Text style={[styles.resourceNote, { color: theme.colors.textSecondary }]}>
                Press 1 after calling 988
              </Text>
            )}

            <View style={styles.resourceButtons}>
              <TouchableOpacity
                style={[styles.resourceButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleCall(resource.phone, resource.isSMS)}
              >
                <IconSymbol
                  ios_icon_name={resource.isSMS ? 'message.fill' : 'phone.fill'}
                  android_material_icon_name={resource.isSMS ? 'message' : 'phone'}
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.resourceButtonText}>
                  {resource.isSMS ? 'Text' : 'Call'} {resource.phone}
                </Text>
              </TouchableOpacity>

              {resource.website && (
                <TouchableOpacity
                  style={[styles.resourceButton, { backgroundColor: theme.colors.accent }]}
                  onPress={() => handleWebsite(resource.website!)}
                >
                  <IconSymbol
                    ios_icon_name="globe"
                    android_material_icon_name="language"
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.resourceButtonText}>Website</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        <View style={[styles.infoBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
            Emergency Services
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            If you or someone else is in immediate danger, please call 911 or go to your nearest emergency room.
          </Text>
        </View>
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
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  messageBox: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  messageTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  resourceCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  resourceName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  resourceDescription: {
    fontSize: 15,
    marginBottom: 4,
  },
  resourceNote: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  resourceButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  resourceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resourceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
