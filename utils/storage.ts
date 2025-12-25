
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
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading recipients:', error);
      return [];
    }
  }

  static async saveRecipients(recipients: Recipient[]): Promise<void> {
    try {
      await SecureStore.setItemAsync(RECIPIENTS_KEY, JSON.stringify(recipients));
    } catch (error) {
      console.error('Error saving recipients:', error);
    }
  }

  static async addRecipient(recipient: Recipient): Promise<void> {
    const recipients = await this.getRecipients();
    recipients.push(recipient);
    await this.saveRecipients(recipients);
  }

  static async updateRecipient(id: string, updates: Partial<Recipient>): Promise<void> {
    const recipients = await this.getRecipients();
    const index = recipients.findIndex(r => r.id === id);
    if (index !== -1) {
      recipients[index] = { ...recipients[index], ...updates };
      await this.saveRecipients(recipients);
    }
  }

  static async deleteRecipient(id: string): Promise<void> {
    const recipients = await this.getRecipients();
    const filtered = recipients.filter(r => r.id !== id);
    await this.saveRecipients(filtered);
    
    // Also delete all messages for this recipient
    const messages = await this.getMessages();
    const filteredMessages = messages.filter(m => m.recipientId !== id);
    await this.saveMessages(filteredMessages);
  }

  // Messages
  static async getMessages(): Promise<Message[]> {
    try {
      const data = await SecureStore.getItemAsync(MESSAGES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  static async saveMessages(messages: Message[]): Promise<void> {
    try {
      await SecureStore.setItemAsync(MESSAGES_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }

  static async addMessage(message: Message): Promise<void> {
    const messages = await this.getMessages();
    messages.push(message);
    await this.saveMessages(messages);
  }

  static async saveMessage(message: Message): Promise<void> {
    await this.addMessage(message);
  }

  static async updateMessage(updatedMessage: Message): Promise<void> {
    const messages = await this.getMessages();
    const index = messages.findIndex(m => m.id === updatedMessage.id);
    if (index !== -1) {
      messages[index] = updatedMessage;
      await this.saveMessages(messages);
    }
  }

  static async deleteMessage(id: string): Promise<void> {
    const messages = await this.getMessages();
    const filtered = messages.filter(m => m.id !== id);
    await this.saveMessages(filtered);
  }

  static async getMessagesForRecipient(recipientId: string): Promise<Message[]> {
    const messages = await this.getMessages();
    return messages.filter(m => m.recipientId === recipientId);
  }

  // Profile
  static async getProfile(): Promise<UserProfile | null> {
    try {
      const data = await SecureStore.getItemAsync(PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    }
  }

  static async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }

  // Theme
  static async getTheme(): Promise<ThemeName> {
    try {
      const theme = await SecureStore.getItemAsync(THEME_KEY);
      return (theme as ThemeName) || 'Gentle Sky';
    } catch (error) {
      console.error('Error loading theme:', error);
      return 'Gentle Sky';
    }
  }

  static async saveTheme(theme: ThemeName): Promise<void> {
    try {
      await SecureStore.setItemAsync(THEME_KEY, theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }

  // Custom Colors
  static async getCustomColors(): Promise<CustomColors | null> {
    try {
      const data = await SecureStore.getItemAsync(CUSTOM_COLORS_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading custom colors:', error);
      return null;
    }
  }

  static async saveCustomColors(colors: CustomColors): Promise<void> {
    try {
      await SecureStore.setItemAsync(CUSTOM_COLORS_KEY, JSON.stringify(colors));
    } catch (error) {
      console.error('Error saving custom colors:', error);
    }
  }

  // Background Settings
  static async getBackgroundSettings(): Promise<BackgroundSettings> {
    try {
      const data = await SecureStore.getItemAsync(BACKGROUND_SETTINGS_KEY);
      return data ? JSON.parse(data) : { scene: 'Ocean', transparency: 15 };
    } catch (error) {
      console.error('Error loading background settings:', error);
      return { scene: 'Ocean', transparency: 15 };
    }
  }

  static async saveBackgroundSettings(settings: BackgroundSettings): Promise<void> {
    try {
      await SecureStore.setItemAsync(BACKGROUND_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving background settings:', error);
    }
  }
}
