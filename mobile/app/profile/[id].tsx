import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, Badge, BottomSheet, IconButton, SurfaceCard } from '@/components/ui/app-primitives';
import { AppColors, FontFamily, Radius, TypeScale, WarmShadow } from '@/constants/theme';
import { useDemoApp } from '@/context/demo-app-context';
import { formatDate, type DemoUser } from '@/data/demo-data';

type Sheet = 'friend-menu' | 'block' | null;

export default function PublicProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const { state, hydrated, sendFriendRequest, cancelFriendRequest, acceptFriendRequest, rejectFriendRequest, unfriendUser, blockUser, notify } = useDemoApp();
  const [sheet, setSheet] = useState<Sheet>(null);
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;
  const user = state.users.find((item) => item.id === userId);
  const isCurrentUser = userId === state.profile.id;
  const isFriend = !!userId && state.friendIds.includes(userId);
  const isSent = !!userId && state.sentFriendRequestIds.includes(userId);
  const isReceived = !!userId && state.receivedFriendRequestIds.includes(userId);
  const isBlocked = !!userId && state.blockedUsers.some((item) => item.id === userId);

  const attended = useMemo(() => state.meetups.filter((meetup) => meetup.participants.some((participant) => participant.id === userId)), [state.meetups, userId]);
  const hosted = useMemo(() => state.meetups.filter((meetup) => meetup.hostId === userId), [state.meetups, userId]);
  const commonMeetups = useMemo(() => attended.filter((meetup) => meetup.participants.some((participant) => participant.id === state.profile.id)), [attended, state.profile.id]);
  const mutualFriends = useMemo(() => user?.friendIds.filter((friendId) => state.friendIds.includes(friendId)) ?? [], [state.friendIds, user]);
  const mutualUsers = mutualFriends.map((friendId) => state.users.find((item) => item.id === friendId)).filter((item): item is DemoUser => !!item);
  const goBack = () => router.canGoBack() ? router.back() : router.replace('/');
  const run = (action: () => { ok: boolean; error?: string }) => {
    const result = action();
    if (!result.ok && result.error) notify(result.error);
  };

  if (!hydrated) return <View style={styles.loading}><ActivityIndicator color={AppColors.accent} /></View>;
  if (!state.currentUser) return <Redirect href="/signin" />;

  if (!user) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.notFound}><View style={styles.notFoundIcon}><FontAwesome name="user-times" size={28} color={AppColors.accent} /></View><Text style={styles.heading}>Không tìm thấy hồ sơ</Text><Text style={styles.body}>Tài khoản này có thể không còn trong dữ liệu demo.</Text><AppButton label="Về trang chủ" icon="home" onPress={() => router.replace('/')} /></View></SafeAreaView>;
  }

  const block = () => { run(() => blockUser(user.id)); setSheet(null); };
  const unfriend = () => { run(() => unfriendUser(user.id)); setSheet(null); };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><IconButton icon="chevron-left" accessibilityLabel="Quay lại" onPress={goBack} /><Text style={styles.headerTitle}>Hồ sơ thành viên</Text><View style={styles.headerSpacer} /></View>

        <SurfaceCard style={styles.profileCard}>
          {user.avatarUri ? <Image source={{ uri: user.avatarUri }} style={styles.avatar} contentFit="cover" /> : <View style={[styles.avatar, { backgroundColor: user.avatarColor }]}><Text style={styles.avatarText}>{initials(user.name)}</Text></View>}
          <View style={styles.nameRow}><Text style={styles.name}>{user.name}</Text>{user.verified ? <FontAwesome name="check-circle" size={18} color={AppColors.success} /> : null}</View>
          <Text style={styles.handle}>@{user.username} · {user.city}</Text>
          <Text style={styles.bio}>{isBlocked ? 'Nội dung hồ sơ được giới hạn vì bạn đã chặn người dùng này.' : user.bio}</Text>
          <View style={styles.badges}>{user.verified ? <Badge label="Đã xác minh" tone="green" icon="shield" /> : <Badge label="Thành viên" tone="neutral" icon="user" />}{isFriend ? <Badge label="Bạn bè" tone="amber" icon="users" /> : null}{isBlocked ? <Badge label="Đã chặn" tone="neutral" icon="ban" /> : null}</View>

          <View style={styles.actions}>
            {isCurrentUser ? <AppButton label="Mở hồ sơ của tôi" icon="user" variant="secondary" onPress={() => router.replace('/profile')} /> : null}
            {!isCurrentUser && isBlocked ? <View style={styles.blockedNotice}><FontAwesome name="ban" size={16} color={AppColors.danger} /><View style={{ flex: 1 }}><Text style={styles.blockedTitle}>Bạn đã chặn người dùng này</Text><Text style={styles.blockedText}>Bạn có thể bỏ chặn trong Tôi → Quản lý tài khoản đã chặn.</Text></View></View> : null}
            {!isCurrentUser && !isBlocked && isReceived ? <View style={styles.actionRow}><View style={styles.actionCell}><AppButton label="Từ chối" variant="ghost" onPress={() => run(() => rejectFriendRequest(user.id))} /></View><View style={styles.actionCell}><AppButton label="Chấp nhận" icon="check" onPress={() => run(() => acceptFriendRequest(user.id))} /></View></View> : null}
            {!isCurrentUser && !isBlocked && isFriend ? <AppButton label="Bạn bè" icon="check" variant="secondary" onPress={() => setSheet('friend-menu')} /> : null}
            {!isCurrentUser && !isBlocked && isSent ? <AppButton label="Đã gửi lời mời · Hủy" icon="clock-o" variant="secondary" onPress={() => run(() => cancelFriendRequest(user.id))} /> : null}
            {!isCurrentUser && !isBlocked && !isFriend && !isSent && !isReceived ? <AppButton label="Kết bạn" icon="user-plus" onPress={() => run(() => sendFriendRequest(user.id))} /> : null}
            {!isCurrentUser && !isBlocked && !isFriend ? <AppButton label="Chặn người dùng" icon="ban" variant="ghost" onPress={() => setSheet('block')} /> : null}
          </View>
        </SurfaceCard>

        {!isBlocked ? <>
          <View style={styles.stats}><Stat value={String(attended.length)} label="Đã tham gia" /><Stat value={String(hosted.length)} label="Đã tổ chức" /><Stat value={String(mutualFriends.length)} label="Bạn chung" last /></View>

          <Text style={styles.sectionTitle}>Sở thích</Text>
          <View style={styles.tags}>{user.interests.map((interest) => <Badge key={interest} label={interest} tone="neutral" />)}</View>

          <View style={styles.sectionHeader}><Text style={styles.sectionTitleInline}>Kết nối chung</Text><Text style={styles.sectionCount}>{mutualFriends.length} bạn · {commonMeetups.length} meetup</Text></View>
          {mutualUsers.length ? <SurfaceCard style={styles.mutualCard}><View style={styles.avatarStack}>{mutualUsers.slice(0, 4).map((friend, index) => <View key={friend.id} style={[styles.mutualAvatar, { backgroundColor: friend.avatarColor, marginLeft: index ? -9 : 0 }]}><Text style={styles.mutualInitial}>{friend.name.charAt(0)}</Text></View>)}</View><View style={{ flex: 1 }}><Text style={styles.mutualTitle}>{mutualUsers.map((friend) => friend.name).join(', ')}</Text><Text style={styles.mutualText}>{mutualFriends.length} người bạn chung trong cộng đồng</Text></View></SurfaceCard> : <View style={styles.emptyInline}><FontAwesome name="users" size={16} color={AppColors.textSecondary} /><Text style={styles.emptyText}>Chưa có bạn chung.</Text></View>}

          <View style={styles.sectionHeader}><Text style={styles.sectionTitleInline}>Meetup chung</Text><Text style={styles.sectionCount}>{commonMeetups.length} kèo</Text></View>
          {commonMeetups.length ? commonMeetups.slice(0, 3).map((meetup) => <Pressable key={meetup.id} accessibilityRole="button" accessibilityLabel={`Xem meetup ${meetup.title}`} onPress={() => router.push({ pathname: '/meetup/[id]', params: { id: meetup.id } })} style={({ pressed }) => [styles.meetupRow, pressed && styles.pressed]}><View style={styles.calendar}><Text style={styles.calendarDay}>{meetup.date.split('-')[2]}</Text><Text style={styles.calendarMonth}>THG {Number(meetup.date.split('-')[1])}</Text></View><View style={styles.rowCopy}><Text style={styles.meetupTitle}>{meetup.title}</Text><Text style={styles.meetupMeta}>{formatDate(meetup.date)} · {meetup.time} · {meetup.district}</Text></View><FontAwesome name="angle-right" size={18} color="#AA998A" /></Pressable>) : <View style={styles.emptyInline}><FontAwesome name="calendar-o" size={16} color={AppColors.textSecondary} /><Text style={styles.emptyText}>Hai bạn chưa tham gia meetup nào cùng nhau.</Text></View>}

          <View style={styles.safety}><FontAwesome name="shield" size={17} color={AppColors.success} /><Text style={styles.safetyText}>Chỉ kết bạn với người bạn nhận ra. Bạn luôn có thể hủy kết bạn hoặc chặn nếu thấy không thoải mái.</Text></View>
        </> : null}
      </ScrollView>

      <BottomSheet visible={sheet === 'friend-menu'} title={`Bạn bè với ${user.name}`} onClose={() => setSheet(null)}><View style={styles.sheetContent}><View style={styles.sheetUser}><View style={[styles.sheetAvatar, { backgroundColor: user.avatarColor }]}><Text style={styles.sheetAvatarText}>{initials(user.name)}</Text></View><View><Text style={styles.sheetName}>{user.name}</Text><Text style={styles.sheetHandle}>@{user.username}</Text></View></View><AppButton label="Hủy kết bạn" icon="user-times" variant="ghost" onPress={unfriend} /><AppButton label="Chặn người dùng" icon="ban" variant="destructive" onPress={() => setSheet('block')} /></View></BottomSheet>

      <BottomSheet visible={sheet === 'block'} title="Xác nhận chặn" onClose={() => setSheet(null)}><View style={styles.confirm}><View style={styles.confirmIcon}><FontAwesome name="ban" size={22} color={AppColors.danger} /></View><Text style={styles.confirmTitle}>Chặn {user.name}?</Text><Text style={styles.confirmText}>Friendship và mọi lời mời hai chiều sẽ bị xóa. Tin nhắn của người này trong chat nhóm sẽ được thu gọn.</Text><View style={styles.confirmActions}><View style={styles.actionCell}><AppButton label="Hủy" variant="ghost" onPress={() => setSheet(null)} /></View><View style={styles.actionCell}><AppButton label="Chặn" variant="destructive" onPress={block} /></View></View></View></BottomSheet>
    </SafeAreaView>
  );
}

