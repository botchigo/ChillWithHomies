import { FontAwesome } from '@expo/vector-icons';
import { Redirect, type Href, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, IconButton, SurfaceCard } from '@/components/ui/app-primitives';
import { AppColors, FontFamily, Radius, TypeScale } from '@/constants/theme';
import { useNotifications } from '@/src/features/notifications/hooks/use-notifications';
import type { DemoNotification } from '@/src/features/notifications/types';
import { formatMessageTime } from '@/src/shared/utils/formatters';

export default function NotificationsScreen() {
  const router = useRouter();
  const { currentUser, notifications, hydrated, markNotificationRead, markAllNotificationsRead } = useNotifications();
  const unread = notifications.filter((notification) => !notification.read).length;
  const goBack = () => router.canGoBack() ? router.back() : router.replace('/');

  const openNotification = (notification: DemoNotification) => {
    markNotificationRead(notification.id);
    if (notification.type === 'friend_request') {
      router.push('/friends?tab=requests' as Href);
      return;
    }
    if (notification.type === 'friend_accepted' && notification.userId) {
      router.push({ pathname: '/profile/[id]', params: { id: notification.userId } });
      return;
    }
    if (notification.type === 'meetup' && notification.meetupId) {
      router.push({ pathname: '/meetup/[id]', params: { id: notification.meetupId } });
      return;
    }
    if (notification.type === 'chat' && notification.meetupId) {
      router.push({ pathname: '/chat/[meetupId]', params: { meetupId: notification.meetupId } });
    }
  };

  if (!hydrated) return <View style={styles.loading}><ActivityIndicator color={AppColors.accent} /></View>;
  if (!currentUser) return <Redirect href="/signin" />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <IconButton icon="angle-left" accessibilityLabel="Quay lại" onPress={goBack} />
        <View style={styles.headerCopy}><Text style={styles.eyebrow}>CẬP NHẬT MỚI</Text><Text style={styles.heading}>Thông báo</Text></View>
        <View style={styles.headerAction}>{unread ? <AppButton label="Đọc hết" compact variant="ghost" onPress={markAllNotificationsRead} /> : null}</View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summary}><View style={styles.summaryIcon}><FontAwesome name="bell" size={18} color={AppColors.accent} /></View><View style={{ flex: 1 }}><Text style={styles.summaryTitle}>{unread ? `${unread} thông báo chưa đọc` : 'Bạn đã đọc hết thông báo'}</Text><Text style={styles.summaryText}>Lời mời bạn bè, meetup và tin nhắn nhóm đều ở đây.</Text></View></View>
        {notifications.map((notification) => (
          <Pressable key={notification.id} accessibilityRole="button" accessibilityLabel={notification.title} onPress={() => openNotification(notification)} style={({ pressed }) => pressed && styles.pressed}>
            <SurfaceCard style={[styles.notification, !notification.read && styles.notificationUnread]}>
              <View style={[styles.icon, { backgroundColor: iconTone(notification.type) }]}><FontAwesome name={iconName(notification.type)} size={17} color={iconColor(notification.type)} /></View>
              <View style={styles.copy}><View style={styles.titleRow}><Text style={[styles.title, !notification.read && styles.titleUnread]}>{notification.title}</Text>{!notification.read ? <View style={styles.unreadDot} /> : null}</View><Text style={styles.description}>{notification.description}</Text><Text style={styles.time}>{formatMessageTime(notification.createdAt)}</Text></View>
              <FontAwesome name="angle-right" size={17} color="#AA998A" />
            </SurfaceCard>
          </Pressable>
        ))}
        {!notifications.length ? <View style={styles.empty}><View style={styles.emptyIcon}><FontAwesome name="bell-o" size={29} color={AppColors.accent} /></View><Text style={styles.emptyTitle}>Chưa có thông báo</Text><Text style={styles.emptyText}>Khi có lời mời kết bạn hoặc cập nhật meetup, bạn sẽ thấy tại đây.</Text></View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function iconName(type: DemoNotification['type']): React.ComponentProps<typeof FontAwesome>['name'] {
  if (type === 'friend_request') return 'user-plus';
  if (type === 'friend_accepted') return 'users';
  if (type === 'chat') return 'comments';
  return 'calendar';
}

function iconTone(type: DemoNotification['type']) {
  if (type === 'friend_accepted') return AppColors.successSoft;
  if (type === 'chat') return AppColors.infoSoft;
  return AppColors.accentSoft;
}

function iconColor(type: DemoNotification['type']) {
  if (type === 'friend_accepted') return AppColors.success;
  if (type === 'chat') return AppColors.info;
  return AppColors.accent;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.background },
  header: { minHeight: 72, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: AppColors.border, backgroundColor: AppColors.surface },
  headerCopy: { flex: 1, alignItems: 'center' },
  headerAction: { minWidth: 68, alignItems: 'flex-end' },
  eyebrow: { fontFamily: FontFamily.bodySemiBold, fontSize: 9, letterSpacing: 1, color: AppColors.accent },
  heading: { ...TypeScale.h2, color: AppColors.text },
  content: { padding: 16, paddingBottom: 40 },
  summary: { padding: 14, borderRadius: Radius.md, backgroundColor: AppColors.section, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 16 },
  summaryIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: AppColors.surface, alignItems: 'center', justifyContent: 'center' },
  summaryTitle: { ...TypeScale.label, color: AppColors.text },
  summaryText: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 2 },
  notification: { minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, marginBottom: 10 },
  notificationUnread: { borderColor: '#F2C768', backgroundColor: '#FFFDF7' },
  icon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  title: { ...TypeScale.label, color: AppColors.text, flex: 1 },
  titleUnread: { fontFamily: FontFamily.headingBold },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, backgroundColor: AppColors.accent },
  description: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 3 },
  time: { fontFamily: FontFamily.body, fontSize: 9, color: '#A39282', marginTop: 5 },
  pressed: { opacity: 0.74 },
  empty: { minHeight: 440, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  emptyIcon: { width: 68, height: 68, borderRadius: 25, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { ...TypeScale.h2, color: AppColors.text, marginTop: 16 },
  emptyText: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center', marginTop: 6, maxWidth: 300 },
});
