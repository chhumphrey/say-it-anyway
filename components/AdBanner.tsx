
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { IconSymbol } from './IconSymbol';

interface AdBannerProps {
  screenName?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ screenName }) => {
  const { theme } = useAppTheme();
  const { shouldShowAds } = useSubscription();

  // Don't render if ads shouldn't be shown
  if (!shouldShowAds(screenName)) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <IconSymbol
        ios_icon_name="megaphone.fill"
        android_material_icon_name="campaign"
        size={20}
        color={theme.colors.textSecondary}
      />
      <View style={styles.textContainer}>
        <Text style={[styles.adLabel, { color: theme.colors.textSecondary }]}>
          Advertisement
        </Text>
        <Text style={[styles.adText, { color: theme.colors.text }]}>
          Upgrade to remove ads and get 60 minutes of Recording Time per month
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 12,
  },
  textContainer: {
    flex: 1,
  },
  adLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  adText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
