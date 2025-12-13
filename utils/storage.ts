
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipient, Message, ThemeName } from '@/types';

const RECIPIENTS_KEY = '@grief_journal_recipients';
const MESSAGES_KEY = '@grief_journal_messages';
const THEME_KEY = '@grief_journal_theme';

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
};
