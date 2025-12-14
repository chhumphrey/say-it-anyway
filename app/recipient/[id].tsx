
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Recipient, Message } from '@/types';
import { StorageService } from '@/utils/storage';
import { useAppTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/IconSymbol';

interface AudioPlayerState {
  [messageId: string]: ReturnType<typeof useAudioPlayer>;
}

export default function RecipientDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useAppTheme();
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showHidden, setShowHidden] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, [id]);

  // Use useFocusEffect to reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [id])
  );

  const loadData = async () => {
    const recipients = await StorageService.getRecipients();
    const found = recipients.find(r => r.id === id);
    setRecipient(found || null);

    const allMessages = await StorageService.getMessages(id as string);
    const sorted = allMessages.sort((a, b) => b.timestamp - a.timestamp);
    setMessages(sorted);
  };

  const toggleHidden = async (messageId: string, currentHidden: boolean) => {
    await StorageService.updateMessage(messageId, { isHidden: !currentHidden });
    loadData();
  };

  const toggleExpanded = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const visibleMessages = showHidden 
    ? messages 
    : messages.filter(m => !m.isHidden);

  if (!recipient) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          Recipient not found
        </Text>
      </View>
    );
  }

  return (
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {recipient.name}
        </Text>
        <TouchableOpacity
          onPress={() => router.push(`/edit-recipient?id=${id}`)}
          style={styles.editButton}
        >
          <IconSymbol
            ios_icon_name="pencil.circle.fill"
            android_material_icon_name="edit"
            size={28}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.recipientInfo}>
        {recipient.photoUri ? (
          <Image source={{ uri: recipient.photoUri }} style={styles.photo} />
        ) : (
          <View style={[styles.photoPlaceholder, { backgroundColor: theme.colors.secondary }]}>
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              size={50}
              color={theme.colors.primary}
            />
          </View>
        )}
        
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {recipient.name}
        </Text>
        
        {recipient.nickname && (
          <Text style={[styles.nickname, { color: theme.colors.textSecondary }]}>
            &quot;{recipient.nickname}&quot;
          </Text>
        )}

        {(recipient.dateOfBirth || recipient.dateOfDeath) && (
          <Text style={[styles.dates, { color: theme.colors.textSecondary }]}>
            {recipient.dateOfBirth && `Born: ${recipient.dateOfBirth}`}
            {recipient.dateOfBirth && recipient.dateOfDeath && ' • '}
            {recipient.dateOfDeath && `Passed: ${recipient.dateOfDeath}`}
          </Text>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push(`/compose-message?recipientId=${id}&type=text`)}
        >
          <IconSymbol
            ios_icon_name="pencil"
            android_material_icon_name="edit"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.actionButtonText}>Write Message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.accent }]}
          onPress={() => router.push(`/compose-message?recipientId=${id}&type=audio`)}
        >
          <IconSymbol
            ios_icon_name="mic.fill"
            android_material_icon_name="mic"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.actionButtonText}>Record Audio</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.messagesHeader}>
        <Text style={[styles.messagesTitle, { color: theme.colors.text }]}>
          Messages ({visibleMessages.length})
        </Text>
        <TouchableOpacity onPress={() => setShowHidden(!showHidden)}>
          <Text style={[styles.toggleText, { color: theme.colors.primary }]}>
            {showHidden ? 'Hide Hidden' : 'Show Hidden'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.messagesList} contentContainerStyle={styles.messagesContent}>
        {visibleMessages.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="envelope.fill"
              android_material_icon_name="mail"
              size={48}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No messages yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
              Share your thoughts and feelings
            </Text>
          </View>
        ) : (
          visibleMessages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              theme={theme}
              isExpanded={expandedMessages.has(message.id)}
              onToggleExpanded={() => toggleExpanded(message.id)}
              onToggleHidden={() => toggleHidden(message.id, message.isHidden)}
              formatDate={formatDate}
              formatDuration={formatDuration}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

interface MessageCardProps {
  message: Message;
  theme: any;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onToggleHidden: () => void;
  formatDate: (timestamp: number) => string;
  formatDuration: (seconds: number) => string;
}

function MessageCard({
  message,
  theme,
  isExpanded,
  onToggleExpanded,
  onToggleHidden,
  formatDate,
  formatDuration,
}: MessageCardProps) {
  const [textLines, setTextLines] = useState(0);
  const [needsTruncation, setNeedsTruncation] = useState(false);

  const handleTextLayout = (e: any) => {
    const lines = e.nativeEvent.lines.length;
    setTextLines(lines);
    setNeedsTruncation(lines > 4);
  };

  return (
    <View
      style={[
        styles.messageCard,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        message.isHidden && { opacity: 0.6 },
      ]}
    >
      <View style={styles.messageHeader}>
        <View style={styles.messageTypeIcon}>
          <IconSymbol
            ios_icon_name={message.type === 'audio' ? 'waveform' : 'text.bubble.fill'}
            android_material_icon_name={message.type === 'audio' ? 'graphic-eq' : 'message'}
            size={16}
            color={theme.colors.primary}
          />
        </View>
        <Text style={[styles.messageDate, { color: theme.colors.textSecondary }]}>
          {formatDate(message.timestamp)}
        </Text>
        <TouchableOpacity
          onPress={onToggleHidden}
          style={styles.hideButton}
        >
          <IconSymbol
            ios_icon_name={message.isHidden ? 'eye.fill' : 'eye.slash.fill'}
            android_material_icon_name={message.isHidden ? 'visibility' : 'visibility-off'}
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {message.type === 'audio' && message.audioUri && (
        <AudioPlayer
          audioUri={message.audioUri}
          audioDuration={message.audioDuration}
          theme={theme}
          formatDuration={formatDuration}
        />
      )}

      {message.textContent && (
        <View>
          <Text
            style={[styles.messageText, { color: theme.colors.text }]}
            numberOfLines={isExpanded ? undefined : 4}
            onTextLayout={handleTextLayout}
          >
            {message.textContent}
          </Text>
          {needsTruncation && (
            <TouchableOpacity onPress={onToggleExpanded} style={styles.showAllButton}>
              <Text style={[styles.showAllText, { color: theme.colors.primary }]}>
                {isExpanded ? 'Show Less' : 'Show All'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {message.transcript && message.type === 'audio' && (
        <View style={[styles.transcriptBox, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.transcriptLabel, { color: theme.colors.textSecondary }]}>
            Transcript:
          </Text>
          <Text
            style={[styles.transcriptText, { color: theme.colors.text }]}
            numberOfLines={isExpanded ? undefined : 4}
          >
            {message.transcript}
          </Text>
          {message.transcript.split('\n').length > 4 && (
            <TouchableOpacity onPress={onToggleExpanded} style={styles.showAllButton}>
              <Text style={[styles.showAllText, { color: theme.colors.primary }]}>
                {isExpanded ? 'Show Less' : 'Show All'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

interface AudioPlayerProps {
  audioUri: string;
  audioDuration?: number;
  theme: any;
  formatDuration: (seconds: number) => string;
}

function AudioPlayer({ audioUri, audioDuration, theme, formatDuration }: AudioPlayerProps) {
  const player = useAudioPlayer(audioUri);
  const status = useAudioPlayerStatus(player);

  const handlePlayPause = () => {
    if (status.playing) {
      player.pause();
    } else {
      if (status.currentTime >= (status.duration || 0) - 0.1) {
        // If at the end, restart from beginning
        player.seekTo(0);
      }
      player.play();
    }
  };

  const currentTime = status.currentTime || 0;
  const duration = status.duration || audioDuration || 0;
  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <View style={[styles.audioPlayerContainer, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity
        onPress={handlePlayPause}
        style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
      >
        <IconSymbol
          ios_icon_name={status.playing ? 'pause.fill' : 'play.fill'}
          android_material_icon_name={status.playing ? 'pause' : 'play-arrow'}
          size={24}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      <View style={styles.audioInfo}>
        <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: theme.colors.primary, width: `${progress * 100}%` },
            ]}
          />
        </View>
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
            {formatDuration(currentTime)}
          </Text>
          <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
            {formatDuration(duration)}
          </Text>
        </View>
      </View>
    </View>
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
    marginHorizontal: 8,
  },
  editButton: {
    padding: 4,
  },
  recipientInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
  },
  nickname: {
    fontSize: 16,
    marginTop: 4,
  },
  dates: {
    fontSize: 14,
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  messagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  messagesTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  messageCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  messageTypeIcon: {
    marginRight: 8,
  },
  messageDate: {
    fontSize: 13,
    flex: 1,
  },
  hideButton: {
    padding: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  showAllButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  showAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  audioPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  audioInfo: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
  },
  transcriptBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});
