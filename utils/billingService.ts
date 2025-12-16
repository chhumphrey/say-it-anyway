
import { Platform, Alert } from 'react-native';
import { StorageService } from './storage';
import { BillingConfig } from '@/constants/BillingConfig';

// Conditionally import Superwall - will be undefined in Expo Go
let Superwall: any = null;
let isSuperwallAvailable = false;

try {
  Superwall = require('expo-superwall').default;
  isSuperwallAvailable = true;
  console.log('Superwall module loaded successfully');
} catch (error) {
  console.warn('Superwall not available - running in Expo Go or module not found. Billing features will be mocked.');
  isSuperwallAvailable = false;
}

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

    if (!isSuperwallAvailable) {
      console.log('Billing service running in mock mode (Expo Go)');
      this.isInitialized = true;
      return;
    }

    try {
      console.log('Initializing Superwall...');
      
      // Configure Superwall
      await Superwall.configure(BillingConfig.superwall.apiKey, {
        logging: {
          level: 'debug',
          scopes: ['all'],
        },
      });

      // Set up purchase handlers
      this.setupPurchaseHandlers();

      this.isInitialized = true;
      console.log('Billing service initialized successfully');
    } catch (error) {
      console.error('Error initializing billing service:', error);
      // Don't throw - allow app to continue in mock mode
      this.isInitialized = true;
    }
  }

  private setupPurchaseHandlers(): void {
    if (!isSuperwallAvailable || !Superwall) return;

    try {
      // Handle subscription purchases
      Superwall.setDelegate({
        handleSuperwallEvent: async (event: any) => {
          console.log('Superwall event:', event);
          
          if (event.type === 'transaction_complete') {
            await this.handlePurchaseComplete(event.product);
          } else if (event.type === 'transaction_restore') {
            await this.handleRestorePurchases();
          }
        },
      });
    } catch (error) {
      console.error('Error setting up purchase handlers:', error);
    }
  }

  private async handlePurchaseComplete(product: any): Promise<void> {
    try {
      console.log('Purchase completed:', product);

      const productId = product.productIdentifier;
      const subscriptionProductId = Platform.select({
        ios: BillingConfig.products.subscription.ios,
        android: BillingConfig.products.subscription.android,
        default: BillingConfig.products.subscription.ios,
      });
      const extraTimeProductId = Platform.select({
        ios: BillingConfig.products.extraTime.ios,
        android: BillingConfig.products.extraTime.android,
        default: BillingConfig.products.extraTime.ios,
      });

      if (productId === subscriptionProductId) {
        // Handle subscription purchase
        await this.activateSubscription();
      } else if (productId === extraTimeProductId) {
        // Handle extra time purchase
        await this.addExtraRecordingTime();
      }
    } catch (error) {
      console.error('Error handling purchase:', error);
    }
  }

  private async activateSubscription(): Promise<void> {
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

  private async addExtraRecordingTime(): Promise<void> {
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

  async purchaseSubscription(): Promise<PurchaseResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!isSuperwallAvailable) {
        console.log('Mock purchase: Subscription (Expo Go mode)');
        Alert.alert(
          'Development Mode',
          'In-app purchases are not available in Expo Go. Please build a development build to test purchases.\n\nFor now, you can use the Access Code feature in Settings to test subscriber features.',
          [{ text: 'OK' }]
        );
        return { success: false, error: 'Not available in Expo Go' };
      }

      console.log('Initiating subscription purchase...');

      const productId = Platform.select({
        ios: BillingConfig.products.subscription.ios,
        android: BillingConfig.products.subscription.android,
        default: BillingConfig.products.subscription.ios,
      });

      // Use Superwall to present paywall
      await Superwall.register('subscription_purchase');

      return { success: true };
    } catch (error: any) {
      console.error('Error purchasing subscription:', error);
      return {
        success: false,
        error: error.message || 'Failed to purchase subscription',
      };
    }
  }

  async purchaseExtraTime(): Promise<PurchaseResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!isSuperwallAvailable) {
        console.log('Mock purchase: Extra Time (Expo Go mode)');
        Alert.alert(
          'Development Mode',
          'In-app purchases are not available in Expo Go. Please build a development build to test purchases.\n\nFor now, you can use the Access Code feature in Settings to test subscriber features.',
          [{ text: 'OK' }]
        );
        return { success: false, error: 'Not available in Expo Go' };
      }

      console.log('Initiating extra time purchase...');

      const productId = Platform.select({
        ios: BillingConfig.products.extraTime.ios,
        android: BillingConfig.products.extraTime.android,
        default: BillingConfig.products.extraTime.ios,
      });

      // Use Superwall to present paywall
      await Superwall.register('extra_time_purchase');

      return { success: true };
    } catch (error: any) {
      console.error('Error purchasing extra time:', error);
      return {
        success: false,
        error: error.message || 'Failed to purchase extra time',
      };
    }
  }

  async restorePurchases(): Promise<PurchaseResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!isSuperwallAvailable) {
        console.log('Mock restore: Purchases (Expo Go mode)');
        Alert.alert(
          'Development Mode',
          'Purchase restoration is not available in Expo Go. Please build a development build to test this feature.',
          [{ text: 'OK' }]
        );
        return { success: false, error: 'Not available in Expo Go' };
      }

      console.log('Restoring purchases...');

      await Superwall.restorePurchases();

      return { success: true };
    } catch (error: any) {
      console.error('Error restoring purchases:', error);
      return {
        success: false,
        error: error.message || 'Failed to restore purchases',
      };
    }
  }

  private async handleRestorePurchases(): Promise<void> {
    try {
      console.log('Handling restore purchases...');

      if (!isSuperwallAvailable || !Superwall) {
        console.log('Superwall not available for restore');
        return;
      }

      // Get subscription status from Superwall
      const subscriptionStatus = await Superwall.getSubscriptionStatus();

      if (subscriptionStatus.isActive) {
        await this.activateSubscription();
      } else {
        // Check if unlocked via access code
        const currentStatus = await StorageService.getSubscriptionStatus();
        if (!currentStatus.isUnlocked) {
          // Revert to free tier
          await StorageService.saveSubscriptionStatus({
            tier: 'Free',
            isUnlocked: false,
            storeSubscriptionActive: false,
          });

          const recordingTime = await StorageService.getRecordingTime();
          recordingTime.subscriberMonthly = 0;
          await StorageService.saveRecordingTime(recordingTime);
        }
      }

      console.log('Purchases restored successfully');
    } catch (error) {
      console.error('Error handling restore purchases:', error);
    }
  }

  async checkSubscriptionStatus(): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!isSuperwallAvailable || !Superwall) {
        console.log('Superwall not available - skipping subscription check');
        return;
      }

      const subscriptionStatus = await Superwall.getSubscriptionStatus();
      const currentStatus = await StorageService.getSubscriptionStatus();

      // If store subscription is active, ensure tier is set correctly
      if (subscriptionStatus.isActive && !currentStatus.isUnlocked) {
        await this.activateSubscription();
      } else if (!subscriptionStatus.isActive && !currentStatus.isUnlocked && currentStatus.tier !== 'Free') {
        // Subscription expired, revert to free
        await StorageService.saveSubscriptionStatus({
          tier: 'Free',
          isUnlocked: false,
          storeSubscriptionActive: false,
        });

        const recordingTime = await StorageService.getRecordingTime();
        recordingTime.subscriberMonthly = 0;
        await StorageService.saveRecordingTime(recordingTime);

        console.log('Subscription expired, reverted to Free tier');
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  }

  // Helper method to check if billing is available
  isBillingAvailable(): boolean {
    return isSuperwallAvailable;
  }
}

export const billingService = new BillingService();
