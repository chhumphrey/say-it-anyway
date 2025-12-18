
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import { SubscriptionTier } from '@/types';
import { StorageService } from '@/utils/storage';
import { billingService } from '@/utils/billingService';

// Conditionally import Superwall hooks
let useUser: any = null;
let useSuperwallEvents: any = null;
let isSuperwallAvailable = false;

// Check if Superwall is available
if (Platform.OS !== 'web') {
  try {
    const superwallModule = require('expo-superwall');
    useUser = superwallModule.useUser;
    useSuperwallEvents = superwallModule.useSuperwallEvents;
    isSuperwallAvailable = true;
    console.log('Superwall hooks loaded successfully');
  } catch (error) {
    console.log('Superwall hooks not available - running in Expo Go or web');
  }
}

interface SubscriptionContextType {
  subscriptionTier: SubscriptionTier;
  isSubscriber: boolean;
  shouldShowAds: (screenName?: string) => boolean;
  refreshSubscription: () => Promise<void>;
  isBillingAvailable: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Screens where ads should NEVER be shown
const AD_FREE_SCREENS = [
  'support-resources',
  'compose-message',
];

// Separate component to handle Superwall events
// This ensures hooks are always called at the top level
function SuperwallEventHandler() {
  // Only set up event listeners if Superwall is available
  if (!isSuperwallAvailable || !useSuperwallEvents) {
    return null;
  }

  // Call the hook unconditionally
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useSuperwallEvents({
    onSubscriptionStatusChange: async (status: any) => {
      console.log('Superwall subscription status changed:', status);
      
      try {
        if (status.status === 'ACTIVE') {
          await billingService.activateSubscription();
        } else {
          await billingService.deactivateSubscription();
        }
      } catch (error) {
        console.error('Error handling subscription status change:', error);
      }
    },
    onSuperwallEvent: (eventInfo: any) => {
      console.log('Superwall event:', eventInfo.event?.event, eventInfo.params);
    },
  });

  return null;
}

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('Free');
  const [isBillingAvailable, setIsBillingAvailable] = useState(false);

  // Always call useUser hook, even if Superwall is not available
  // This is safe because we check availability before calling
  let superwallUser = null;
  if (isSuperwallAvailable && useUser) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    superwallUser = useUser();
  }

  const initializeSubscription = useCallback(async () => {
    try {
      console.log('Initializing subscription context...');
      
      // Initialize billing service
      await billingService.initialize();
      
      // Check if billing is available
      const billingAvailable = billingService.isBillingAvailable();
      setIsBillingAvailable(billingAvailable);
      
      if (billingAvailable) {
        console.log('Billing service available - Superwall will handle subscription status');
      } else {
        console.log('Billing service not available (Expo Go or web) - using local data only');
      }
      
      // Load subscription data
      await loadSubscription();
    } catch (error) {
      console.error('Error initializing subscription:', error);
      // Still load local subscription data even if billing fails
      await loadSubscription();
    }
  }, []);

  const loadSubscription = useCallback(async () => {
    try {
      const status = await StorageService.getSubscriptionStatus();
      setSubscriptionTier(status.tier);
      console.log('Subscription loaded:', status.tier);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  }, []);

  const syncSuperwallStatus = useCallback(async (status: any) => {
    try {
      const currentStatus = await StorageService.getSubscriptionStatus();
      
      // Don't override if unlocked via access code
      if (currentStatus.isUnlocked) {
        console.log('Subscription unlocked via access code - not syncing with Superwall');
        return;
      }

      if (status.status === 'ACTIVE' && currentStatus.tier === 'Free') {
        console.log('Activating subscription from Superwall status');
        await billingService.activateSubscription();
        await loadSubscription();
      } else if (status.status !== 'ACTIVE' && currentStatus.tier === 'Subscriber') {
        console.log('Deactivating subscription from Superwall status');
        await billingService.deactivateSubscription();
        await loadSubscription();
      }
    } catch (error) {
      console.error('Error syncing Superwall status:', error);
    }
  }, [loadSubscription]);

  useEffect(() => {
    initializeSubscription();
  }, [initializeSubscription]);

  // Sync with Superwall subscription status when it changes
  useEffect(() => {
    if (superwallUser?.subscriptionStatus) {
      const status = superwallUser.subscriptionStatus;
      console.log('Superwall subscription status from useUser:', status);
      
      syncSuperwallStatus(status);
    }
  }, [superwallUser?.subscriptionStatus, syncSuperwallStatus]);

  const refreshSubscription = useCallback(async () => {
    console.log('Refreshing subscription...');
    
    // If Superwall is available, refresh from there
    if (superwallUser?.refresh) {
      try {
        await superwallUser.refresh();
        console.log('Refreshed subscription from Superwall');
      } catch (error) {
        console.error('Error refreshing from Superwall:', error);
      }
    }
    
    await loadSubscription();
  }, [superwallUser, loadSubscription]);

  const isSubscriber = subscriptionTier !== 'Free';

  const shouldShowAds = (screenName?: string): boolean => {
    console.log('shouldShowAds check:', { screenName, isSubscriber, subscriptionTier });
    
    // Never show ads for subscribers
    if (isSubscriber) {
      console.log('Not showing ads - user is subscriber');
      return false;
    }

    // Never show ads on safety-related or sensitive screens
    if (screenName && AD_FREE_SCREENS.some(screen => screenName.includes(screen))) {
      console.log('Not showing ads - screen is in AD_FREE_SCREENS');
      return false;
    }

    // Show ads for free tier on other screens
    console.log('Showing ads - free tier on allowed screen');
    return true;
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionTier,
        isSubscriber,
        shouldShowAds,
        refreshSubscription,
        isBillingAvailable,
      }}
    >
      <SuperwallEventHandler />
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};
