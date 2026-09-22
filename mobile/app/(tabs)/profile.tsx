import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { type Href, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, AppInput, Badge, BottomSheet, Chip, IconButton, SurfaceCard } from '@/components/ui/app-primitives';
import { AppColors, FontFamily, Radius, TypeScale } from '@/constants/theme';
import { useDemoApp } from '@/context/demo-app-context';
import { formatDate, type DemoUser, type Meetup, type Review } from '@/data/demo-data';

const avatar = require('@/assets/images/profile-minh-anh.png');
const INTERESTS = ['Café', 'Startup', 'Rooftop', 'Board game', 'Nhóm nhỏ', 'Karaoke', 'Networking', 'Ăn uống'];
const REPORT_TYPES = ['An toàn', 'Hành vi', 'Thông tin sai', 'Khác'];
type SheetName = 'edit' | 'interests' | 'hosted' | 'reviews' | 'safety' | 'blocked' | 'report' | 'settings' | null;

export default function ProfileScreen() {
  const router = useRouter();
  const {
    state,
    updateProfile,
    updateInterests,
    setNotificationsEnabled,
    unblockUser,
    resetDemoData,
    signOut,
    notify,
  } = useDemoApp();
  const profile = state.profile;
  const profileInitials = profile.name.trim().split(/\s+/).slice(-2).map((part) => part.charAt(0)).join('').toUpperCase() || 'B';
  const [sheet, setSheet] = useState<SheetName>(null);
  const [editValues, setEditValues] = useState({ name: profile.name, username: profile.username, bio: profile.bio, city: profile.city });
  const [editError, setEditError] = useState('');
  const [interestDraft, setInterestDraft] = useState<string[]>(profile.interests);
  const [interestError, setInterestError] = useState('');
  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [reportText, setReportText] = useState('');
  const [reportError, setReportError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const hostedMeetups = useMemo(() => state.meetups.filter((meetup) => meetup.hostId === profile.id), [profile.id, state.meetups]);
  const joinedCount = useMemo(() => state.meetups.filter((meetup) => meetup.participants.some((participant) => participant.id === profile.id)).length, [profile.id, state.meetups]);
  const friends = useMemo(() => state.friendIds
    .map((userId) => state.users.find((user) => user.id === userId))
    .filter((user): user is DemoUser => !!user), [state.friendIds, state.users]);
  const averageRating = state.reviews.length
    ? (state.reviews.reduce((sum, review) => sum + review.rating, 0) / state.reviews.length).toFixed(1)
    : '—';

  function closeSheet() {
    setSheet(null);
    setConfirmReset(false);
  }

  function openEdit() {
    setEditValues({ name: profile.name, username: profile.username, bio: profile.bio, city: profile.city });
    setEditError('');
    setSheet('edit');
  }

  function saveProfile() {
    const username = editValues.username.trim().replace(/^@/, '');
    if (editValues.name.trim().length < 2) return setEditError('Họ tên cần ít nhất 2 ký tự.');
    if (!/^[a-zA-Z0-9_.]{3,20}$/.test(username)) return setEditError('Username cần 3–20 chữ, số, dấu chấm hoặc gạch dưới.');
    if (!editValues.city.trim()) return setEditError('Vui lòng nhập thành phố.');
    if (editValues.bio.trim().length > 160) return setEditError('Giới thiệu không được quá 160 ký tự.');
    updateProfile({ ...editValues, username, name: editValues.name.trim(), bio: editValues.bio.trim(), city: editValues.city.trim() });
    closeSheet();
  }

  function openInterests() {
    setInterestDraft(profile.interests);
    setInterestError('');
    setSheet('interests');
  }

  function toggleInterest(value: string) {
    setInterestDraft((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
    setInterestError('');
  }

  function saveInterests() {
    if (!interestDraft.length) return setInterestError('Chọn ít nhất một sở thích để mọi người dễ tìm kèo hợp gu.');
    updateInterests(interestDraft);
    closeSheet();
  }

  function openMeetup(meetupId: string) {
    closeSheet();
    router.push({ pathname: '/meetup/[id]', params: { id: meetupId } });
  }

  function submitReport() {
    if (reportText.trim().length < 10) return setReportError('Mô tả thêm ít nhất 10 ký tự để đội ngũ có thể hỗ trợ.');
    notify('Đã gửi báo cáo. Đội ngũ sẽ xem xét sớm nhất có thể.');
    setReportText('');
    setReportType(REPORT_TYPES[0]);
    setReportError('');
    closeSheet();
  }

  function logout() {
    closeSheet();
    signOut();
    router.replace('/signin');
  }

  const firstHosted = hostedMeetups[0];
  const firstReview = state.reviews[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>TÀI KHOẢN</Text><Text style={styles.heading}>Hồ sơ của tôi</Text></View>
          <IconButton icon="cog" accessibilityLabel="Mở cài đặt" onPress={() => setSheet('settings')} />
        </View>

        <SurfaceCard style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            {profile.avatarUri
              ? <Image source={{ uri: profile.avatarUri }} style={styles.avatar} contentFit="cover" />
              : profile.id === 'user-minh-anh'
              ? <Image source={avatar} style={styles.avatar} contentFit="cover" />
              : <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: profile.avatarColor }]}><Text style={styles.avatarInitials}>{profileInitials}</Text></View>}
            <View style={styles.online} />
          </View>
          <View style={styles.nameRow}><Text style={styles.name}>{profile.name}</Text>{profile.verified ? <FontAwesome name="check-circle" size={18} color={AppColors.success} /> : null}</View>
          <Text style={styles.handle}>@{profile.username} · {profile.city}</Text>
          <Text style={styles.bio}>{profile.bio || 'Chưa có lời giới thiệu. Hãy kể một chút về bạn nhé!'}</Text>
          <View style={styles.badges}>{profile.verified ? <Badge label="Đã xác minh" tone="green" icon="shield" /> : null}<Badge label="Host thân thiện" tone="amber" icon="star" /></View>
          <AppButton label="Chỉnh sửa hồ sơ" variant="secondary" icon="pencil" onPress={openEdit} />
        </SurfaceCard>

        <View style={styles.stats}>
          <Stat value={averageRating} label="Đánh giá" icon="star" />
          <Stat value={String(joinedCount)} label="Đã tham gia" icon="users" />
          <Stat value={String(hostedMeetups.length)} label="Đã tổ chức" icon="calendar-check-o" last />
        </View>

        <SectionHeader title="Bạn bè" action="Xem tất cả" onPress={() => router.push('/friends' as Href)} />
        {state.receivedFriendRequestIds.length ? (
          <Pressable accessibilityRole="button" onPress={() => router.push('/friends?tab=requests' as Href)} style={({ pressed }) => [styles.requestNotice, pressed && styles.pressed]}>
            <View style={styles.requestIcon}><FontAwesome name="user-plus" size={16} color={AppColors.accent} /></View>
            <View style={styles.listCopy}><Text style={styles.requestTitle}>{state.receivedFriendRequestIds.length} lời mời kết bạn mới</Text><Text style={styles.requestText}>Xem và phản hồi lời mời đang chờ.</Text></View>
            <FontAwesome name="angle-right" size={18} color={AppColors.accent} />
          </Pressable>
        ) : null}
        <View style={styles.friendList}>
          {friends.slice(0, 3).map((user) => <FriendPreview key={user.id} user={user} mutual={user.friendIds.filter((friendId) => state.friendIds.includes(friendId)).length} onPress={() => router.push({ pathname: '/profile/[id]', params: { id: user.id } })} />)}
          {!friends.length ? <EmptyInline text="Chưa có bạn bè. Mở trung tâm bạn bè để xem gợi ý." /> : null}
        </View>

        <SectionHeader title="Sở thích" action="Chỉnh sửa" onPress={openInterests} />
        <View style={styles.chips}>
          {profile.interests.length ? profile.interests.map((item) => <Chip key={item} label={item} selected onPress={openInterests} />) : <EmptyInline text="Chưa chọn sở thích" />}
        </View>

        <SectionHeader title="Kèo đã tổ chức" action="Xem tất cả" onPress={() => setSheet('hosted')} />
        {firstHosted ? (
          <Pressable onPress={() => openMeetup(firstHosted.id)} style={({ pressed }) => pressed && styles.pressed}>
            <HostedMeetupCard meetup={firstHosted} />
          </Pressable>
        ) : <EmptyCard icon="calendar-o" text="Bạn chưa tổ chức meetup nào." />}

        <SectionHeader title="Nhận xét gần đây" action={`${state.reviews.length} nhận xét`} onPress={() => setSheet('reviews')} />
        {firstReview ? (
          <Pressable onPress={() => setSheet('reviews')} style={({ pressed }) => pressed && styles.pressed}><ReviewCard review={firstReview} /></Pressable>
        ) : <EmptyCard icon="star-o" text="Chưa có nhận xét nào." />}

        <Text style={styles.sectionTitle}>An toàn & hỗ trợ</Text>
        <Menu icon="shield" title="Trung tâm an toàn" subtitle="Hướng dẫn gặp gỡ và liên hệ hỗ trợ" onPress={() => setSheet('safety')} />
        <Menu icon="ban" title="Quản lý tài khoản đã chặn" subtitle={`${state.blockedUsers.length} tài khoản trong danh sách`} onPress={() => setSheet('blocked')} />
        <Menu icon="flag-o" title="Báo cáo sự cố" subtitle="Gửi báo cáo cho đội ngũ kiểm duyệt" danger onPress={() => setSheet('report')} />

        <Text style={styles.sectionTitle}>Cài đặt</Text>
        <Menu icon="sliders" title="Tùy chọn tài khoản" subtitle="Thông báo, dữ liệu demo và đăng xuất" onPress={() => setSheet('settings')} />
      </ScrollView>

      <BottomSheet visible={sheet === 'edit'} title="Chỉnh sửa hồ sơ" onClose={closeSheet}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
            <AppInput label="Họ tên" value={editValues.name} onChangeText={(name) => { setEditValues((current) => ({ ...current, name })); setEditError(''); }} placeholder="Họ tên" />
            <AppInput label="Username" value={editValues.username} onChangeText={(username) => { setEditValues((current) => ({ ...current, username })); setEditError(''); }} autoCapitalize="none" placeholder="username" />
            <AppInput label="Thành phố" value={editValues.city} onChangeText={(city) => { setEditValues((current) => ({ ...current, city })); setEditError(''); }} placeholder="TP. Hồ Chí Minh" />
            <AppInput label="Giới thiệu" value={editValues.bio} onChangeText={(bio) => { setEditValues((current) => ({ ...current, bio })); setEditError(''); }} multiline maxLength={160} placeholder="Một chút về bạn..." />
            <Text style={styles.counter}>{editValues.bio.length}/160</Text>
            {editError ? <Text accessibilityRole="alert" style={styles.sheetError}>{editError}</Text> : null}
            <AppButton label="Lưu thay đổi" icon="check" onPress={saveProfile} />
          </ScrollView>
        </KeyboardAvoidingView>
      </BottomSheet>

      <BottomSheet visible={sheet === 'interests'} title="Sở thích của bạn" onClose={closeSheet}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetHint}>Chọn nhiều mục để nhận gợi ý meetup hợp gu hơn.</Text>
          <View style={styles.chips}>{INTERESTS.map((item) => <Chip key={item} label={item} selected={interestDraft.includes(item)} onPress={() => toggleInterest(item)} />)}</View>
          {interestError ? <Text accessibilityRole="alert" style={styles.sheetError}>{interestError}</Text> : null}
          <AppButton label="Lưu sở thích" icon="check" onPress={saveInterests} />
        </View>
      </BottomSheet>

      <BottomSheet visible={sheet === 'hosted'} title="Kèo đã tổ chức" onClose={closeSheet}>
        <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetList}>
          {hostedMeetups.length ? hostedMeetups.map((meetup) => (
            <Pressable key={meetup.id} onPress={() => openMeetup(meetup.id)} style={({ pressed }) => [styles.listRow, pressed && styles.pressed]}>
              <View style={styles.listIcon}><FontAwesome name="calendar" size={16} color={AppColors.accent} /></View>
              <View style={styles.listCopy}><Text style={styles.listTitle}>{meetup.title}</Text><Text style={styles.listMeta}>{formatDate(meetup.date)} · {meetup.time} · {meetup.district}</Text></View>
              <FontAwesome name="angle-right" size={18} color="#AA998A" />
            </Pressable>
          )) : <EmptyInline text="Bạn chưa tổ chức meetup nào." />}
        </ScrollView>
      </BottomSheet>

      <BottomSheet visible={sheet === 'reviews'} title="Nhận xét về bạn" onClose={closeSheet}>
        <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetList}>
          {state.reviews.length ? state.reviews.map((review) => <ReviewCard key={review.id} review={review} />) : <EmptyInline text="Chưa có nhận xét nào." />}
        </ScrollView>
      </BottomSheet>

      <BottomSheet visible={sheet === 'safety'} title="Trung tâm an toàn" onClose={closeSheet}>
        <View style={styles.sheetContent}>
          <SafetyTip icon="map-marker" title="Gặp ở nơi công cộng" text="Ưu tiên quán café, nhà hàng hoặc không gian đông người và dễ tìm." />
          <SafetyTip icon="share-alt" title="Chia sẻ kế hoạch" text="Báo cho người thân biết địa điểm và thời gian bạn dự kiến trở về." />
          <SafetyTip icon="hand-stop-o" title="Tin vào cảm nhận của bạn" text="Bạn luôn có thể rời meetup hoặc báo cáo nếu thấy không thoải mái." />
          <AppButton label="Đã hiểu" variant="secondary" onPress={closeSheet} />
        </View>
      </BottomSheet>

      <BottomSheet visible={sheet === 'blocked'} title="Tài khoản đã chặn" onClose={closeSheet}>
        <View style={styles.sheetContent}>
          {state.blockedUsers.length ? state.blockedUsers.map((user) => (
            <View key={user.id} style={styles.blockedRow}>
              <View style={[styles.userAvatar, { backgroundColor: user.avatarColor }]}><Text style={styles.userInitial}>{user.name.charAt(0)}</Text></View>
              <View style={styles.listCopy}><Text style={styles.listTitle}>{user.name}</Text><Text style={styles.listMeta}>@{user.username}</Text></View>
              <AppButton label="Bỏ chặn" compact variant="ghost" onPress={() => unblockUser(user.id)} />
            </View>
          )) : <EmptyInline text="Bạn chưa chặn tài khoản nào." />}
        </View>
      </BottomSheet>

      <BottomSheet visible={sheet === 'report'} title="Báo cáo sự cố" onClose={closeSheet}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.fieldLabel}>Loại vấn đề</Text>
            <View style={styles.chips}>{REPORT_TYPES.map((item) => <Chip key={item} label={item} selected={reportType === item} onPress={() => setReportType(item)} />)}</View>
            <AppInput label="Mô tả" multiline maxLength={500} value={reportText} onChangeText={(value) => { setReportText(value); setReportError(''); }} placeholder="Cho chúng mình biết điều gì đã xảy ra..." />
            <Text style={styles.counter}>{reportText.length}/500</Text>
            {reportError ? <Text accessibilityRole="alert" style={styles.sheetError}>{reportError}</Text> : null}
            <AppButton label="Gửi báo cáo" icon="paper-plane" variant="destructive" onPress={submitReport} />
          </ScrollView>
        </KeyboardAvoidingView>
      </BottomSheet>

      <BottomSheet visible={sheet === 'settings'} title="Cài đặt" onClose={closeSheet}>
        <View style={styles.sheetContent}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}><FontAwesome name="bell-o" size={16} color={AppColors.accent} /></View>
            <View style={styles.listCopy}><Text style={styles.listTitle}>Thông báo</Text><Text style={styles.listMeta}>Tin nhắn và thay đổi từ meetup</Text></View>
            <Switch
              accessibilityLabel="Bật hoặc tắt thông báo"
              onValueChange={(enabled) => { setNotificationsEnabled(enabled); notify(enabled ? 'Đã bật thông báo.' : 'Đã tắt thông báo.'); }}
              thumbColor={AppColors.surface}
              trackColor={{ false: AppColors.disabled, true: AppColors.accent }}
              value={state.notificationsEnabled}
            />
          </View>
          <Text style={styles.settingNote}>ChillWithHomies hiện dùng giao diện sáng ấm trên mọi thiết bị.</Text>
          {confirmReset ? (
            <View style={styles.confirmBox}>
              <Text style={styles.confirmTitle}>Khôi phục dữ liệu demo?</Text>
              <Text style={styles.confirmText}>Meetup, chat và hồ sơ đã chỉnh sửa sẽ trở về trạng thái ban đầu.</Text>
              <View style={styles.confirmActions}><AppButton label="Hủy" compact variant="ghost" onPress={() => setConfirmReset(false)} /><AppButton label="Khôi phục" compact variant="destructive" onPress={() => { resetDemoData(); setConfirmReset(false); closeSheet(); }} /></View>
            </View>
          ) : <AppButton label="Khôi phục dữ liệu demo" icon="refresh" variant="ghost" onPress={() => setConfirmReset(true)} />}
          <AppButton label="Đăng xuất" icon="sign-out" variant="destructive" onPress={logout} />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

