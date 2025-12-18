
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/IconSymbol';
import { ThemeName, themeNames, themes } from '@/utils/themes';
import { StorageService, validateAccessCode } from '@/utils/storage';
import { formatRecordingTime } from '@/utils/transcription';
import { SubscriptionTier, RecordingTime } from '@/types';
import { billingService } from '@/utils/billingService';
import { BillingConfig } from '@/constants/BillingConfig';
import { useSubscription } from '@/contexts/SubscriptionContext';

// Conditionally import Superwall hooks
let usePlacement: any = null;
let useUser: any = null;
let isSuperwallAvailable = false;

// Check if Superwall is available
if (Platform.OS !== 'web') {
  try {
    const superwallModule = require('expo-superwall');
    usePlacement = superwallModule.usePlacement;
    useUser = superwallModule.useUser;
    isSuperwallAvailable = true;
    console.log('Superwall hooks loaded in settings');
  } catch (error) {
    console.log('Superwall hooks not available in settings');
  }
}

// Wrapper component for Superwall hooks to ensure they're always called
function SuperwallHooksWrapper({ children }: { children: (hooks: any) => React.ReactNode }) {
  // Always call hooks unconditionally at the top level
  let superwallUser = null;
  let subscriptionPlacement = null;
  let extraTimePlacement = null;

  if (isSuperwallAvailable && useUser) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    superwallUser = useUser();
  }
  
  if (isSuperwallAvailable && usePlacement) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    subscriptionPlacement = usePlacement({
      onPresent: (info: any) => {
        console.log('Subscription paywall presented:', info);
      },
      onDismiss: async (info: any, result: any) => {
        console.log('Subscription paywall dismissed:', info, result);
        
        if (result.state === 'purchased') {
          await billingService.activateSubscription();
          
          Alert.alert(
            'Subscription Activated!',
            'Thank you for subscribing! You now have:\n\n• 60 minutes of Recording Time per month\n• No ads\n\nYour subscription will renew automatically each month.',
            [{ text: 'OK' }]
          );
        }
      },
      onError: (error: string) => {
        console.error('Subscription paywall error:', error);
        Alert.alert('Error', 'Could not show subscription options. Please try again.');
      },
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    extraTimePlacement = usePlacement({
      onPresent: (info: any) => {
        console.log('Extra time paywall presented:', info);
      },
      onDismiss: async (info: any, result: any) => {
        console.log('Extra time paywall dismissed:', info, result);
        
        if (result.state === 'purchased') {
          await billingService.addExtraRecordingTime();
          
          Alert.alert(
            'Extra Time Added!',
            'You now have an additional 60 minutes of Recording Time. This time rolls over and never expires!',
            [{ text: 'OK' }]
          );
        }
      },
      onError: (error: string) => {
        console.error('Extra time paywall error:', error);
        Alert.alert('Error', 'Could not show purchase options. Please try again.');
      },
    });
  }

  return <>{children({ superwallUser, subscriptionPlacement, extraTimePlacement })}</>;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, themeName, setTheme } = useAppTheme();
  const { isBillingAvailable, refreshSubscription } = useSubscription();
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('Free');
  const [recordingTime, setRecordingTime] = useState<RecordingTime | null>(null);
  const [accessCode, setAccessCode] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showAccessCodeInput, setShowAccessCodeInput] = useState(false);

  const loadSubscriptionData = useCallback(async () => {
    try {
      const status = await StorageService.getSubscriptionStatus();
      setSubscriptionTier(status.tier);

      const time = await StorageService.getRecordingTime();
      setRecordingTime(time);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    }
  }, []);

  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  const handleThemeSelect = (newTheme: ThemeName) => {
    setTheme(newTheme);
  };

  const handleSubscribe = async (subscriptionPlacement: any) => {
    if (!isBillingAvailable) {
      Alert.alert(
        'Development Mode',
        'In-app purchases are not available in Expo Go. Please build a development build to test purchases.\n\nFor now, you can use the Access Code feature below to test subscriber features.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!subscriptionPlacement) {
      Alert.alert('Error', 'Subscription system not initialized. Please try again.');
      return;
    }

    try {
      console.log('Triggering subscription placement...');
      await subscriptionPlacement.registerPlacement({
        placement: BillingConfig.placements.subscription,
        feature: async () => {
          // User already has access or successfully purchased
          console.log('User has subscription access');
          await billingService.activateSubscription();
          await loadSubscriptionData();
        },
      });
    } catch (error) {
      console.error('Error showing subscription:', error);
      Alert.alert('Error', 'Could not show subscription options. Please try again.');
    }
  };

  const handleBuyExtraTime = async (extraTimePlacement: any) => {
    if (!isBillingAvailable) {
      Alert.alert(
        'Development Mode',
        'In-app purchases are not available in Expo Go. Please build a development build to test purchases.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!extraTimePlacement) {
      Alert.alert('Error', 'Purchase system not initialized. Please try again.');
      return;
    }

    try {
      console.log('Triggering extra time placement...');
      await extraTimePlacement.registerPlacement({
        placement: BillingConfig.placements.extraTime,
        feature: async () => {
          // User successfully purchased
          console.log('User purchased extra time');
          await billingService.addExtraRecordingTime();
          await loadSubscriptionData();
        },
      });
    } catch (error) {
      console.error('Error showing extra time purchase:', error);
      Alert.alert('Error', 'Could not show purchase options. Please try again.');
    }
  };

  const handleRestorePurchases = async (superwallUser: any) => {
    if (!isBillingAvailable) {
      Alert.alert(
        'Development Mode',
        'Purchase restoration is not available in Expo Go. Please build a development build to test this feature.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!superwallUser) {
      Alert.alert('Error', 'Subscription system not initialized. Please try again.');
      return;
    }

    try {
      console.log('Refreshing subscription status from Superwall...');
      await superwallUser.refresh();
      await refreshSubscription();
      await loadSubscriptionData();
      
      Alert.alert(
        'Purchases Restored',
        'Your purchases have been restored successfully.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error restoring purchases:', error);
      Alert.alert('Error', 'Could not restore purchases. Please try again.');
    }
  };

  const handleUnlockSubscription = async () => {
    if (!accessCode.trim()) {
      Alert.alert('Access Code Required', 'Please enter an access code.');
      return;
    }

    setIsUnlocking(true);

    try {
      const isValid = validateAccessCode(accessCode);

      if (isValid) {
        await StorageService.unlockSubscription();
        setAccessCode('');
        setShowAccessCodeInput(false);
        await loadSubscriptionData();
        await refreshSubscription();
        
        Alert.alert(
          'Subscription Unlocked!',
          'You now have access to Subscriber features:\n\n• No ads\n• 60 minutes of Recording Time per month\n\nThank you for supporting Say It Anyway!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Invalid Access Code',
          'The access code you entered is not valid. Please check and try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error unlocking subscription:', error);
      Alert.alert('Error', 'Could not unlock subscription. Please try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleDeactivateUnlock = async () => {
    Alert.alert(
      'Deactivate Subscription',
      'Are you sure you want to return to the Free tier? You will lose access to Subscriber features.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deactivateSubscriptionUnlock();
              await loadSubscriptionData();
              await refreshSubscription();
              
              Alert.alert(
                'Subscription Deactivated',
                'You have returned to the Free tier.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error deactivating subscription:', error);
              Alert.alert('Error', 'Could not deactivate subscription. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getTotalRecordingTime = () => {
    if (!recordingTime) return 0;
    return recordingTime.freeMonthly + recordingTime.subscriberMonthly + recordingTime.purchasedExtra;
  };

  const getNextPoolInfo = () => {
    if (!recordingTime) return { poolName: 'None', available: 0 };

    if (recordingTime.freeMonthly > 0) {
      return { poolName: 'Free Monthly', available: recordingTime.freeMonthly };
    } else if (recordingTime.subscriberMonthly > 0) {
      return { poolName: 'Subscriber Monthly', available: recordingTime.subscriberMonthly };
    } else if (recordingTime.purchasedExtra > 0) {
      return { poolName: 'Purchased Extra', available: recordingTime.purchasedExtra };
    }

    return { poolName: 'None', available: 0 };
  };

  const nextPool = getNextPoolInfo();
  const totalTime = getTotalRecordingTime();
  const isLowOnTime = totalTime > 0 && totalTime <= 300;
  const isSubscriber = subscriptionTier !== 'Free';

  return (
    <SuperwallHooksWrapper>
      {({ superwallUser, subscriptionPlacement, extraTimePlacement }) => (
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
              Settings
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Expo Go Warning */}
            {!isBillingAvailable && (
              <View style={[styles.expoGoWarning, { backgroundColor: theme.colors.accent + '20', borderColor: theme.colors.accent }]}>
                <IconSymbol
                  ios_icon_name="exclamationmark.triangle.fill"
                  android_material_icon_name="warning"
                  size={24}
                  color={theme.colors.accent}
                />
                <View style={styles.expoGoWarningContent}>
                  <Text style={[styles.expoGoWarningTitle, { color: theme.colors.text }]}>
                    Running in {Platform.OS === 'web' ? 'Web Mode' : 'Expo Go'}
                  </Text>
                  <Text style={[styles.expoGoWarningText, { color: theme.colors.textSecondary }]}>
                    In-app purchases require a Development Build and won&apos;t work in {Platform.OS === 'web' ? 'web mode' : 'Expo Go'}. 
                    Use the Access Code feature below to test subscriber features, or build a development build to test real purchases.
                  </Text>
                </View>
              </View>
            )}

            {/* Subscription Status */}
            <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={styles.sectionHeader}>
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={24}
                  color={subscriptionTier === 'Free' ? theme.colors.textSecondary : theme.colors.accent}
                />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Subscription Status
                </Text>
              </View>
              
              <Text style={[styles.tierText, { color: theme.colors.primary }]}>
                Current Tier: {subscriptionTier}
              </Text>

              {subscriptionTier === 'Free' && (
                <>
                  <Text style={[styles.tierDescription, { color: theme.colors.textSecondary }]}>
                    • 5 minutes of Recording Time per month{'\n'}
                    • Ads shown on some screens
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.subscribeButton, 
                      { backgroundColor: isBillingAvailable ? theme.colors.primary : theme.colors.textSecondary }
                    ]}
                    onPress={() => handleSubscribe(subscriptionPlacement)}
                    disabled={!isBillingAvailable}
                  >
                    <IconSymbol
                      ios_icon_name="star.fill"
                      android_material_icon_name="star"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.subscribeButtonText}>
                      {isBillingAvailable 
                        ? `Subscribe for $${BillingConfig.products.subscription.price}/month`
                        : 'Purchases Not Available'
                      }
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {subscriptionTier !== 'Free' && (
                <Text style={[styles.tierDescription, { color: theme.colors.textSecondary }]}>
                  • 60 minutes of Recording Time per month{'\n'}
                  • No ads
                </Text>
              )}
            </View>

            {/* Recording Time */}
            <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={styles.sectionHeader}>
                <IconSymbol
                  ios_icon_name="clock.fill"
                  android_material_icon_name="schedule"
                  size={24}
                  color={isLowOnTime ? theme.colors.accent : theme.colors.primary}
                />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Recording Time
                </Text>
              </View>

              {recordingTime ? (
                <>
                  <View style={styles.timeRow}>
                    <Text style={[styles.timeLabel, { color: theme.colors.text }]}>
                      Total Available:
                    </Text>
                    <Text style={[styles.timeValue, { color: theme.colors.primary }]}>
                      {formatRecordingTime(totalTime)}
                    </Text>
                  </View>

                  {isLowOnTime && (
                    <View style={[styles.warningBox, { backgroundColor: theme.colors.background, borderColor: theme.colors.accent }]}>
                      <IconSymbol
                        ios_icon_name="exclamationmark.triangle.fill"
                        android_material_icon_name="warning"
                        size={18}
                        color={theme.colors.accent}
                      />
                      <Text style={[styles.warningText, { color: theme.colors.text }]}>
                        You&apos;re running low on Recording Time. Consider upgrading to Subscriber for more time.
                      </Text>
                    </View>
                  )}

                  <View style={styles.poolsContainer}>
                    <Text style={[styles.poolsTitle, { color: theme.colors.textSecondary }]}>
                      Available Pools:
                    </Text>

                    <View style={styles.poolRow}>
                      <Text style={[styles.poolLabel, { color: theme.colors.text }]}>
                        Free Monthly:
                      </Text>
                      <Text style={[styles.poolValue, { color: theme.colors.textSecondary }]}>
                        {formatRecordingTime(recordingTime.freeMonthly)}
                      </Text>
                    </View>

                    {subscriptionTier !== 'Free' && (
                      <View style={styles.poolRow}>
                        <Text style={[styles.poolLabel, { color: theme.colors.text }]}>
                          Subscriber Monthly:
                        </Text>
                        <Text style={[styles.poolValue, { color: theme.colors.textSecondary }]}>
                          {formatRecordingTime(recordingTime.subscriberMonthly)}
                        </Text>
                      </View>
                    )}

                    {recordingTime.purchasedExtra > 0 && (
                      <View style={styles.poolRow}>
                        <Text style={[styles.poolLabel, { color: theme.colors.text }]}>
                          Purchased Extra:
                        </Text>
                        <Text style={[styles.poolValue, { color: theme.colors.textSecondary }]}>
                          {formatRecordingTime(recordingTime.purchasedExtra)}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={[styles.infoBox, { backgroundColor: theme.colors.background }]}>
                    <IconSymbol
                      ios_icon_name="info.circle"
                      android_material_icon_name="info"
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                      Next pool to be used: {nextPool.poolName}
                      {nextPool.available > 0 && ` (${formatRecordingTime(nextPool.available)})`}
                    </Text>
                  </View>

                  <Text style={[styles.resetInfo, { color: theme.colors.textSecondary }]}>
                    Monthly pools reset on the 1st of each month. Purchased extra time rolls over.
                  </Text>

                  {/* Buy Extra Time Button - Only for Subscribers */}
                  {isSubscriber && (
                    <TouchableOpacity
                      style={[
                        styles.extraTimeButton, 
                        { backgroundColor: isBillingAvailable ? theme.colors.accent : theme.colors.textSecondary }
                      ]}
                      onPress={() => handleBuyExtraTime(extraTimePlacement)}
                      disabled={!isBillingAvailable}
                    >
                      <IconSymbol
                        ios_icon_name="plus.circle.fill"
                        android_material_icon_name="add-circle"
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.extraTimeButtonText}>
                        {isBillingAvailable
                          ? `Buy Extra Time ($${BillingConfig.products.extraTime.price})`
                          : 'Not Available'
                        }
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              )}
            </View>

            {/* Restore Purchases */}
            {isBillingAvailable && (
              <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={styles.sectionHeader}>
                  <IconSymbol
                    ios_icon_name="arrow.clockwise.circle.fill"
                    android_material_icon_name="restore"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Restore Purchases
                  </Text>
                </View>

                <Text style={[styles.restoreDescription, { color: theme.colors.textSecondary }]}>
                  If you previously purchased a subscription or extra time on this device or another device, tap below to restore your purchases.
                </Text>

                <TouchableOpacity
                  style={[styles.restoreButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.primary }]}
                  onPress={() => handleRestorePurchases(superwallUser)}
                >
                  <Text style={[styles.restoreButtonText, { color: theme.colors.primary }]}>
                    Restore Purchases
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Developer/Test Access Code */}
            <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={styles.sectionHeader}>
                <IconSymbol
                  ios_icon_name="lock.open.fill"
                  android_material_icon_name="lock-open"
                  size={24}
                  color={theme.colors.textSecondary}
                />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {isBillingAvailable ? 'Developer/Test Access Code' : 'Access Code (Testing)'}
                </Text>
              </View>

              <View style={[styles.devBadge, { backgroundColor: theme.colors.background, borderColor: theme.colors.textSecondary }]}>
                <Text style={[styles.devBadgeText, { color: theme.colors.textSecondary }]}>
                  {isBillingAvailable ? 'FOR TESTING ONLY' : 'USE THIS TO TEST FEATURES'}
                </Text>
              </View>

              {subscriptionTier === 'Subscriber (Unlocked)' ? (
                <>
                  <Text style={[styles.unlockDescription, { color: theme.colors.textSecondary }]}>
                    Your subscription is currently unlocked via access code. You have access to all Subscriber features.
                  </Text>
                  
                  <TouchableOpacity
                    style={[styles.deactivateButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.danger }]}
                    onPress={handleDeactivateUnlock}
                  >
                    <Text style={[styles.deactivateButtonText, { color: theme.colors.danger }]}>
                      Deactivate Unlock
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[styles.unlockDescription, { color: theme.colors.textSecondary }]}>
                    {isBillingAvailable 
                      ? 'Enter an access code to unlock Subscriber features for testing or development purposes. This does not affect store billing.'
                      : 'Since in-app purchases aren\'t available, use this access code feature to test subscriber functionality. Enter the code to unlock all subscriber features.'
                    }
                  </Text>

                  {!showAccessCodeInput ? (
                    <TouchableOpacity
                      style={[styles.unlockButton, { backgroundColor: theme.colors.textSecondary }]}
                      onPress={() => setShowAccessCodeInput(true)}
                    >
                      <Text style={styles.unlockButtonText}>
                        Enter Access Code
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.accessCodeContainer}>
                      <TextInput
                        style={[styles.accessCodeInput, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                        value={accessCode}
                        onChangeText={setAccessCode}
                        placeholder="Enter access code"
                        placeholderTextColor={theme.colors.textSecondary}
                        autoCapitalize="characters"
                        autoCorrect={false}
                      />
                      
                      <View style={styles.accessCodeButtons}>
                        <TouchableOpacity
                          style={[styles.cancelButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                          onPress={() => {
                            setShowAccessCodeInput(false);
                            setAccessCode('');
                          }}
                        >
                          <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                            Cancel
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.submitButton, { backgroundColor: theme.colors.textSecondary }]}
                          onPress={handleUnlockSubscription}
                          disabled={isUnlocking}
                        >
                          {isUnlocking ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Text style={styles.submitButtonText}>
                              Unlock
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Theme Selection */}
            <Text style={[styles.mainSectionTitle, { color: theme.colors.text }]}>
              Choose Your Theme
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
              Select a calming color theme that feels right for you
            </Text>

            <View style={styles.themesGrid}>
              {themeNames.map((name, index) => {
                const isSelected = name === themeName;
                const themeColors = themes[name].colors;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.themeCard,
                      { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                      isSelected && { borderColor: theme.colors.primary, borderWidth: 3 },
                    ]}
                    onPress={() => handleThemeSelect(name)}
                  >
                    <View style={styles.themeHeader}>
                      <Text style={[styles.themeName, { color: theme.colors.text }]}>
                        {name}
                      </Text>
                      {isSelected && (
                        <IconSymbol
                          ios_icon_name="checkmark.circle.fill"
                          android_material_icon_name="check-circle"
                          size={24}
                          color={theme.colors.primary}
                        />
                      )}
                    </View>
                    
                    <View style={styles.colorPreview}>
                      <View style={[styles.colorSwatch, { backgroundColor: themeColors.primary }]} />
                      <View style={[styles.colorSwatch, { backgroundColor: themeColors.secondary }]} />
                      <View style={[styles.colorSwatch, { backgroundColor: themeColors.accent }]} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[styles.infoBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, marginTop: 24 }]}>
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Your theme preference is saved locally on your device and will be remembered when you return.
              </Text>
            </View>
          </ScrollView>
        </View>
      )}
    </SuperwallHooksWrapper>
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
    paddingBottom: 100,
  },
  expoGoWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
  },
  expoGoWarningContent: {
    flex: 1,
  },
  expoGoWarningTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  expoGoWarningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  tierText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tierDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  poolsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  poolsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  poolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  poolLabel: {
    fontSize: 14,
  },
  poolValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  resetInfo: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  extraTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  extraTimeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  restoreDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  restoreButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  devBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 12,
  },
  devBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  unlockDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  unlockButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deactivateButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  deactivateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  accessCodeContainer: {
    gap: 12,
  },
  accessCodeInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  accessCodeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mainSectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
  },
  sectionDescription: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  themesGrid: {
    gap: 16,
  },
  themeCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
  },
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  themeName: {
    fontSize: 18,
    fontWeight: '600',
  },
  colorPreview: {
    flexDirection: 'row',
    gap: 8,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
});
