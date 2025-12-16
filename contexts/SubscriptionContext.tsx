
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SubscriptionTier } from '@/types';
import { StorageService } from '@/utils/storage';
import { billingService } from '@/utils/billingService';

interface SubscriptionContextType {
  subscriptionTier: SubscriptionTier;
  isSubscriber: boolean;
  shouldShowAds: (screenName?: string) => boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Screens where ads should NEVER be shown
const AD_FREE_SCREENS = [
  'support-resources',
  'compose-message',
  'recipient',
];

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('Free');

  useEffect(() => {
    initializeSubscription();
  }, []);

  const initializeSubscription = async () => {
    try {
      // Initialize billing service
      await billingService.initialize();
      
      // Check subscription status
      await billingService.checkSubscriptionStatus();
      
      // Load subscription data
      await loadSubscription();
    } catch (error) {
      console.error('Error initializing subscription:', error);
      // Still load local subscription data even if billing fails
      await loadSubscription();
    }
  };

  const loadSubscription = async () => {
    try {
      const status = await StorageService.getSubscriptionStatus();
      setSubscriptionTier(status.tier);
      console.log('Subscription loaded:', status.tier);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const refreshSubscription = async () => {
    await billingService.checkSubscriptionStatus();
    await loadSubscription();
  };

  const isSubscriber = subscriptionTier !== 'Free';

  const shouldShowAds = (screenName?: string): boolean => {
    // Never show ads for subscribers
    if (isSubscriber) {
      return false;
    }

    // Never show ads on safety-related or sensitive screens
    if (screenName && AD_FREE_SCREENS.some(screen => screenName.includes(screen))) {
      return false;
    }

    // Show ads for free tier on other screens
    return true;
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionTier,
        isSubscriber,
        shouldShowAds,
        refreshSubscription,
      }}
    >
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