function Stat({ value, label, icon, last = false }: { value: string; label: string; icon: React.ComponentProps<typeof FontAwesome>['name']; last?: boolean }) {
  return <View style={[styles.stat, last && styles.statLast]}><FontAwesome name={icon} size={14} color={AppColors.primary} /><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function SectionHeader({ title, action, onPress }: { title: string; action: string; onPress: () => void }) {
  return <View style={styles.sectionHeader}><Text style={styles.sectionHeaderTitle}>{title}</Text><Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && styles.pressed}><Text style={styles.sectionAction}>{action}</Text></Pressable></View>;
}

function FriendPreview({ user, mutual, onPress }: { user: DemoUser; mutual: number; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Xem hồ sơ ${user.name}`} onPress={onPress} style={({ pressed }) => [styles.friendRow, pressed && styles.pressed]}><View style={[styles.friendAvatar, { backgroundColor: user.avatarColor }]}><Text style={styles.friendInitial}>{user.name.split(' ').slice(-2).map((part) => part.charAt(0)).join('').toUpperCase()}</Text></View><View style={styles.listCopy}><View style={styles.friendNameRow}><Text style={styles.friendName}>{user.name}</Text>{user.verified ? <FontAwesome name="check-circle" size={13} color={AppColors.success} /> : null}</View><Text style={styles.friendMeta}>@{user.username}{mutual ? ` · ${mutual} bạn chung` : ''}</Text></View><FontAwesome name="angle-right" size={17} color="#AA998A" /></Pressable>;
}

function Menu({ icon, title, subtitle, danger = false, onPress }: { icon: React.ComponentProps<typeof FontAwesome>['name']; title: string; subtitle: string; danger?: boolean; onPress: () => void }) {
  const color = danger ? AppColors.danger : AppColors.accent;
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.menu, pressed && styles.menuPressed]}><View style={[styles.menuIcon, { backgroundColor: danger ? AppColors.dangerSoft : AppColors.accentSoft }]}><FontAwesome name={icon} size={16} color={color} /></View><View style={styles.listCopy}><Text style={[styles.menuTitle, danger && { color }]}>{title}</Text><Text style={styles.menuSub}>{subtitle}</Text></View><FontAwesome name="angle-right" size={18} color="#AA998A" /></Pressable>;
}

function HostedMeetupCard({ meetup }: { meetup: Meetup }) {
  const [, month, day] = meetup.date.split('-');
  return <SurfaceCard style={styles.hostedCard}><View style={styles.calendarBox}><Text style={styles.month}>THG {Number(month)}</Text><Text style={styles.day}>{day}</Text></View><View style={styles.listCopy}><Text style={styles.hostedTitle}>{meetup.title}</Text><Text style={styles.hostedMeta}>{meetup.time} · {meetup.district} · {meetup.participants.length}/{meetup.maxParticipants} người</Text></View><Badge label={meetup.dateLabel} tone="orange" /></SurfaceCard>;
}

function ReviewCard({ review }: { review: Review }) {
  return <SurfaceCard style={styles.reviewCard}><View style={styles.reviewTop}><View style={styles.reviewAvatar}><Text style={styles.reviewInitial}>{review.author.charAt(0)}</Text></View><View style={styles.listCopy}><Text style={styles.reviewer}>{review.author}</Text><Text style={styles.reviewDate}>{review.date}</Text></View><View style={styles.rating}><FontAwesome name="star" size={12} color={AppColors.primary} /><Text style={styles.ratingText}>{review.rating.toFixed(1)}</Text></View></View><Text style={styles.reviewText}>“{review.text}”</Text></SurfaceCard>;
}

function SafetyTip({ icon, title, text }: { icon: React.ComponentProps<typeof FontAwesome>['name']; title: string; text: string }) {
  return <View style={styles.tip}><View style={styles.tipIcon}><FontAwesome name={icon} size={17} color={AppColors.accent} /></View><View style={styles.listCopy}><Text style={styles.listTitle}>{title}</Text><Text style={styles.tipText}>{text}</Text></View></View>;
}

function EmptyCard({ icon, text }: { icon: React.ComponentProps<typeof FontAwesome>['name']; text: string }) {
  return <SurfaceCard style={styles.emptyCard}><FontAwesome name={icon} size={19} color={AppColors.textSecondary} /><Text style={styles.emptyText}>{text}</Text></SurfaceCard>;
}

function EmptyInline({ text }: { text: string }) {
  return <View style={styles.emptyInline}><FontAwesome name="inbox" size={18} color={AppColors.textSecondary} /><Text style={styles.emptyText}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.background },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 42 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { ...TypeScale.caption, fontFamily: FontFamily.bodySemiBold, color: AppColors.accent, letterSpacing: 1 },
  heading: { ...TypeScale.h1, color: AppColors.text },
  profileCard: { marginTop: 18, padding: 20, alignItems: 'center' },
  avatarWrap: { width: 92, height: 92 },
  avatar: { width: 92, height: 92, borderRadius: 30 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontFamily: FontFamily.headingBold, fontSize: 27, color: AppColors.surface },
  online: { position: 'absolute', right: -1, bottom: 3, width: 19, height: 19, borderRadius: 10, backgroundColor: AppColors.success, borderWidth: 3, borderColor: AppColors.surface },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  name: { ...TypeScale.h2, color: AppColors.text },
  handle: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 2 },
  bio: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center', marginTop: 12, marginBottom: 13, maxWidth: 380 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 7, marginBottom: 16 },
  stats: { flexDirection: 'row', backgroundColor: AppColors.text, borderRadius: Radius.lg, paddingVertical: 16, marginTop: 14 },
  stat: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#57493F', gap: 2 },
  statLast: { borderRightWidth: 0 },
  statValue: { fontFamily: FontFamily.headingBold, fontSize: 18, color: AppColors.surface },
  statLabel: { fontFamily: FontFamily.body, fontSize: 10, color: '#D6C9BD' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 27, marginBottom: 11 },
  sectionHeaderTitle: { ...TypeScale.h3, fontFamily: FontFamily.headingBold, color: AppColors.text },
  sectionTitle: { ...TypeScale.h3, fontFamily: FontFamily.headingBold, color: AppColors.text, marginTop: 27, marginBottom: 11 },
  sectionAction: { ...TypeScale.caption, fontFamily: FontFamily.bodySemiBold, color: AppColors.accent, paddingVertical: 8, paddingLeft: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  requestNotice: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, borderRadius: Radius.md, backgroundColor: AppColors.accentSoft, borderWidth: 1, borderColor: '#F2D9B5', marginBottom: 9 },
  requestIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: AppColors.surface, alignItems: 'center', justifyContent: 'center' },
  requestTitle: { ...TypeScale.label, color: AppColors.text },
  requestText: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 2 },
  friendList: { gap: 8 },
  friendRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 10, borderRadius: Radius.md, borderWidth: 1, borderColor: AppColors.border, backgroundColor: AppColors.surface },
  friendAvatar: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  friendInitial: { fontFamily: FontFamily.headingBold, fontSize: 14, color: AppColors.surface },
  friendNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  friendName: { ...TypeScale.label, color: AppColors.text },
  friendMeta: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 2 },
  hostedCard: { padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  calendarBox: { width: 48, height: 50, borderRadius: 13, backgroundColor: AppColors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  month: { fontFamily: FontFamily.bodySemiBold, fontSize: 8, color: '#966700' },
  day: { fontFamily: FontFamily.headingBold, fontSize: 18, color: AppColors.text },
  hostedTitle: { ...TypeScale.label, color: AppColors.text },
  hostedMeta: { fontFamily: FontFamily.body, fontSize: 10, lineHeight: 15, color: AppColors.textSecondary, marginTop: 2 },
  reviewCard: { padding: 16 },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: AppColors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  reviewInitial: { fontFamily: FontFamily.headingBold, color: AppColors.text },
  reviewer: { ...TypeScale.label, color: AppColors.text },
  reviewDate: { fontFamily: FontFamily.body, fontSize: 9, color: AppColors.textSecondary },
  rating: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  ratingText: { ...TypeScale.label, color: AppColors.text },
  reviewText: { ...TypeScale.body, color: AppColors.textSecondary, marginTop: 12 },
  menu: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: AppColors.border, borderRadius: Radius.sm },
  menuPressed: { backgroundColor: AppColors.section, opacity: 0.78 },
  menuIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  menuTitle: { ...TypeScale.label, color: AppColors.text },
  menuSub: { fontFamily: FontFamily.body, fontSize: 10, lineHeight: 15, color: AppColors.textSecondary, marginTop: 2 },
  listCopy: { flex: 1, minWidth: 0 },
  sheetScroll: { maxHeight: 520 },
  sheetContent: { gap: 14, paddingBottom: 4 },
  sheetList: { gap: 10, paddingBottom: 4 },
  sheetHint: { ...TypeScale.body, color: AppColors.textSecondary },
  sheetError: { ...TypeScale.caption, color: AppColors.dangerText, backgroundColor: AppColors.dangerSoft, borderRadius: Radius.sm, padding: 10 },
  counter: { ...TypeScale.caption, color: AppColors.textSecondary, textAlign: 'right', marginTop: -9 },
  fieldLabel: { ...TypeScale.label, color: AppColors.text },
  listRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 11, borderWidth: 1, borderColor: AppColors.border, borderRadius: Radius.md, backgroundColor: AppColors.surface },
  listIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.accentSoft },
  listTitle: { ...TypeScale.label, color: AppColors.text },
  listMeta: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 2 },
  blockedRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 10 },
  userAvatar: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  userInitial: { fontFamily: FontFamily.headingBold, color: AppColors.surface, fontSize: 17 },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 13, borderRadius: Radius.md, backgroundColor: AppColors.section },
  tipIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.surface },
  tipText: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 3 },
  settingRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 11 },
  settingIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.accentSoft },
  settingNote: { ...TypeScale.caption, color: AppColors.textSecondary, backgroundColor: AppColors.section, padding: 11, borderRadius: Radius.sm },
  confirmBox: { gap: 10, padding: 14, borderRadius: Radius.md, backgroundColor: AppColors.dangerSoft, borderWidth: 1, borderColor: '#F3C7C0' },
  confirmTitle: { ...TypeScale.label, color: AppColors.dangerText },
  confirmText: { ...TypeScale.caption, color: AppColors.textSecondary },
  confirmActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  emptyCard: { minHeight: 82, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  emptyInline: { minHeight: 72, alignItems: 'center', justifyContent: 'center', gap: 7, padding: 12 },
  emptyText: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
});
