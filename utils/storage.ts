
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Recipient, Message, ThemeName, UserProfile, RecordingTime, SubscriptionStatus } from '@/types';

const RECIPIENTS_KEY = '@grief_journal_recipients';
const MESSAGES_KEY = '@grief_journal_messages';
const THEME_KEY = '@grief_journal_theme';
const PROFILE_KEY = '@grief_journal_profile';
const RECORDING_TIME_KEY = '@grief_journal_recording_time';
const SUBSCRIPTION_STATUS_KEY = 'grief_journal_subscription_status'; // SecureStore key

export const StorageService = {
  async getRecipients(): Promise<Recipient[]> {
    try {
      const data = await AsyncStorage.getItem(RECIPIENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading recipients:', error);
      return [];
    }
  },

  async saveRecipients(recipients: Recipient[]): Promise<void> {
    try {
      await AsyncStorage.setItem(RECIPIENTS_KEY, JSON.stringify(recipients));
    } catch (error) {
      console.error('Error saving recipients:', error);
    }
  },

  async updateRecipient(recipientId: string, updates: Partial<Recipient>): Promise<void> {
    try {
      const recipients = await this.getRecipients();
      const index = recipients.findIndex(r => r.id === recipientId);
      
      if (index !== -1) {
        recipients[index] = { ...recipients[index], ...updates };
        await this.saveRecipients(recipients);
      }
    } catch (error) {
      console.error('Error updating recipient:', error);
    }
  },

  async getMessages(recipientId?: string): Promise<Message[]> {
    try {
      const data = await AsyncStorage.getItem(MESSAGES_KEY);
      const allMessages: Message[] = data ? JSON.parse(data) : [];
      
      if (recipientId) {
        return allMessages.filter(msg => msg.recipientId === recipientId);
      }
      
      return allMessages;
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  },

  async saveMessage(message: Message): Promise<void> {
    try {
      const messages = await this.getMessages();
      messages.push(message);
      await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving message:', error);
    }
  },

  async updateMessage(messageId: string, updates: Partial<Message>): Promise<void> {
    try {
      const messages = await this.getMessages();
      const index = messages.findIndex(msg => msg.id === messageId);
      
      if (index !== -1) {
        messages[index] = { ...messages[index], ...updates };
        await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  },

  async getTheme(): Promise<ThemeName> {
    try {
      const theme = await AsyncStorage.getItem(THEME_KEY);
      return (theme as ThemeName) || 'Gentle Sky';
    } catch (error) {
      console.error('Error loading theme:', error);
      return 'Gentle Sky';
    }
  },

  async saveTheme(theme: ThemeName): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  },

  async getUserProfile(): Promise<UserProfile> {
    try {
      const data = await AsyncStorage.getItem(PROFILE_KEY);
      return data ? JSON.parse(data) : {
        name: 'Your Name',
        email: '',
        phone: '',
        location: '',
        preferredPronouns: '',
        photoUri: undefined,
      };
    } catch (error) {
      console.error('Error loading profile:', error);
      return {
        name: 'Your Name',
        email: '',
        phone: '',
        location: '',
        preferredPronouns: '',
        photoUri: undefined,
      };
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  },

  // Recording Time Management
  async getRecordingTime(): Promise<RecordingTime> {
    try {
      const data = await AsyncStorage.getItem(RECORDING_TIME_KEY);
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // 1-12
      const currentYear = now.getFullYear();

      if (!data) {
        // Initialize with default values
        const defaultRecordingTime: RecordingTime = {
          freeMonthly: 300, // 5 minutes
          subscriberMonthly: 0, // No subscriber time for free tier
          purchasedExtra: 0,
          lastResetMonth: currentMonth,
          lastResetYear: currentYear,
        };
        await this.saveRecordingTime(defaultRecordingTime);
        return defaultRecordingTime;
      }

      const recordingTime: RecordingTime = JSON.parse(data);

      // Check if we need to reset monthly pools
      if (recordingTime.lastResetMonth !== currentMonth || recordingTime.lastResetYear !== currentYear) {
        console.log('Resetting monthly recording time pools');
        const subscriptionStatus = await this.getSubscriptionStatus();
        
        recordingTime.freeMonthly = 300; // Reset free pool
        recordingTime.subscriberMonthly = subscriptionStatus.tier !== 'Free' ? 3600 : 0; // Reset subscriber pool if applicable
        recordingTime.lastResetMonth = currentMonth;
        recordingTime.lastResetYear = currentYear;
        // purchasedExtra is NOT reset - it rolls over
        
        await this.saveRecordingTime(recordingTime);
      }

      return recordingTime;
    } catch (error) {
      console.error('Error loading recording time:', error);
      const now = new Date();
      return {
        freeMonthly: 300,
        subscriberMonthly: 0,
        purchasedExtra: 0,
        lastResetMonth: now.getMonth() + 1,
        lastResetYear: now.getFullYear(),
      };
    }
  },

  async saveRecordingTime(recordingTime: RecordingTime): Promise<void> {
    try {
      await AsyncStorage.setItem(RECORDING_TIME_KEY, JSON.stringify(recordingTime));
    } catch (error) {
      console.error('Error saving recording time:', error);
    }
  },

  async deductRecordingTime(seconds: number): Promise<boolean> {
    try {
      const recordingTime = await this.getRecordingTime();
      const totalAvailable = recordingTime.freeMonthly + recordingTime.subscriberMonthly + recordingTime.purchasedExtra;

      if (totalAvailable < seconds) {
        console.log('Insufficient recording time:', { available: totalAvailable, needed: seconds });
        return false;
      }

      // Deduct from pools in order: free monthly, subscriber monthly, purchased extra
      let remaining = seconds;

      if (recordingTime.freeMonthly > 0) {
        const deductFromFree = Math.min(recordingTime.freeMonthly, remaining);
        recordingTime.freeMonthly -= deductFromFree;
        remaining -= deductFromFree;
      }

      if (remaining > 0 && recordingTime.subscriberMonthly > 0) {
        const deductFromSubscriber = Math.min(recordingTime.subscriberMonthly, remaining);
        recordingTime.subscriberMonthly -= deductFromSubscriber;
        remaining -= deductFromSubscriber;
      }

      if (remaining > 0 && recordingTime.purchasedExtra > 0) {
        const deductFromPurchased = Math.min(recordingTime.purchasedExtra, remaining);
        recordingTime.purchasedExtra -= deductFromPurchased;
        remaining -= deductFromPurchased;
      }

      await this.saveRecordingTime(recordingTime);
      console.log('Recording time deducted:', { seconds, remaining: totalAvailable - seconds });
      return true;
    } catch (error) {
      console.error('Error deducting recording time:', error);
      return false;
    }
  },

  async getTotalRecordingTime(): Promise<number> {
    const recordingTime = await this.getRecordingTime();
    return recordingTime.freeMonthly + recordingTime.subscriberMonthly + recordingTime.purchasedExtra;
  },

  async getNextPoolInfo(): Promise<{ poolName: string; available: number }> {
    const recordingTime = await this.getRecordingTime();
    
    if (recordingTime.freeMonthly > 0) {
      return { poolName: 'Free Monthly', available: recordingTime.freeMonthly };
    } else if (recordingTime.subscriberMonthly > 0) {
      return { poolName: 'Subscriber Monthly', available: recordingTime.subscriberMonthly };
    } else if (recordingTime.purchasedExtra > 0) {
      return { poolName: 'Purchased Extra', available: recordingTime.purchasedExtra };
    }
    
    return { poolName: 'None', available: 0 };
  },

  // Subscription Status Management
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const data = await SecureStore.getItemAsync(SUBSCRIPTION_STATUS_KEY);
      
      if (!data) {
        const defaultStatus: SubscriptionStatus = {
          tier: 'Free',
          isUnlocked: false,
        };
        return defaultStatus;
      }

      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading subscription status:', error);
      return {
        tier: 'Free',
        isUnlocked: false,
      };
    }
  },

  async saveSubscriptionStatus(status: SubscriptionStatus): Promise<void> {
    try {
      await SecureStore.setItemAsync(SUBSCRIPTION_STATUS_KEY, JSON.stringify(status));
    } catch (error) {
      console.error('Error saving subscription status:', error);
    }
  },

  async unlockSubscription(): Promise<void> {
    try {
      const status: SubscriptionStatus = {
        tier: 'Subscriber (Unlocked)',
        isUnlocked: true,
        unlockedDate: Date.now(),
      };
      await this.saveSubscriptionStatus(status);

      // Grant subscriber monthly pool
      const recordingTime = await this.getRecordingTime();
      recordingTime.subscriberMonthly = 3600; // 60 minutes
      await this.saveRecordingTime(recordingTime);

      console.log('Subscription unlocked successfully');
    } catch (error) {
      console.error('Error unlocking subscription:', error);
    }
  },

  async deactivateSubscriptionUnlock(): Promise<void> {
    try {
      const status: SubscriptionStatus = {
        tier: 'Free',
        isUnlocked: false,
      };
      await this.saveSubscriptionStatus(status);

      // Remove subscriber monthly pool
      const recordingTime = await this.getRecordingTime();
      recordingTime.subscriberMonthly = 0;
      await this.saveRecordingTime(recordingTime);

      console.log('Subscription unlock deactivated');
    } catch (error) {
      console.error('Error deactivating subscription unlock:', error);
    }
  },
};

// Access Code Validation
const VALID_ACCESS_CODES = ['DEV123', 'TEST456', 'GRIEF2024', 'UNLOCK99'];

export const validateAccessCode = (code: string): boolean => {
  return VALID_ACCESS_CODES.includes(code.toUpperCase().trim());
};
