import { FontAwesome } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, Badge } from '@/components/ui/app-primitives';
import { AppColors, FontFamily, Radius, TypeScale, WarmShadow } from '@/constants/theme';
import { useChatList } from '@/src/features/chat/hooks/use-chat-list';
import type { ChatMessage } from '@/src/features/chat/types';
import type { Meetup } from '@/src/features/sessions/types';
import { formatMessageTime } from '@/src/shared/utils/formatters';

function messagePreview(message?: ChatMessage) {
  if (!message) return 'Phòng chat đã sẵn sàng.';
  if (message.type === 'poll') return `Bình chọn: ${message.poll?.question ?? message.text}`;
  if (message.type === 'location') return `Vị trí: ${message.location?.name ?? message.text}`;
  if (message.type === 'eta') return message.text;
  return message.text;
}

function meetupIcon(meetup: Meetup): React.ComponentProps<typeof FontAwesome>['name'] {
  if (meetup.category === 'Karaoke') return 'microphone';
  if (meetup.category === 'Board game') return 'gamepad';
  if (meetup.category === 'Café') return 'coffee';
  if (meetup.category === 'Ăn uống') return 'cutlery';
  if (meetup.category === 'Rooftop') return 'sun-o';
  return 'users';
}

export default function ChatScreen() {
  const router = useRouter();
  const { state, hydrated, markRoomRead } = useChatList();
  const currentUserId = state.currentUser?.id;

  const rooms = useMemo(() => state.chats.flatMap((room) => {
    const meetup = state.meetups.find((item) => item.id === room.meetupId);
    if (!meetup || !currentUserId) return [];
    const canChat = meetup.hostId === currentUserId || meetup.participants.some((participant) => participant.id === currentUserId);
    if (!canChat) return [];
    return [{ room, meetup, lastMessage: room.messages.at(-1) }];
  }).sort((left, right) => {
    const leftTime = left.lastMessage?.createdAt ?? '';
    const rightTime = right.lastMessage?.createdAt ?? '';
    return rightTime.localeCompare(leftTime);
  }), [currentUserId, state.chats, state.meetups]);

  const openRoom = (meetupId: string) => {
    markRoomRead(meetupId);
    router.push(`/chat/${encodeURIComponent(meetupId)}` as Href);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>GIỮ LIÊN LẠC</Text>
            <Text style={styles.heading}>Chat</Text>
            <Text style={styles.subtitle}>Những kèo bạn đang tham gia</Text>
          </View>
          <View style={styles.headerIcon}><FontAwesome name="comments" size={20} color={AppColors.accent} /></View>
        </View>

        {!hydrated ? (
          <View style={styles.loading}>
            <ActivityIndicator color={AppColors.accent} />
            <Text style={styles.loadingText}>Đang mở các cuộc trò chuyện...</Text>
          </View>
        ) : !state.currentUser ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><FontAwesome name="lock" size={27} color={AppColors.accent} /></View>
            <Text style={styles.emptyTitle}>Đăng nhập để trò chuyện</Text>
            <Text style={styles.emptyText}>Phòng chat chỉ dành cho host và thành viên của meetup.</Text>
            <AppButton label="Đến trang đăng nhập" icon="sign-in" onPress={() => router.replace('/signin')} />
          </View>
        ) : rooms.length ? (
          <View style={styles.list}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>{rooms.length} cuộc trò chuyện</Text>
              <Badge label="Riêng tư cho thành viên" tone="green" icon="lock" />
            </View>
            {rooms.map(({ room, meetup, lastMessage }) => {
              const blockedSender = !!lastMessage && state.blockedUsers.some((user) => user.id === lastMessage.senderId);
              const sender = blockedSender ? undefined : lastMessage?.senderId === currentUserId ? 'Bạn' : lastMessage?.senderName;
              const preview = blockedSender ? 'Tin nhắn từ người dùng đã chặn' : messagePreview(lastMessage);
              return (
                <Pressable
                  key={meetup.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Mở chat ${meetup.title}`}
                  onPress={() => openRoom(meetup.id)}
                  style={({ pressed }) => [styles.room, pressed && styles.pressed]}
                >
                  <View style={[styles.avatar, { backgroundColor: meetup.color }]}>
                    <FontAwesome name={meetupIcon(meetup)} size={19} color={AppColors.surface} />
                    {room.onlineCount > 0 ? <View style={styles.onlineDot} /> : null}
                  </View>
                  <View style={styles.roomCopy}>
                    <View style={styles.roomTop}>
                      <Text numberOfLines={1} style={styles.roomTitle}>{meetup.title}</Text>
                      <Text style={[styles.time, room.unread > 0 && styles.timeUnread]}>{lastMessage ? formatMessageTime(lastMessage.createdAt) : ''}</Text>
                    </View>
                    <View style={styles.roomBottom}>
                      <Text numberOfLines={2} style={[styles.preview, room.unread > 0 && styles.previewUnread]}>
                        {sender && lastMessage?.type !== 'system' ? `${sender}: ` : ''}{preview}
                      </Text>
                      {room.unread > 0 ? <View style={styles.unread}><Text style={styles.unreadText}>{room.unread > 99 ? '99+' : room.unread}</Text></View> : null}
                    </View>
                    <Text style={styles.roomMeta}>{meetup.participants.length} thành viên · {room.onlineCount} đang online</Text>
                  </View>
                  <FontAwesome name="angle-right" size={17} color="#B3A497" />
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><FontAwesome name="commenting-o" size={29} color={AppColors.accent} /></View>
            <Text style={styles.emptyTitle}>Chưa có phòng chat nào</Text>
            <Text style={styles.emptyText}>Tham gia một meetup để chào hỏi và thống nhất kế hoạch với cả nhóm.</Text>
            <AppButton label="Khám phá meetup" icon="compass" onPress={() => router.push('/explore')} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.background },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 34, flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { ...TypeScale.caption, fontFamily: FontFamily.bodySemiBold, color: AppColors.accent, letterSpacing: 1 },
  heading: { ...TypeScale.h1, color: AppColors.text, marginTop: 1 },
  subtitle: { ...TypeScale.body, color: AppColors.textSecondary, marginTop: 3 },
  headerIcon: { width: 48, height: 48, borderRadius: 18, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  list: { marginTop: 24 },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 },
  listTitle: { ...TypeScale.h3, fontFamily: FontFamily.headingBold, color: AppColors.text },
  room: { minHeight: 100, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 13, backgroundColor: AppColors.surface, borderWidth: 1, borderColor: AppColors.border, borderRadius: Radius.lg, marginBottom: 11, ...WarmShadow },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
  avatar: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  onlineDot: { position: 'absolute', right: -2, bottom: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: AppColors.success, borderWidth: 3, borderColor: AppColors.surface },
  roomCopy: { flex: 1, minWidth: 0 },
  roomTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roomTitle: { ...TypeScale.label, fontFamily: FontFamily.headingBold, color: AppColors.text, flex: 1 },
  time: { fontFamily: FontFamily.body, fontSize: 10, color: AppColors.textSecondary },
  timeUnread: { color: AppColors.accent, fontFamily: FontFamily.bodySemiBold },
  roomBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  preview: { ...TypeScale.caption, color: AppColors.textSecondary, flex: 1 },
  previewUnread: { color: AppColors.text, fontFamily: FontFamily.bodyMedium },
  unread: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: AppColors.accent, alignItems: 'center', justifyContent: 'center' },
  unreadText: { fontFamily: FontFamily.bodySemiBold, fontSize: 10, color: AppColors.surface },
  roomMeta: { fontFamily: FontFamily.body, fontSize: 9, color: '#A39282', marginTop: 4 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 90 },
  loadingText: { ...TypeScale.body, color: AppColors.textSecondary },
  empty: { flex: 1, minHeight: 420, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { ...TypeScale.h2, color: AppColors.text, marginTop: 18, textAlign: 'center' },
  emptyText: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center', maxWidth: 290, marginTop: 7, marginBottom: 20 },
});
