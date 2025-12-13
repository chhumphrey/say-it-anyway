
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

  const handleCall = (number: string) => {
    const url = `tel:${number}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          console.log('Cannot open phone dialer');
        }
      })
      .catch((err) => console.error('Error opening phone dialer:', err));
  };

  const handleText = (number: string) => {
    const url = `sms:${number}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          console.log('Cannot open SMS');
        }
      })
      .catch((err) => console.error('Error opening SMS:', err));
  };

  const handleWebsite = (url: string) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          console.log('Cannot open URL');
        }
      })
      .catch((err) => console.error('Error opening URL:', err));
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
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.messageBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <IconSymbol
            ios_icon_name="heart.circle.fill"
            android_material_icon_name="favorite"
            size={48}
            color={theme.colors.primary}
          />
          <Text style={[styles.messageTitle, { color: theme.colors.text }]}>
            You&apos;re Not Alone
          </Text>
          <Text style={[styles.messageText, { color: theme.colors.textSecondary }]}>
            We noticed your message may indicate you&apos;re going through a difficult time. 
            Please know that support is available 24/7, and reaching out is a sign of strength.
          </Text>
        </View>

        <View style={styles.resourcesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Immediate Support
          </Text>

          <View style={[styles.resourceCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.resourceHeader}>
              <IconSymbol
                ios_icon_name="phone.circle.fill"
                android_material_icon_name="phone"
                size={32}
                color={theme.colors.primary}
              />
              <View style={styles.resourceInfo}>
                <Text style={[styles.resourceName, { color: theme.colors.text }]}>
                  988 Suicide & Crisis Lifeline
                </Text>
                <Text style={[styles.resourceDescription, { color: theme.colors.textSecondary }]}>
                  24/7 free and confidential support
                </Text>
              </View>
            </View>
            <View style={styles.resourceActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.callButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleCall('988')}
              >
                <IconSymbol
                  ios_icon_name="phone.fill"
                  android_material_icon_name="phone"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.actionButtonText}>Call 988</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.websiteButton, { borderColor: theme.colors.primary }]}
                onPress={() => handleWebsite('https://988lifeline.org')}
              >
                <IconSymbol
                  ios_icon_name="globe"
                  android_material_icon_name="language"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text style={[styles.websiteButtonText, { color: theme.colors.primary }]}>
                  Website
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.resourceCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.resourceHeader}>
              <IconSymbol
                ios_icon_name="message.circle.fill"
                android_material_icon_name="message"
                size={32}
                color={theme.colors.accent}
              />
              <View style={styles.resourceInfo}>
                <Text style={[styles.resourceName, { color: theme.colors.text }]}>
                  Crisis Text Line
                </Text>
                <Text style={[styles.resourceDescription, { color: theme.colors.textSecondary }]}>
                  Text support available 24/7
                </Text>
              </View>
            </View>
            <View style={styles.resourceActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.callButton, { backgroundColor: theme.colors.accent }]}
                onPress={() => handleText('741741')}
              >
                <IconSymbol
                  ios_icon_name="message.fill"
                  android_material_icon_name="message"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.actionButtonText}>Text HOME to 741741</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.resourceCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.resourceHeader}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="warning"
                size={32}
                color={theme.colors.danger}
              />
              <View style={styles.resourceInfo}>
                <Text style={[styles.resourceName, { color: theme.colors.text }]}>
                  Emergency Services
                </Text>
                <Text style={[styles.resourceDescription, { color: theme.colors.textSecondary }]}>
                  If you&apos;re in immediate danger
                </Text>
              </View>
            </View>
            <View style={styles.resourceActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.callButton, { backgroundColor: theme.colors.danger }]}
                onPress={() => handleCall('911')}
              >
                <IconSymbol
                  ios_icon_name="phone.fill"
                  android_material_icon_name="phone"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.actionButtonText}>Call 911</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.additionalSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Additional Resources
          </Text>

          <TouchableOpacity
            style={[styles.linkCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => handleWebsite('https://www.samhsa.gov/find-help/national-helpline')}
          >
            <View style={styles.linkContent}>
              <Text style={[styles.linkTitle, { color: theme.colors.text }]}>
                SAMHSA National Helpline
              </Text>
              <Text style={[styles.linkDescription, { color: theme.colors.textSecondary }]}>
                1-800-662-4357 • Treatment referral and information
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => handleWebsite('https://www.nami.org/help')}
          >
            <View style={styles.linkContent}>
              <Text style={[styles.linkTitle, { color: theme.colors.text }]}>
                NAMI HelpLine
              </Text>
              <Text style={[styles.linkDescription, { color: theme.colors.textSecondary }]}>
                1-800-950-6264 • Mental health support and resources
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => handleWebsite('https://www.veteranscrisisline.net')}
          >
            <View style={styles.linkContent}>
              <Text style={[styles.linkTitle, { color: theme.colors.text }]}>
                Veterans Crisis Line
              </Text>
              <Text style={[styles.linkDescription, { color: theme.colors.textSecondary }]}>
                1-800-273-8255 (Press 1) • Support for veterans
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.footerBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Remember: Grief is a natural response to loss, and there&apos;s no &quot;right&quot; way to grieve. 
            These feelings are valid, and professional support can help you navigate this difficult time.
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
  placeholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  messageBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  messageTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  resourcesSection: {
    marginBottom: 24,
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
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resourceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resourceName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
  },
  resourceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  callButton: {
    // backgroundColor set dynamically
  },
  websiteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  websiteButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  additionalSection: {
    marginBottom: 24,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  linkDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  footerBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
