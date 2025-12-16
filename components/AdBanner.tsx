
import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { IconSymbol } from './IconSymbol';
import { BillingConfig } from '@/constants/BillingConfig';

// Conditionally import react-native-google-mobile-ads only on native platforms
let BannerAd: any;
let BannerAdSize: any;
let TestIds: any;

if (Platform.OS !== 'web') {
  try {
    const GoogleMobileAds = require('react-native-google-mobile-ads');
    BannerAd = GoogleMobileAds.BannerAd;
    BannerAdSize = GoogleMobileAds.BannerAdSize;
    TestIds = GoogleMobileAds.TestIds;
  } catch (error) {
    console.error('Failed to load react-native-google-mobile-ads:', error);
  }
}

interface AdBannerProps {
  screenName?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ screenName }) => {
  const { theme } = useAppTheme();
  const { shouldShowAds } = useSubscription();
  const [adError, setAdError] = useState(false);

  console.log('AdBanner render:', { screenName, shouldShow: shouldShowAds(screenName) });

  // Don't render if ads shouldn't be shown
  if (!shouldShowAds(screenName)) {
    console.log('AdBanner: Not showing ads for screen:', screenName);
    return null;
  }

  // On web, show fallback promo
  if (Platform.OS === 'web') {
    console.log('AdBanner: Showing web fallback');
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

  // If BannerAd is not available (failed to load), show fallback
  if (!BannerAd) {
    console.log('AdBanner: BannerAd not available, showing fallback');
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

  // Get the appropriate ad unit ID for the platform
  const adUnitId = Platform.select({
    ios: BillingConfig.adUnits.banner.ios,
    android: BillingConfig.adUnits.banner.android,
    default: TestIds?.BANNER || 'ca-app-pub-3940256099942544/6300978111',
  });

  console.log('AdBanner: Rendering native ad with unit ID:', adUnitId);

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
    console.log('AdBanner: Ad error, showing fallback');
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
    marginHorizontal: 20,
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