function Stat({ value, label, last = false }: { value: string; label: string; last?: boolean }) {
  return <View style={[styles.stat, last && styles.statLast]}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function initials(name: string) {
  return name.split(' ').slice(-2).map((part) => part.charAt(0)).join('').toUpperCase();
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.background },
  safeArea: { flex: 1, backgroundColor: AppColors.background },
  content: { paddingHorizontal: 18, paddingBottom: 44 },
  header: { minHeight: 68, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { ...TypeScale.h3, color: AppColors.text, flex: 1, textAlign: 'center' },
  headerSpacer: { width: 46 },
  profileCard: { padding: 20, alignItems: 'center' },
  avatar: { width: 88, height: 88, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: AppColors.surface },
  avatarText: { fontFamily: FontFamily.headingBold, color: AppColors.surface, fontSize: 27 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  name: { ...TypeScale.h2, color: AppColors.text },
  handle: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 2 },
  bio: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center', marginTop: 13, maxWidth: 360 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 7, marginTop: 14 },
  actions: { alignSelf: 'stretch', gap: 8, marginTop: 18 },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionCell: { flex: 1 },
  blockedNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 13, borderRadius: Radius.md, backgroundColor: AppColors.dangerSoft },
  blockedTitle: { ...TypeScale.label, color: AppColors.dangerText },
  blockedText: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 2 },
  stats: { flexDirection: 'row', backgroundColor: AppColors.text, borderRadius: Radius.lg, paddingVertical: 16, marginTop: 14 },
  stat: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#57493F' },
  statLast: { borderRightWidth: 0 },
  statValue: { fontFamily: FontFamily.headingBold, fontSize: 18, color: AppColors.surface },
  statLabel: { fontFamily: FontFamily.body, fontSize: 10, color: '#D6C9BD', marginTop: 2 },
  sectionTitle: { ...TypeScale.h3, fontFamily: FontFamily.headingBold, color: AppColors.text, marginTop: 25, marginBottom: 11 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 25, marginBottom: 11, gap: 10 },
  sectionTitleInline: { ...TypeScale.h3, fontFamily: FontFamily.headingBold, color: AppColors.text },
  sectionCount: { ...TypeScale.caption, color: AppColors.accent, textAlign: 'right' },
  mutualCard: { minHeight: 72, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarStack: { flexDirection: 'row', paddingLeft: 8 },
  mutualAvatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: AppColors.surface, alignItems: 'center', justifyContent: 'center' },
  mutualInitial: { fontFamily: FontFamily.headingBold, fontSize: 12, color: AppColors.surface },
  mutualTitle: { ...TypeScale.label, color: AppColors.text },
  mutualText: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 2 },
  meetupRow: { minHeight: 70, marginBottom: 9, borderWidth: 1, borderColor: AppColors.border, borderRadius: Radius.md, backgroundColor: AppColors.surface, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 11, ...WarmShadow },
  calendar: { width: 46, height: 48, borderRadius: 13, backgroundColor: AppColors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  calendarDay: { fontFamily: FontFamily.headingBold, color: AppColors.text, fontSize: 17 },
  calendarMonth: { fontFamily: FontFamily.bodySemiBold, color: '#966700', fontSize: 8 },
  rowCopy: { flex: 1, minWidth: 0 },
  meetupTitle: { ...TypeScale.label, color: AppColors.text },
  meetupMeta: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 3 },
  emptyInline: { minHeight: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: Radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: AppColors.border, padding: 13 },
  emptyText: { ...TypeScale.caption, color: AppColors.textSecondary, textAlign: 'center' },
  safety: { marginTop: 22, padding: 14, borderRadius: Radius.md, backgroundColor: AppColors.successSoft, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  safetyText: { ...TypeScale.caption, color: AppColors.textSecondary, flex: 1 },
  sheetContent: { gap: 10 },
  sheetUser: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingBottom: 5 },
  sheetAvatar: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  sheetAvatarText: { fontFamily: FontFamily.headingBold, color: AppColors.surface },
  sheetName: { ...TypeScale.label, color: AppColors.text },
  sheetHandle: { ...TypeScale.caption, color: AppColors.textSecondary },
  confirm: { alignItems: 'center' },
  confirmIcon: { width: 62, height: 62, borderRadius: 22, backgroundColor: AppColors.dangerSoft, alignItems: 'center', justifyContent: 'center' },
  confirmTitle: { ...TypeScale.h2, color: AppColors.text, marginTop: 13 },
  confirmText: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center', marginTop: 6, maxWidth: 340 },
  confirmActions: { alignSelf: 'stretch', flexDirection: 'row', gap: 9, marginTop: 19 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 },
  notFoundIcon: { width: 64, height: 64, borderRadius: 22, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  heading: { ...TypeScale.h1, color: AppColors.text, textAlign: 'center' },
  body: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center' },
  pressed: { opacity: 0.74 },
});
