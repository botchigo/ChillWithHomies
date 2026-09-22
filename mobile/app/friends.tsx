import { FontAwesome } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, BottomSheet, IconButton, SurfaceCard } from '@/components/ui/app-primitives';
import { AppColors, FontFamily, Radius, TypeScale, WarmShadow } from '@/constants/theme';
import { calculateFriendSuggestionScore, describeFriendRelationship, describeFriendRequest, describeFriendSuggestion } from '@/src/features/matching/services/friend-matching';
import { useSocialGraph } from '@/src/features/profile/hooks/use-social-graph';
import type { DemoUser } from '@/src/features/profile/types';
import { useSafety } from '@/src/features/safety/hooks/use-safety';

type FriendsTab = 'friends' | 'requests' | 'suggestions';

export default function FriendsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const {
    state,
    hydrated,
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    unfriendUser,
    notify,
  } = useSocialGraph();
  const { blockUser } = useSafety();
  const initialTab: FriendsTab = params.tab === 'requests' || params.tab === 'suggestions' ? params.tab : 'friends';
  const [tab, setTab] = useState<FriendsTab>(initialTab);
  const [selectedUser, setSelectedUser] = useState<DemoUser | null>(null);
  const [confirmBlock, setConfirmBlock] = useState(false);

  const friends = useMemo(() => state.friendIds
    .map((userId) => state.users.find((user) => user.id === userId))
    .filter((user): user is DemoUser => !!user), [state.friendIds, state.users]);
  const received = useMemo(() => state.receivedFriendRequestIds
    .map((userId) => state.users.find((user) => user.id === userId))
    .filter((user): user is DemoUser => !!user), [state.receivedFriendRequestIds, state.users]);
  const sent = useMemo(() => state.sentFriendRequestIds
    .map((userId) => state.users.find((user) => user.id === userId))
    .filter((user): user is DemoUser => !!user), [state.sentFriendRequestIds, state.users]);
  const suggestions = useMemo(() => {
    const excluded = new Set([
      state.profile.id,
      ...state.friendIds,
      ...state.sentFriendRequestIds,
      ...state.receivedFriendRequestIds,
      ...state.blockedUsers.map((user) => user.id),
    ]);
    return state.users
      .filter((user) => !excluded.has(user.id))
      .sort((a, b) => calculateFriendSuggestionScore(b, state) - calculateFriendSuggestionScore(a, state));
  }, [state]);

  const goBack = () => router.canGoBack() ? router.back() : router.replace('/profile');
  const openProfile = (userId: string) => router.push({ pathname: '/profile/[id]', params: { id: userId } });
  const run = (action: () => { ok: boolean; error?: string }) => {
    const result = action();
    if (!result.ok && result.error) notify(result.error);
  };
  const closeMenu = () => { setSelectedUser(null); setConfirmBlock(false); };
  const blockSelected = () => {
    if (!selectedUser) return;
    run(() => blockUser(selectedUser.id));
    closeMenu();
  };

  if (!hydrated) return <View style={styles.loading}><ActivityIndicator color={AppColors.accent} /></View>;
  if (!state.currentUser) return <Redirect href="/signin" />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <IconButton icon="angle-left" accessibilityLabel="Quay lại hồ sơ" onPress={goBack} />
        <View style={styles.headerCopy}><Text style={styles.eyebrow}>KẾT NỐI</Text><Text style={styles.heading}>Bạn bè</Text></View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.tabs}>
        <Tab label="Bạn bè" count={friends.length} selected={tab === 'friends'} onPress={() => setTab('friends')} />
        <Tab label="Lời mời" count={received.length + sent.length} selected={tab === 'requests'} onPress={() => setTab('requests')} />
        <Tab label="Gợi ý" count={suggestions.length} selected={tab === 'suggestions'} onPress={() => setTab('suggestions')} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'friends' ? (
          <>
            <SectionIntro title={`${friends.length} người bạn`} text="Những người bạn đã kết nối qua các buổi meetup." />
            {friends.map((user) => (
              <UserCard key={user.id} user={user} context={describeFriendRelationship(user, state.friendIds)} onOpen={() => openProfile(user.id)}>
                <IconButton icon="ellipsis-h" accessibilityLabel={`Mở tùy chọn với ${user.name}`} onPress={() => setSelectedUser(user)} />
              </UserCard>
            ))}
            {!friends.length ? <EmptyState icon="users" title="Chưa có bạn bè" text="Mở tab Gợi ý để tìm những người có chung meetup hoặc sở thích." action="Xem gợi ý" onPress={() => setTab('suggestions')} /> : null}
          </>
        ) : null}

        {tab === 'requests' ? (
          <>
            <SectionIntro title="Lời mời dành cho bạn" text="Chấp nhận nếu bạn nhận ra người đã gặp trong cộng đồng." />
            {received.map((user) => (
              <UserCard key={user.id} user={user} context={describeFriendRequest(user, state)} onOpen={() => openProfile(user.id)}>
                <View style={styles.inlineActions}>
                  <AppButton label="Từ chối" compact variant="ghost" onPress={() => run(() => rejectFriendRequest(user.id))} />
                  <AppButton label="Chấp nhận" compact onPress={() => run(() => acceptFriendRequest(user.id))} />
                </View>
              </UserCard>
            ))}
            {!received.length ? <EmptyInline text="Không có lời mời mới." /> : null}

            <Text style={styles.subsectionTitle}>Đã gửi</Text>
            {sent.map((user) => (
              <UserCard key={user.id} user={user} context="Đang chờ phản hồi" onOpen={() => openProfile(user.id)}>
                <AppButton label="Hủy lời mời" compact variant="secondary" onPress={() => run(() => cancelFriendRequest(user.id))} />
              </UserCard>
            ))}
            {!sent.length ? <EmptyInline text="Bạn chưa gửi lời mời nào đang chờ." /> : null}
          </>
        ) : null}

        {tab === 'suggestions' ? (
          <>
            <SectionIntro title="Có thể bạn biết" text="Gợi ý dựa trên meetup chung, bạn chung và sở thích giống nhau." />
            {suggestions.map((user) => (
              <UserCard key={user.id} user={user} context={describeFriendSuggestion(user, state)} onOpen={() => openProfile(user.id)}>
                <AppButton label="Kết bạn" icon="user-plus" compact onPress={() => run(() => sendFriendRequest(user.id))} />
              </UserCard>
            ))}
            {!suggestions.length ? <EmptyState icon="check-circle" title="Bạn đã xem hết gợi ý" text="Các kết nối mới sẽ xuất hiện khi có thêm thành viên phù hợp." /> : null}
          </>
        ) : null}
      </ScrollView>

      <BottomSheet visible={!!selectedUser} title={selectedUser?.name ?? 'Tùy chọn bạn bè'} onClose={closeMenu}>
        {selectedUser ? (
          <View style={styles.sheetContent}>
            {confirmBlock ? (
              <View style={styles.confirmBox}>
                <View style={styles.confirmIcon}><FontAwesome name="ban" size={20} color={AppColors.danger} /></View>
                <Text style={styles.confirmTitle}>Chặn {selectedUser.name}?</Text>
                <Text style={styles.confirmText}>Hai bạn sẽ tự động hủy kết bạn và mọi lời mời đang chờ sẽ bị xóa.</Text>
                <View style={styles.confirmActions}><AppButton label="Quay lại" compact variant="ghost" onPress={() => setConfirmBlock(false)} /><AppButton label="Chặn" compact variant="destructive" onPress={blockSelected} /></View>
              </View>
            ) : (
              <>
                <AppButton label="Xem hồ sơ" icon="user" variant="secondary" onPress={() => { closeMenu(); openProfile(selectedUser.id); }} />
                <AppButton label="Hủy kết bạn" icon="user-times" variant="ghost" onPress={() => { run(() => unfriendUser(selectedUser.id)); closeMenu(); }} />
                <AppButton label="Chặn người dùng" icon="ban" variant="destructive" onPress={() => setConfirmBlock(true)} />
              </>
            )}
          </View>
        ) : null}
      </BottomSheet>
    </SafeAreaView>
  );
}

