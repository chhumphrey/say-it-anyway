
import * as SecureStore from 'expo-secure-store';
import { Recipient, Message, UserProfile, ThemeName, CustomColors, BackgroundSettings } from '@/types';

const RECIPIENTS_KEY = 'recipients';
const MESSAGES_KEY = 'messages';
const PROFILE_KEY = 'profile';
const THEME_KEY = 'theme';
const CUSTOM_COLORS_KEY = 'custom_colors';
const BACKGROUND_SETTINGS_KEY = 'background_settings';

export class StorageService {
  // Recipients
  static async getRecipients(): Promise<Recipient[]> {
    try {
      const data = await SecureStore.getItemAsync(RECIPIENTS_KEY);
      const recipients = data ? JSON.parse(data) : [];
      console.log('StorageService.getRecipients:', recipients.length, 'recipients loaded');
      return recipients;
    } catch (error) {
      console.error('Error loading recipients:', error);
      return [];
    }
  }

  static async saveRecipients(recipients: Recipient[]): Promise<void> {
    try {
      console.log('StorageService.saveRecipients: Saving', recipients.length, 'recipients');
      recipients.forEach(r => console.log('  - Saving recipient:', r.id, r.name));
      await SecureStore.setItemAsync(RECIPIENTS_KEY, JSON.stringify(recipients));
      console.log('StorageService.saveRecipients: Successfully saved');
      
      // Verify the save
      const verification = await SecureStore.getItemAsync(RECIPIENTS_KEY);
      const verifiedRecipients = verification ? JSON.parse(verification) : [];
      console.log('StorageService.saveRecipients: Verification -', verifiedRecipients.length, 'recipients in storage');
    } catch (error) {
      console.error('Error saving recipients:', error);
      throw error;
    }
  }

  static async addRecipient(recipient: Recipient): Promise<void> {
    try {
      console.log('StorageService.addRecipient: Adding recipient', recipient.id, recipient.name);
      const recipients = await this.getRecipients();
      recipients.push(recipient);
      await this.saveRecipients(recipients);
    } catch (error) {
      console.error('Error adding recipient:', error);
      throw error;
    }
  }

  static async updateRecipient(id: string, updates: Partial<Recipient>): Promise<void> {
    try {
      console.log('StorageService.updateRecipient: Updating recipient', id);
      const recipients = await this.getRecipients();
      const index = recipients.findIndex(r => r.id === id);
      if (index !== -1) {
        recipients[index] = { ...recipients[index], ...updates };
        await this.saveRecipients(recipients);
        console.log('StorageService.updateRecipient: Successfully updated');
      } else {
        console.warn('StorageService.updateRecipient: Recipient not found', id);
      }
    } catch (error) {
      console.error('Error updating recipient:', error);
      throw error;
    }
  }

  static async deleteRecipient(id: string): Promise<void> {
    try {
      console.log('StorageService.deleteRecipient: Deleting recipient', id);
      const recipients = await this.getRecipients();
      const filtered = recipients.filter(r => r.id !== id);
      await this.saveRecipients(filtered);
      
      // Also delete all messages for this recipient
      const messages = await this.getMessages();
      const filteredMessages = messages.filter(m => m.recipientId !== id);
      await this.saveMessages(filteredMessages);
      console.log('StorageService.deleteRecipient: Successfully deleted');
    } catch (error) {
      console.error('Error deleting recipient:', error);
      throw error;
    }
  }

