
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
import { supportResourcesData } from '@/utils/supportResources';

export default function SupportResourcesScreen() {
  const router = useRouter();
  const { theme, supportRegion } = useAppTheme();

  const regionalData = supportResourcesData[supportRegion];

  const handleCall = (number: string) => {
    console.log('User tapped call button for:', number);
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
    console.log('User tapped text button for:', number);
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
    console.log('User tapped website link:', url);
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

  const getIconForType = (iconType: 'phone' | 'message' | 'warning') => {
    switch (iconType) {
      case 'phone':
        return { ios: 'phone.circle.fill', android: 'phone' };
      case 'message':
        return { ios: 'message.circle.fill', android: 'message' };
      case 'warning':
        return { ios: 'exclamationmark.triangle.fill', android: 'warning' };
    }
  };

  const getColorForType = (type: 'crisis' | 'emergency' | 'support') => {
    switch (type) {
      case 'crisis':
        return theme.colors.primary;
      case 'emergency':
        return theme.colors.danger;
      case 'support':
        return theme.colors.accent;
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
          Support Resources
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.regionBadge, { backgroundColor: theme.colors.secondary, borderColor: theme.colors.border }]}>
          <IconSymbol
            ios_icon_name="globe"
            android_material_icon_name="language"
            size={16}
            color={theme.colors.primary}
          />
          <Text style={[styles.regionBadgeText, { color: theme.colors.text }]}>
            {supportRegion}
          </Text>
        </View>

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
            {regionalData.message}
          </Text>
        </View>

        <View style={styles.resourcesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Immediate Support
          </Text>

          {regionalData.resources.map((resource, index) => {
            const icons = getIconForType(resource.icon);
            const color = getColorForType(resource.type);
            
            return (
              <View
                key={index}
                style={[styles.resourceCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              >
                <View style={styles.resourceHeader}>
                  <IconSymbol
                    ios_icon_name={icons.ios}
                    android_material_icon_name={icons.android}
                    size={32}
                    color={color}
                  />
                  <View style={styles.resourceInfo}>
                    <Text style={[styles.resourceName, { color: theme.colors.text }]}>
                      {resource.name}
                    </Text>
                    <Text style={[styles.resourceDescription, { color: theme.colors.textSecondary }]}>
                      {resource.description}
                    </Text>
                  </View>
                </View>
                <View style={styles.resourceActions}>
                  {resource.phone && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.callButton, { backgroundColor: color }]}
                      onPress={() => handleCall(resource.phone!)}
                    >
                      <IconSymbol
                        ios_icon_name="phone.fill"
                        android_material_icon_name="phone"
                        size={18}
                        color="#FFFFFF"
                      />
                      <Text style={styles.actionButtonText}>
                        Call {resource.phone}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {resource.sms && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.callButton, { backgroundColor: color }]}
                      onPress={() => handleText(resource.sms!)}
                    >
                      <IconSymbol
                        ios_icon_name="message.fill"
                        android_material_icon_name="message"
                        size={18}
                        color="#FFFFFF"
                      />
                      <Text style={styles.actionButtonText}>
                        Text {resource.sms}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {resource.website && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.websiteButton, { borderColor: color }]}
                      onPress={() => handleWebsite(resource.website!)}
                    >
                      <IconSymbol
                        ios_icon_name="globe"
                        android_material_icon_name="language"
                        size={18}
                        color={color}
                      />
                      <Text style={[styles.websiteButtonText, { color: color }]}>
                        Website
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.additionalSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Additional Resources
          </Text>

          {regionalData.additionalResources.map((resource, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.linkCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              onPress={() => handleWebsite(resource.url)}
            >
              <View style={styles.linkContent}>
                <Text style={[styles.linkTitle, { color: theme.colors.text }]}>
                  {resource.title}
                </Text>
                <Text style={[styles.linkDescription, { color: theme.colors.textSecondary }]}>
                  {resource.description}
                </Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.footerBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Remember: Grief is a natural response to loss, and there&apos;s no &quot;right&quot; way to grieve. 
            These feelings are valid, and professional support can help you navigate this difficult time.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.changeRegionButton, { backgroundColor: theme.colors.secondary, borderColor: theme.colors.border }]}
          onPress={() => router.push('/settings')}
        >
          <IconSymbol
            ios_icon_name="globe"
            android_material_icon_name="language"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={[styles.changeRegionText, { color: theme.colors.text }]}>
            Change Region in Settings
          </Text>
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
  regionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  regionBadgeText: {
    fontSize: 14,
    fontWeight: '600',
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
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 120,
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
    marginBottom: 16,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  changeRegionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  changeRegionText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
