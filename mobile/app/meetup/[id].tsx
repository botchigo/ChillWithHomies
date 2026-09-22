import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Redirect, type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, AppInput, Badge, BottomSheet, Chip, IconButton, SurfaceCard } from '@/components/ui/app-primitives';
import { AppColors, FontFamily, Radius, TypeScale, WarmShadow } from '@/constants/theme';
import { useSafety } from '@/src/features/safety/hooks/use-safety';
import { useMeetupDetails } from '@/src/features/sessions/hooks/use-meetup-details';
import { buildMapUrl, estimateBillPerPerson, formatDistance, formatVND, getUnpaidShares } from '@/src/features/sessions/services/session-rules';
import type { MeetupStatus } from '@/src/features/sessions/types';
import type { UserSummary } from '@/src/features/profile/types';
import { formatTrustScore } from '@/src/features/trust/services/trust-score';
import { formatDate } from '@/src/shared/utils/formatters';

const cover = require('@/assets/images/meetup-rooftop.png');
const profileAvatar = require('@/assets/images/profile-minh-anh.png');

export default function MeetupDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { meetup, host, currentUser, hydrated, joinMeetup, leaveMeetup, toggleTableBooked, checkIn, setBillTotal, markMyPayment, confirmPayment, notify } = useMeetupDetails(params.id);
  const { emergencyLeave, sendSafetySignal } = useSafety();
  const [saved, setSaved] = useState(false);
  const [hostSheet, setHostSheet] = useState(false);
  const [billSheet, setBillSheet] = useState(false);
  const [billTotalInput, setBillTotalInput] = useState('');
  const [billError, setBillError] = useState('');

  const goBack = () => router.canGoBack() ? router.back() : router.replace('/');

  if (!hydrated) {
    return <View style={styles.loading}><ActivityIndicator color={AppColors.accent} /></View>;
  }

  if (!currentUser) return <Redirect href="/signin" />;

  if (!meetup) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundNav}><IconButton icon="angle-left" accessibilityLabel="Quay lại" onPress={goBack} /></View>
        <View style={styles.notFound}>
          <View style={styles.notFoundIcon}><FontAwesome name="calendar-times-o" size={32} color={AppColors.accent} /></View>
          <Text style={styles.notFoundTitle}>Không tìm thấy meetup</Text>
          <Text style={styles.notFoundText}>Kèo này có thể đã được gỡ hoặc đường dẫn chưa đúng.</Text>
          <View style={styles.notFoundAction}><AppButton label="Về Trang chủ" icon="home" onPress={() => router.replace('/')} /></View>
        </View>
      </SafeAreaView>
    );
  }

  const currentUserId = currentUser.id;
  const isHost = currentUserId === meetup.hostId;
  const isJoined = !!currentUserId && meetup.participants.some((participant) => participant.id === currentUserId);
  const canChat = isHost || isJoined;
  const isFull = meetup.participants.length >= meetup.maxParticipants;
  const isEnded = meetup.status === 'ended';
  const availableSeats = Math.max(0, meetup.maxParticipants - meetup.participants.length);

  const join = () => {
    const result = joinMeetup(meetup.id);
    if (!result.ok && result.error) notify(result.error);
  };
  const leave = () => {
    const result = leaveMeetup(meetup.id);
    if (!result.ok && result.error) notify(result.error);
  };
  const confirmLeave = () => {
    if (Platform.OS === 'web' && typeof globalThis.confirm === 'function') {
      if (globalThis.confirm(`Rời kèo này? Bạn sẽ mất cọc demo ${deposit.toLocaleString('vi-VN')}đ cho quỹ chung.`)) leave();
      return;
    }
    Alert.alert(
      'Rời kèo này?',
      deposit > 0 ? `Bạn sẽ mất cọc ${deposit.toLocaleString('vi-VN')}đ (demo) chia cho người ở lại.` : 'Bạn sẽ không còn thấy phòng chat của meetup trong danh sách.',
      [
        { text: 'Ở lại', style: 'cancel' },
        { text: 'Rời kèo', style: 'destructive', onPress: leave },
      ],
    );
  };
  const confirmEmergency = () => {
    if (Platform.OS === 'web' && typeof globalThis.confirm === 'function') {
      if (globalThis.confirm('Rời khẩn? App sẽ không báo tên bạn trong chat, chỉ báo chung.')) {
        const r = emergencyLeave(meetup.id);
        if (!r.ok && r.error) notify(r.error);
      }
      return;
    }
    Alert.alert('Rời khẩn an toàn?', 'Tên bạn sẽ không hiện trong chat. Vị trí quán được gửi cho người thân (demo).', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Rời khẩn', style: 'destructive', onPress: () => { const r = emergencyLeave(meetup.id); if (!r.ok && r.error) notify(r.error); } },
    ]);
  };
  const openChat = () => router.push(`/chat/${meetup.id}` as Href);
  const mapUrl = buildMapUrl(meetup.mapQuery || `${meetup.location} ${meetup.district}`);
  const billPerPerson = estimateBillPerPerson(meetup);
  const deposit = meetup.depositAmount ?? 0;
  const shares = meetup.billShares ?? [];
  const unpaid = getUnpaidShares(meetup);
  const checkedIn = meetup.checkedInIds ?? [];
  const myShare = shares.find((s) => s.userId === currentUserId);
  const iCheckedIn = !!currentUserId && checkedIn.includes(currentUserId);
  const submitBillTotal = () => {
    const total = Number(billTotalInput.replace(/[^\d]/g, ''));
    if (!total || total <= 0) {
      setBillError('Nhập tổng bill, ví dụ 850000.');
      return;
    }
    const res = setBillTotal(meetup.id, total);
    if (!res.ok) {
      setBillError(res.error ?? 'Không chốt được bill.');
      return;
    }
    setBillTotalInput('');
    setBillError('');
    setBillSheet(false);
  };
  const openMap = async () => {
    if (!mapUrl) {
      notify('Chưa có địa chỉ bản đồ cho kèo này.');
      return;
    }
    try {
      const ok = await Linking.canOpenURL(mapUrl);
      if (ok) await Linking.openURL(mapUrl);
      else notify('Không mở được bản đồ lúc này.');
    } catch {
      notify('Không mở được bản đồ lúc này.');
    }
  };
  const shareMeetup = async () => {
    try {
      await Share.share({ message: `${meetup.title} · ${meetup.dateLabel}, ${meetup.time} tại ${meetup.location}, ${meetup.district}.` });
    } catch {
      notify('Chưa thể mở bảng chia sẻ lúc này.');
    }
  };
  const toggleSaved = () => {
    setSaved((current) => !current);
    notify(saved ? 'Đã bỏ meetup khỏi danh sách lưu.' : 'Đã lưu meetup để xem lại.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.coverWrap}>
          <Image source={cover} style={styles.cover} contentFit="cover" />
          <View style={[styles.coverTint, { backgroundColor: meetup.color }]} />
          <View style={styles.coverShade} />
          <View style={styles.nav}><IconButton icon="angle-left" accessibilityLabel="Quay lại" onPress={goBack} /><View style={styles.navRight}><IconButton icon="share-alt" accessibilityLabel="Chia sẻ" onPress={() => void shareMeetup()} /><IconButton icon={saved ? 'bookmark' : 'bookmark-o'} accessibilityLabel={saved ? 'Bỏ lưu meetup' : 'Lưu meetup'} onPress={toggleSaved} /></View></View>
          <View style={styles.coverBadges}><Badge label={meetup.dateLabel} tone="amber" icon="clock-o" /><Badge label={`${meetup.participants.length}/${meetup.maxParticipants} người`} tone="neutral" icon="users" /></View>
        </View>

        <View style={styles.main}>
          <View style={styles.titleLine}><Text style={styles.title}>{meetup.title}</Text>{meetup.isPublic === false ? <Badge label="Riêng tư" tone="neutral" icon="lock" /> : null}<Badge label={statusLabel(meetup.status)} tone={meetup.status === 'ended' ? 'neutral' : 'green'} /></View>
          <Text style={styles.vibe}>{[meetup.alcoholType, ...meetup.vibe].filter(Boolean).join(' · ')}</Text>
          <View style={styles.tags}>
            {meetup.age18Plus ? <Badge label="18+" tone="neutral" icon="id-card" /> : null}
            {meetup.alcoholType ? <Badge label={meetup.alcoholType} tone="orange" icon="beer" /> : null}
            {meetup.tableBooked ? <Badge label="Đã đặt bàn" tone="green" icon="check" /> : <Badge label="Chưa đặt bàn" tone="neutral" icon="clock-o" />}
          </View>
          <View style={styles.tags}>{meetup.vibe.map((tag) => <Chip key={tag} label={tag} selected onPress={() => router.push({ pathname: '/explore', params: { q: tag } })} />)}</View>

          <SurfaceCard style={styles.infoCard}>
            <Info icon="calendar" title={`${meetup.dateLabel}, ${meetup.time}`} subtitle={`${formatDate(meetup.date)} · Có mặt trước 10 phút`} />
            <Info icon="map-marker" title={meetup.location} subtitle={`${meetup.district} · Cách bạn ${formatDistance(meetup.distanceKm)}`} actionLabel="Chỉ đường" onPress={openMap} />
            <Info icon="users" title={`${meetup.participants.length} người đã tham gia`} subtitle={availableSeats ? `Còn ${availableSeats} chỗ` : 'Kèo đã đủ người'} last />
          </SurfaceCard>

          <SurfaceCard style={styles.nhauCard}>
            <View style={styles.nhauRow}><FontAwesome name="beer" size={16} color={AppColors.accent} /><Text style={styles.nhauTitle}>Kèo nhậu</Text><View style={{ flex: 1 }} />{isHost ? <AppButton label={meetup.tableBooked ? 'Hủy đặt bàn' : 'Đã đặt bàn'} compact variant={meetup.tableBooked ? 'secondary' : 'ghost'} onPress={() => toggleTableBooked(meetup.id)} /> : null}</View>
            <Text style={styles.nhauText}>Uống: {meetup.alcoholType ?? 'Bia hơi'} · {meetup.drinkLimit ?? 'Tự lượng sức'}</Text>
            <Text style={styles.nhauText}>Bill: {meetup.paymentType}{meetup.billNote ? ` — ${meetup.billNote}` : ''}</Text>
            {billPerPerson ? <Text style={styles.nhauText}>Ước tính ~{formatVND(billPerPerson)}/người từ menu host gợi ý.</Text> : null}
            {(meetup.menuItems ?? []).length ? (
              <View style={styles.menuList}>
                {(meetup.menuItems ?? []).map((item, idx) => (
                  <View key={`${item.name}-${idx}`} style={styles.menuRow}><Text style={styles.menuName}>• {item.name}</Text><Text style={styles.menuPrice}>{item.price > 0 ? formatVND(item.price) : 'Giá tại quán'}</Text></View>
                ))}
              </View>
            ) : null}
            <View style={styles.nhauActions}>
              <AppButton label="Chỉ đường" icon="location-arrow" compact variant="secondary" onPress={openMap} />
              <AppButton label="Chốt bill trong chat" icon="money" compact variant="ghost" onPress={openChat} />
            </View>
          </SurfaceCard>

          <SurfaceCard style={styles.nhauCard}>
            <View style={styles.nhauRow}><FontAwesome name="lock" size={16} color={AppColors.success} /><Text style={styles.nhauTitle}>Quỹ cọc chống bùng</Text><View style={{ flex: 1 }} /><Badge label={deposit > 0 ? `${formatVND(deposit)}/người` : 'Không cọc'} tone={deposit > 0 ? 'green' : 'neutral'} icon="money" /></View>
            <Text style={styles.nhauText}>{deposit > 0 ? `Mỗi người khóa ${formatVND(deposit)} (demo) khi tham gia. Hủy sát giờ mất cọc chia cho người ở lại.` : 'Kèo này không yêu cầu cọc. Bật cọc ở kèo sau để chắc kèo hơn.'}</Text>
            <Text style={styles.nhauText}>Check-in tại quán: {checkedIn.length}/{meetup.participants.length} người. Chỉ người check-in mới được chia bill cuối.</Text>
            {canChat && !iCheckedIn ? <View style={styles.nhauActions}><AppButton label="Check-in tại quán" icon="map-marker" compact onPress={() => { const r = checkIn(meetup.id); if (!r.ok && r.error) notify(r.error); }} /></View> : null}
            {canChat && iCheckedIn ? <Text style={styles.checkedText}>✓ Bạn đã check-in tại quán.</Text> : null}
          </SurfaceCard>

          <SurfaceCard style={styles.nhauCard}>
            <View style={styles.nhauRow}><FontAwesome name="money" size={16} color={AppColors.accent} /><Text style={styles.nhauTitle}>Bill minh bạch</Text><View style={{ flex: 1 }} /><Badge label={meetup.billTotal ? formatVND(meetup.billTotal) : 'Chưa chốt'} tone={meetup.billTotal ? 'amber' : 'neutral'} icon="money" /></View>
            {meetup.billTotal ? (
              <>
                <Text style={styles.nhauText}>Tổng {formatVND(meetup.billTotal)} — còn {unpaid.length} người chưa trả{deposit > 0 ? ` (đã trừ cọc ${formatVND(deposit)}/người khi host xác nhận)` : ''}.</Text>
                <View style={styles.shareList}>
                  {shares.map((s) => {
                    const person = meetup.participants.find((p) => p.id === s.userId);
                    const name = person?.name ?? 'Thành viên';
                    return (
                      <View key={s.userId} style={styles.shareRow}>
                        <View style={{ flex: 1 }}><Text style={styles.shareName}>{name}{s.userId === currentUserId ? ' (bạn)' : ''}</Text><Text style={styles.shareSub}>{formatVND(s.amount)}{s.checkedIn === false ? ' · chưa check-in' : ''}</Text></View>
                        {s.paid ? <Badge label="Đã trả" tone="green" icon="check" /> : <Badge label="Chưa trả" tone="neutral" icon="clock-o" />}
                        {isHost && !s.paid ? <AppButton label="Xác nhận" compact variant="ghost" onPress={() => { const r = confirmPayment(meetup.id, s.userId); if (!r.ok && r.error) notify(r.error); }} /> : null}
                      </View>
                    );
                  })}
                </View>
                {canChat && myShare && !myShare.paid ? <View style={styles.nhauActions}><AppButton label="Tôi đã chuyển tiền" icon="check" compact onPress={() => { const r = markMyPayment(meetup.id); if (!r.ok && r.error) notify(r.error); }} /></View> : null}
              </>
            ) : (
              <>
                <Text style={styles.nhauText}>Host chụp bill giấy và nhập tổng để app tự chia Campuchia cho cả bàn.</Text>
                {isHost ? <View style={styles.nhauActions}><AppButton label="Nhập tổng bill" icon="money" compact onPress={() => { setBillTotalInput(meetup.billTotal ? String(meetup.billTotal) : ''); setBillError(''); setBillSheet(true); }} /></View> : <Text style={styles.nhauText}>Chờ host chốt bill sau khi gọi món xong.</Text>}
              </>
            )}
          </SurfaceCard>

          <Text style={styles.sectionTitle}>Host của meetup</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={`Xem hồ sơ ${meetup.hostName}`} onPress={() => setHostSheet(true)} style={({ pressed }) => pressed && styles.cardPressed}>
            <SurfaceCard style={styles.hostCard}>
              <HostAvatar name={meetup.hostName} color={meetup.hostAvatarColor} uri={meetup.hostAvatarUri} usePhoto={meetup.hostAvatar === 'profile-minh-anh'} />
              <View style={{ flex: 1 }}><View style={styles.hostName}><Text style={styles.hostTitle}>{meetup.hostName}</Text>{meetup.hostVerified ? <FontAwesome name="check-circle" size={15} color={AppColors.success} /> : null}</View><Text style={styles.hostMeta}>Host {meetup.hostVerified ? 'đã xác minh' : 'cộng đồng'} · @{findParticipant(meetup.participants, meetup.hostId)?.username ?? 'homie'}</Text><Text style={styles.hostQuote}>“Cứ đến là có bạn, còn lại để mình lo.”</Text></View>
              <View style={styles.hostArrow}><FontAwesome name="angle-right" size={17} color={AppColors.accent} /></View>
            </SurfaceCard>
          </Pressable>

          <Text style={styles.sectionTitle}>Về kèo nhậu</Text><Text style={styles.description}>{meetup.description}</Text>
          <View style={styles.details}><MiniDetail icon="tag" text={meetup.category} /><MiniDetail icon="money" text={meetup.paymentType} /><MiniDetail icon="beer" text={meetup.alcoholType ?? 'Bia hơi'} /></View>

          <View style={styles.memberHeader}><Text style={styles.sectionTitle}>Ai sẽ tham gia</Text><Text style={styles.memberCount}>{meetup.participants.length}/{meetup.maxParticipants} người</Text></View>
          <View style={styles.members}>
            {meetup.participants.slice(0, 5).map((participant, index) => <ParticipantAvatar key={participant.id} participant={participant} index={index} onPress={() => participant.id === currentUserId ? router.push('/profile') : router.push({ pathname: '/profile/[id]', params: { id: participant.id } })} />)}
            {meetup.participants.length > 5 ? <View style={[styles.memberAvatar, styles.extraAvatar, { marginLeft: -10 }]}><Text style={styles.memberLetter}>+{meetup.participants.length - 5}</Text></View> : null}
            <View style={[styles.openSeats, !availableSeats && styles.fullSeats]}>{availableSeats ? <FontAwesome name="plus" size={13} color={AppColors.textSecondary} /> : <FontAwesome name="check" size={12} color={AppColors.textSecondary} />}<Text style={styles.openText}>{availableSeats ? `${availableSeats} chỗ trống` : 'Đã đủ người'}</Text></View>
          </View>

          {canChat ? <Pressable accessibilityRole="button" onPress={openChat} style={({ pressed }) => [styles.chatCard, pressed && styles.cardPressed]}><View style={styles.chatIcon}><FontAwesome name="comments" size={18} color={AppColors.accent} /></View><View style={{ flex: 1 }}><Text style={styles.chatTitle}>Chat chốt kèo nhậu</Text><Text style={styles.chatText}>Chốt món, share vị trí quán và báo giờ tới.</Text></View><FontAwesome name="angle-right" size={18} color={AppColors.accent} /></Pressable> : null}

          <View style={styles.safety}><View style={styles.safetyIcon}><FontAwesome name="cab" size={18} color={AppColors.success} /></View><View style={{ flex: 1 }}><Text style={styles.safetyTitle}>Nhậu an toàn: đã uống không lái xe</Text><Text style={styles.safetyText}>Quán công cộng, 18+, không ép uống. Say thì đặt Grab về chung và báo người thân lịch về.</Text></View></View>
          <View style={styles.safetyActions}>
            <AppButton label="Grab về chung" icon="cab" compact variant="secondary" onPress={() => { const r = sendSafetySignal(meetup.id, 'grab'); if (!r.ok && r.error) notify(r.error); }} />
            <AppButton label="SOS người thân" icon="phone" compact variant="ghost" onPress={() => { const r = sendSafetySignal(meetup.id, 'sos'); if (!r.ok && r.error) notify(r.error); }} />
          </View>
          {canChat && !isHost ? <View style={styles.safetyActions}><AppButton label="Rời khẩn (giấu tên)" icon="sign-out" compact variant="ghost" onPress={confirmEmergency} /></View> : null}
          <Text style={styles.trustNote}>Uy tín host: {formatTrustScore(host?.reliabilityScore)} · {host?.completedKeos ?? 0} kèo đã xong. Bùng kèo bị trừ điểm và hạn chế join kèo cọc cao.</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {canChat ? (
          isHost ? <><View style={styles.bottomInfo}><Text style={styles.bottomLabel}>Bạn là host</Text><Text style={styles.bottomSub}>{meetup.participants.length}/{meetup.maxParticipants} thành viên</Text></View><View style={styles.cta}><AppButton label="Mở chat nhóm" icon="comments" compact onPress={openChat} /></View></>
            : <View style={styles.joinedActions}><View style={styles.actionCell}><AppButton label="Rời kèo" variant="ghost" compact onPress={confirmLeave} /></View><View style={styles.actionCell}><AppButton label="Mở chat nhóm" icon="comments" compact onPress={openChat} /></View></View>
        ) : <><View style={styles.bottomInfo}><Text style={styles.bottomLabel}>{meetup.paymentType}</Text><Text style={styles.bottomSub}>{availableSeats ? `Còn ${availableSeats} chỗ` : 'Không còn chỗ trống'}</Text></View><View style={styles.cta}><AppButton label={isEnded ? 'Đã kết thúc' : isFull ? 'Đã đủ người' : 'Tham gia meetup'} icon={!isEnded && !isFull ? 'arrow-right' : undefined} onPress={join} disabled={isEnded || isFull} /></View></>}
      </View>

      <BottomSheet visible={hostSheet} title="Hồ sơ host" onClose={() => setHostSheet(false)}>
        <View style={styles.hostProfile}>
          <HostAvatar name={meetup.hostName} color={meetup.hostAvatarColor} uri={meetup.hostAvatarUri} usePhoto={meetup.hostAvatar === 'profile-minh-anh'} large />
          <View style={styles.hostProfileName}><Text style={styles.hostProfileTitle}>{meetup.hostName}</Text>{meetup.hostVerified ? <FontAwesome name="check-circle" size={17} color={AppColors.success} /> : null}</View>
          <Text style={styles.hostProfileHandle}>@{findParticipant(meetup.participants, meetup.hostId)?.username ?? 'homie'} · TP. Hồ Chí Minh</Text>
          <Text style={styles.hostProfileBio}>Thích tạo những buổi gặp nhỏ, thân thiện và giúp người mới dễ bắt chuyện.</Text>
          <View style={styles.hostBadges}><Badge label={meetup.hostVerified ? 'Đã xác minh' : 'Host cộng đồng'} tone={meetup.hostVerified ? 'green' : 'amber'} icon="shield" /><Badge label="4.9 ★" tone="amber" /></View>
          <View style={styles.hostSheetAction}><AppButton label={isHost ? 'Xem hồ sơ của tôi' : 'Xem hồ sơ host'} variant="secondary" onPress={() => { setHostSheet(false); if (isHost) router.push('/profile'); else router.push({ pathname: '/profile/[id]', params: { id: meetup.hostId } }); }} /></View>
        </View>
      </BottomSheet>

      <BottomSheet visible={billSheet} title="Chốt tổng bill" onClose={() => { setBillSheet(false); setBillError(''); }}>
        <View style={styles.sheetForm}>
          <AppInput label="Tổng bill (VND)" value={billTotalInput} onChangeText={(v) => { setBillTotalInput(v); setBillError(''); }} keyboardType="number-pad" placeholder="Ví dụ: 850000" maxLength={10} />
          <Text style={styles.sheetHint}>App tự chia Campuchia cho {meetup.participants.length} người check-in/tham gia.</Text>
          {billError ? <Text style={styles.sheetError}>{billError}</Text> : null}
          <AppButton label="Chia bill cho cả bàn" icon="money" onPress={submitBillTotal} />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

function statusLabel(status: MeetupStatus) {
  if (status === 'ongoing') return 'Đang diễn ra';
  if (status === 'ended') return 'Đã kết thúc';
  return 'Sắp diễn ra';
}

function findParticipant(participants: UserSummary[], userId: string) {
  return participants.find((participant) => participant.id === userId);
}

function HostAvatar({ name, color, uri, usePhoto, large = false }: { name: string; color: string; uri?: string; usePhoto: boolean; large?: boolean }) {
  const sizeStyle = large ? styles.hostAvatarLarge : styles.hostAvatar;
  if (uri) return <Image source={{ uri }} style={sizeStyle} contentFit="cover" />;
  if (usePhoto) return <Image source={profileAvatar} style={sizeStyle} contentFit="cover" />;
  return <View style={[sizeStyle, styles.avatarFallback, { backgroundColor: color }]}><Text style={[styles.avatarFallbackText, large && styles.avatarFallbackTextLarge]}>{name.charAt(0)}</Text></View>;
}

function ParticipantAvatar({ participant, index, onPress }: { participant: UserSummary; index: number; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Xem hồ sơ ${participant.name}`} onPress={onPress} style={({ pressed }) => [styles.memberAvatar, { marginLeft: index ? -10 : 0, backgroundColor: participant.avatarColor, opacity: pressed ? 0.72 : 1 }]}>{participant.avatarUri ? <Image source={{ uri: participant.avatarUri }} style={styles.memberPhoto} contentFit="cover" /> : <Text style={styles.memberLetter}>{participant.name.charAt(0)}</Text>}</Pressable>;
}

function Info({ icon, title, subtitle, last = false, actionLabel, onPress }: { icon: React.ComponentProps<typeof FontAwesome>['name']; title: string; subtitle: string; last?: boolean; actionLabel?: string; onPress?: () => void }) { return <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}><View style={styles.infoIcon}><FontAwesome name={icon} size={16} color={AppColors.accent} /></View><View style={styles.infoCopy}><Text style={styles.infoTitle}>{title}</Text><Text style={styles.infoSub}>{subtitle}</Text></View>{actionLabel && onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.infoAction, pressed && { opacity: 0.7 }]}><Text style={styles.infoActionText}>{actionLabel}</Text></Pressable> : null}</View>; }
function MiniDetail({ icon, text }: { icon: React.ComponentProps<typeof FontAwesome>['name']; text: string }) { return <View style={styles.miniDetail}><FontAwesome name={icon} size={14} color={AppColors.accent} /><Text numberOfLines={2} style={styles.miniText}>{text}</Text></View>; }

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.background },
  safeArea: { flex: 1, backgroundColor: AppColors.background }, content: { paddingBottom: 118 }, coverWrap: { height: 282, backgroundColor: AppColors.section }, cover: { width: '100%', height: '100%' }, coverTint: { ...StyleSheet.absoluteFill, opacity: 0.08 }, coverShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(47,36,28,0.18)' }, nav: { position: 'absolute', top: 12, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }, navRight: { flexDirection: 'row', gap: 8 }, coverBadges: { position: 'absolute', left: 18, right: 18, bottom: 16, flexDirection: 'row', justifyContent: 'space-between' },
  main: { paddingHorizontal: 18, paddingTop: 20 }, titleLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 }, title: { ...TypeScale.h1, color: AppColors.text, flex: 1 }, vibe: { ...TypeScale.body, color: AppColors.textSecondary, marginTop: 4 }, tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 15 },
  infoCard: { paddingHorizontal: 16, marginTop: 20 }, infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: AppColors.border }, infoIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center' }, infoCopy: { flex: 1 }, infoTitle: { ...TypeScale.label, color: AppColors.text }, infoSub: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 1 }, infoAction: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: AppColors.accentSoft }, infoActionText: { ...TypeScale.caption, fontFamily: FontFamily.bodySemiBold, color: AppColors.accent },
  nhauCard: { marginTop: 14, padding: 14, gap: 6 }, nhauRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, nhauTitle: { ...TypeScale.label, color: AppColors.text }, nhauText: { ...TypeScale.caption, color: AppColors.textSecondary }, checkedText: { ...TypeScale.caption, fontFamily: FontFamily.bodySemiBold, color: AppColors.success }, menuList: { marginTop: 8, gap: 4 }, menuRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, menuName: { ...TypeScale.caption, color: AppColors.text, flex: 1 }, menuPrice: { ...TypeScale.caption, fontFamily: FontFamily.bodySemiBold, color: AppColors.accentText }, nhauActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }, safetyActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }, shareList: { marginTop: 8, gap: 8 }, shareRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: Radius.md, borderWidth: 1, borderColor: AppColors.border, backgroundColor: AppColors.surface }, shareName: { ...TypeScale.label, color: AppColors.text }, shareSub: { ...TypeScale.caption, color: AppColors.textSecondary }, trustNote: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 10 }, sheetForm: { gap: 12 }, sheetHint: { ...TypeScale.caption, color: AppColors.textSecondary }, sheetError: { ...TypeScale.caption, color: AppColors.danger },
  sectionTitle: { ...TypeScale.h3, fontFamily: FontFamily.headingBold, color: AppColors.text, marginTop: 26, marginBottom: 10 }, cardPressed: { opacity: 0.78 }, hostCard: { padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' }, hostAvatar: { width: 54, height: 54, borderRadius: 19 }, hostAvatarLarge: { width: 82, height: 82, borderRadius: 27 }, avatarFallback: { alignItems: 'center', justifyContent: 'center' }, avatarFallbackText: { color: AppColors.surface, fontFamily: FontFamily.headingBold, fontSize: 20 }, avatarFallbackTextLarge: { fontSize: 28 }, hostName: { flexDirection: 'row', gap: 5, alignItems: 'center' }, hostTitle: { ...TypeScale.label, color: AppColors.text }, hostMeta: { fontFamily: FontFamily.body, fontSize: 10, lineHeight: 15, color: AppColors.textSecondary }, hostQuote: { fontFamily: FontFamily.body, fontSize: 10, lineHeight: 15, color: AppColors.text, marginTop: 3 }, hostArrow: { width: 34, height: 34, borderRadius: 17, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  description: { ...TypeScale.body, color: AppColors.textSecondary }, details: { flexDirection: 'row', gap: 8, marginTop: 14 }, miniDetail: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: AppColors.section, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 }, miniText: { ...TypeScale.caption, color: AppColors.text, flex: 1 }, memberHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, memberCount: { ...TypeScale.caption, color: AppColors.textSecondary, marginBottom: 11 }, members: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }, memberAvatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: AppColors.background, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, memberPhoto: { width: '100%', height: '100%' }, extraAvatar: { backgroundColor: AppColors.primarySoft }, memberLetter: { fontFamily: FontFamily.headingBold, color: AppColors.surface }, openSeats: { height: 38, marginLeft: 10, paddingHorizontal: 11, borderRadius: Radius.pill, borderWidth: 1, borderStyle: 'dashed', borderColor: AppColors.border, flexDirection: 'row', alignItems: 'center', gap: 6 }, fullSeats: { backgroundColor: AppColors.section, borderStyle: 'solid' }, openText: { ...TypeScale.caption, color: AppColors.textSecondary },
  chatCard: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, padding: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: AppColors.border, backgroundColor: AppColors.surface, ...WarmShadow }, chatIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center' }, chatTitle: { ...TypeScale.label, color: AppColors.text }, chatText: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 2 },
  safety: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 15, borderRadius: Radius.md, backgroundColor: AppColors.successSoft, marginTop: 27 }, safetyIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: AppColors.surface, alignItems: 'center', justifyContent: 'center' }, safetyTitle: { ...TypeScale.label, color: '#29664F' }, safetyText: { fontFamily: FontFamily.body, fontSize: 10, lineHeight: 15, color: '#4C7D69', marginTop: 2 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 88, backgroundColor: AppColors.surface, borderTopWidth: 1, borderTopColor: AppColors.border, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12, ...WarmShadow }, bottomInfo: { flex: 1, minWidth: 0 }, bottomLabel: { ...TypeScale.label, color: AppColors.text }, bottomSub: { fontFamily: FontFamily.body, fontSize: 10, color: AppColors.textSecondary, marginTop: 2 }, cta: { minWidth: 166 }, joinedActions: { flex: 1, flexDirection: 'row', gap: 10 }, actionCell: { flex: 1 },
  hostProfile: { alignItems: 'center' }, hostProfileName: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }, hostProfileTitle: { ...TypeScale.h2, color: AppColors.text }, hostProfileHandle: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 2 }, hostProfileBio: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center', marginTop: 13, maxWidth: 300 }, hostBadges: { flexDirection: 'row', gap: 7, marginTop: 14 }, hostSheetAction: { alignSelf: 'stretch', marginTop: 20 },
  notFoundNav: { paddingHorizontal: 18, paddingTop: 8 }, notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingBottom: 70 }, notFoundIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.accentSoft }, notFoundTitle: { ...TypeScale.h2, color: AppColors.text, marginTop: 18 }, notFoundText: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center', marginTop: 7 }, notFoundAction: { alignSelf: 'stretch', marginTop: 22 },
});