function Tab({ label, count, selected, onPress }: { label: string; count: number; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="tab" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.tab, selected && styles.tabSelected, pressed && styles.pressed]}><Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>{label}</Text>{count ? <View style={[styles.tabCount, selected && styles.tabCountSelected]}><Text style={[styles.tabCountText, selected && styles.tabCountTextSelected]}>{count}</Text></View> : null}</Pressable>;
}

function UserCard({ user, context, onOpen, children }: { user: DemoUser; context: string; onOpen: () => void; children: React.ReactNode }) {
  return (
    <SurfaceCard style={styles.userCard}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Xem hồ sơ ${user.name}`} onPress={onOpen} style={({ pressed }) => [styles.userMain, pressed && styles.pressed]}>
        <View style={[styles.avatar, { backgroundColor: user.avatarColor }]}><Text style={styles.avatarText}>{initials(user.name)}</Text></View>
        <View style={styles.userCopy}><View style={styles.nameRow}><Text numberOfLines={1} style={styles.userName}>{user.name}</Text>{user.verified ? <FontAwesome name="check-circle" size={14} color={AppColors.success} /> : null}</View><Text style={styles.username}>@{user.username}</Text><Text numberOfLines={1} style={styles.context}>{context}</Text></View>
      </Pressable>
      <View style={styles.cardAction}>{children}</View>
    </SurfaceCard>
  );
}

function SectionIntro({ title, text }: { title: string; text: string }) {
  return <View style={styles.intro}><Text style={styles.introTitle}>{title}</Text><Text style={styles.introText}>{text}</Text></View>;
}

function EmptyInline({ text }: { text: string }) {
  return <View style={styles.emptyInline}><FontAwesome name="inbox" size={17} color={AppColors.textSecondary} /><Text style={styles.emptyInlineText}>{text}</Text></View>;
}

function EmptyState({ icon, title, text, action, onPress }: { icon: React.ComponentProps<typeof FontAwesome>['name']; title: string; text: string; action?: string; onPress?: () => void }) {
  return <View style={styles.empty}><View style={styles.emptyIcon}><FontAwesome name={icon} size={28} color={AppColors.accent} /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyText}>{text}</Text>{action && onPress ? <AppButton label={action} compact variant="secondary" onPress={onPress} /> : null}</View>;
}

function initials(name: string) {
  return name.split(' ').slice(-2).map((part) => part.charAt(0)).join('').toUpperCase();
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.background },
  header: { minHeight: 72, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: AppColors.border, backgroundColor: AppColors.surface },
  headerCopy: { flex: 1, alignItems: 'center' },
  headerSpacer: { width: 46 },
  eyebrow: { fontFamily: FontFamily.bodySemiBold, fontSize: 9, letterSpacing: 1, color: AppColors.accent },
  heading: { ...TypeScale.h2, color: AppColors.text },
  tabs: { flexDirection: 'row', gap: 6, padding: 8, marginHorizontal: 16, marginTop: 14, borderRadius: Radius.md, backgroundColor: AppColors.section },
  tab: { flex: 1, minHeight: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  tabSelected: { backgroundColor: AppColors.surface, ...WarmShadow },
  tabLabel: { ...TypeScale.caption, fontFamily: FontFamily.bodyMedium, color: AppColors.textSecondary },
  tabLabelSelected: { color: AppColors.text, fontFamily: FontFamily.bodySemiBold },
  tabCount: { minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.border },
  tabCountSelected: { backgroundColor: AppColors.accent },
  tabCountText: { fontFamily: FontFamily.bodySemiBold, fontSize: 9, color: AppColors.textSecondary },
  tabCountTextSelected: { color: AppColors.surface },
  content: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 40 },
  intro: { marginBottom: 14 },
  introTitle: { ...TypeScale.h3, fontFamily: FontFamily.headingBold, color: AppColors.text },
  introText: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 3 },
  userCard: { minHeight: 86, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, padding: 11, marginBottom: 10 },
  userMain: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: FontFamily.headingBold, fontSize: 17, color: AppColors.surface },
  userCopy: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  userName: { ...TypeScale.label, fontFamily: FontFamily.headingBold, color: AppColors.text, flexShrink: 1 },
  username: { fontFamily: FontFamily.body, fontSize: 10, color: AppColors.textSecondary, marginTop: 1 },
  context: { ...TypeScale.caption, color: AppColors.accentText, marginTop: 4 },
  cardAction: { flexShrink: 0, marginLeft: 'auto' },
  inlineActions: { flexDirection: 'row', gap: 5 },
  subsectionTitle: { ...TypeScale.h3, color: AppColors.text, marginTop: 24, marginBottom: 11 },
  emptyInline: { minHeight: 72, borderRadius: Radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: AppColors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14 },
  emptyInlineText: { ...TypeScale.caption, color: AppColors.textSecondary },
  empty: { minHeight: 310, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 8 },
  emptyIcon: { width: 66, height: 66, borderRadius: 24, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { ...TypeScale.h2, color: AppColors.text, textAlign: 'center', marginTop: 7 },
  emptyText: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center', marginBottom: 8 },
  sheetContent: { gap: 10 },
  confirmBox: { alignItems: 'center', gap: 9 },
  confirmIcon: { width: 54, height: 54, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.dangerSoft },
  confirmTitle: { ...TypeScale.h2, color: AppColors.text, textAlign: 'center' },
  confirmText: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center', maxWidth: 320 },
  confirmActions: { alignSelf: 'stretch', flexDirection: 'row', gap: 9, marginTop: 8 },
  pressed: { opacity: 0.74 },
});
