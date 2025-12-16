
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { IconSymbol } from './IconSymbol';
import { BillingConfig } from '@/constants/BillingConfig';

interface AdBannerProps {
  screenName?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ screenName }) => {
  const { theme } = useAppTheme();
  const { shouldShowAds } = useSubscription();
  const [adError, setAdError] = useState(false);

  // Don't render if ads shouldn't be shown
  if (!shouldShowAds(screenName)) {
    return null;
  }

  // Get the appropriate ad unit ID for the platform
  const adUnitId = Platform.select({
    ios: BillingConfig.adUnits.banner.ios,
    android: BillingConfig.adUnits.banner.android,
    default: TestIds.BANNER,
  });

  const handleAdError = (error: any) => {
    console.error('Ad failed to load:', error);
    setAdError(true);
  };

  const handleAdLoaded = () => {
    console.log('Ad loaded successfully');
    setAdError(false);
  };

  // If ad failed to load, show fallback promo
  if (adError) {
    return (
      <View style={[styles.fallbackContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
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
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={handleAdError}
        onAdLoaded={handleAdLoaded}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  fallbackContainer: {
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