  // Messages
  static async getMessages(): Promise<Message[]> {
    try {
      const data = await SecureStore.getItemAsync(MESSAGES_KEY);
      const messages = data ? JSON.parse(data) : [];
      console.log('StorageService.getMessages:', messages.length, 'messages loaded');
      return messages;
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  static async saveMessages(messages: Message[]): Promise<void> {
    try {
      console.log('StorageService.saveMessages: Saving', messages.length, 'messages');
      await SecureStore.setItemAsync(MESSAGES_KEY, JSON.stringify(messages));
      console.log('StorageService.saveMessages: Successfully saved');
    } catch (error) {
      console.error('Error saving messages:', error);
      throw error;
    }
  }

  static async addMessage(message: Message): Promise<void> {
    try {
      console.log('StorageService.addMessage: Adding message', message.id);
      const messages = await this.getMessages();
      messages.push(message);
      await this.saveMessages(messages);
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  static async saveMessage(message: Message): Promise<void> {
    await this.addMessage(message);
  }

  static async updateMessage(updatedMessage: Message): Promise<void> {
    try {
      console.log('StorageService.updateMessage: Updating message', updatedMessage.id);
      const messages = await this.getMessages();
      const index = messages.findIndex(m => m.id === updatedMessage.id);
      if (index !== -1) {
        messages[index] = updatedMessage;
        await this.saveMessages(messages);
        console.log('StorageService.updateMessage: Successfully updated');
      } else {
        console.warn('StorageService.updateMessage: Message not found', updatedMessage.id);
      }
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }

  static async deleteMessage(id: string): Promise<void> {
    try {
      console.log('StorageService.deleteMessage: Deleting message', id);
      const messages = await this.getMessages();
      const filtered = messages.filter(m => m.id !== id);
      await this.saveMessages(filtered);
      console.log('StorageService.deleteMessage: Successfully deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  static async getMessagesForRecipient(recipientId: string): Promise<Message[]> {
    try {
      const messages = await this.getMessages();
      const filtered = messages.filter(m => m.recipientId === recipientId);
      console.log('StorageService.getMessagesForRecipient:', filtered.length, 'messages for recipient', recipientId);
      return filtered;
    } catch (error) {
      console.error('Error getting messages for recipient:', error);
      return [];
    }
  }

  // Profile
  static async getProfile(): Promise<UserProfile | null> {
    try {
      const data = await SecureStore.getItemAsync(PROFILE_KEY);
      const profile = data ? JSON.parse(data) : null;
      console.log('StorageService.getProfile:', profile ? 'Profile loaded' : 'No profile found');
      return profile;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    }
  }

  static async getUserProfile(): Promise<UserProfile | null> {
    return this.getProfile();
  }

  static async saveProfile(profile: UserProfile): Promise<void> {
    try {
      console.log('StorageService.saveProfile: Saving profile for', profile.name);
      await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(profile));
      console.log('StorageService.saveProfile: Successfully saved');
      
      // Verify the save
      const verification = await SecureStore.getItemAsync(PROFILE_KEY);
      const verifiedProfile = verification ? JSON.parse(verification) : null;
      console.log('StorageService.saveProfile: Verification -', verifiedProfile ? 'Profile exists in storage' : 'Profile NOT in storage');
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }

  // Theme
  static async getTheme(): Promise<ThemeName> {
    try {
      const theme = await SecureStore.getItemAsync(THEME_KEY);
      const themeName = (theme as ThemeName) || 'Gentle Sky';
      console.log('StorageService.getTheme:', themeName);
      return themeName;
    } catch (error) {
      console.error('Error loading theme:', error);
      return 'Gentle Sky';
    }
  }

  static async saveTheme(theme: ThemeName): Promise<void> {
    try {
      console.log('StorageService.saveTheme: Saving theme', theme);
      await SecureStore.setItemAsync(THEME_KEY, theme);
      console.log('StorageService.saveTheme: Successfully saved');
    } catch (error) {
      console.error('Error saving theme:', error);
      throw error;
    }
  }

  // Custom Colors
  static async getCustomColors(): Promise<CustomColors | null> {
    try {
      const data = await SecureStore.getItemAsync(CUSTOM_COLORS_KEY);
      const colors = data ? JSON.parse(data) : null;
      console.log('StorageService.getCustomColors:', colors ? 'Custom colors loaded' : 'No custom colors');
      return colors;
    } catch (error) {
      console.error('Error loading custom colors:', error);
      return null;
    }
  }

  static async saveCustomColors(colors: CustomColors): Promise<void> {
    try {
      console.log('StorageService.saveCustomColors: Saving custom colors');
      await SecureStore.setItemAsync(CUSTOM_COLORS_KEY, JSON.stringify(colors));
      console.log('StorageService.saveCustomColors: Successfully saved');
    } catch (error) {
      console.error('Error saving custom colors:', error);
      throw error;
    }
  }

  // Background Settings
  static async getBackgroundSettings(): Promise<BackgroundSettings> {
    try {
      const data = await SecureStore.getItemAsync(BACKGROUND_SETTINGS_KEY);
      const settings = data ? JSON.parse(data) : { scene: 'Ocean', transparency: 15 };
      console.log('StorageService.getBackgroundSettings:', settings);
      return settings;
    } catch (error) {
      console.error('Error loading background settings:', error);
      return { scene: 'Ocean', transparency: 15 };
    }
  }

  static async saveBackgroundSettings(settings: BackgroundSettings): Promise<void> {
    try {
      console.log('StorageService.saveBackgroundSettings: Saving settings', settings);
      await SecureStore.setItemAsync(BACKGROUND_SETTINGS_KEY, JSON.stringify(settings));
      console.log('StorageService.saveBackgroundSettings: Successfully saved');
    } catch (error) {
      console.error('Error saving background settings:', error);
      throw error;
    }
  }
}
