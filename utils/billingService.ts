
import { Platform } from 'react-native';
import { StorageService } from './storage';

// This service now acts as a bridge between the app and Superwall
// The actual purchase logic is handled by Superwall's hooks in the UI layer

export interface PurchaseResult {
  success: boolean;
  error?: string;
}

class BillingService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Billing service already initialized');
      return;
    }

    console.log('Billing service initialized (using Superwall hooks)');
    this.isInitialized = true;
  }

  async activateSubscription(): Promise<void> {
    try {
      // Check if already unlocked via access code
      const currentStatus = await StorageService.getSubscriptionStatus();
      
      if (currentStatus.isUnlocked) {
        // Keep the unlocked status but note that store subscription is also active
        console.log('Subscription activated (already unlocked via code)');
        return;
      }

      // Set subscription tier to Subscriber
      await StorageService.saveSubscriptionStatus({
        tier: 'Subscriber',
        isUnlocked: false,
        storeSubscriptionActive: true,
        subscriptionActivatedDate: Date.now(),
      });

      // Grant subscriber monthly pool
      const recordingTime = await StorageService.getRecordingTime();
      recordingTime.subscriberMonthly = 3600; // 60 minutes
      await StorageService.saveRecordingTime(recordingTime);

      console.log('Subscription activated successfully');
    } catch (error) {
      console.error('Error activating subscription:', error);
      throw error;
    }
  }

  async addExtraRecordingTime(): Promise<void> {
    try {
      const recordingTime = await StorageService.getRecordingTime();
      recordingTime.purchasedExtra += 3600; // Add 60 minutes
      await StorageService.saveRecordingTime(recordingTime);

      console.log('Extra recording time added successfully');
    } catch (error) {
      console.error('Error adding extra recording time:', error);
      throw error;
    }
  }

  async deactivateSubscription(): Promise<void> {
    try {
      const currentStatus = await StorageService.getSubscriptionStatus();
      
      // Only deactivate if not unlocked via access code
      if (!currentStatus.isUnlocked) {
        await StorageService.saveSubscriptionStatus({
          tier: 'Free',
          isUnlocked: false,
          storeSubscriptionActive: false,
        });

        const recordingTime = await StorageService.getRecordingTime();
        recordingTime.subscriberMonthly = 0;
        await StorageService.saveRecordingTime(recordingTime);

        console.log('Subscription deactivated');
      }
    } catch (error) {
      console.error('Error deactivating subscription:', error);
      throw error;
    }
  }

  // Helper method to check if billing is available
  // This now checks if we're in a development build (not Expo Go)
  isBillingAvailable(): boolean {
    // Check if Superwall module is available
    try {
      require('expo-superwall');
      return Platform.OS !== 'web';
    } catch (error) {
      return false;
    }
  }
}

export const billingService = new BillingService();
