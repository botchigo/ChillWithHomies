import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Alert, Platform, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';

import { Badge } from '@/components/ui/app-primitives';
import { AppColors, FontFamily, Radius, TypeScale, WarmShadow } from '@/constants/theme';
import { useMeetupParticipation } from '@/src/features/sessions/hooks/use-meetup-participation';
import { formatDistance, formatVND, getUnpaidShares } from '@/src/features/sessions/services/session-rules';
import type { Meetup } from '@/src/features/sessions/types';

const cover = require('@/assets/images/meetup-rooftop.png');

export function MeetupCard({ meetup, onPress }: { meetup: Meetup; onPress: () => void }) {
  const { currentUserId, joinMeetup, leaveMeetup, notify } = useMeetupParticipation();
  const isHost = currentUserId === meetup.hostId;
  const isJoined = !!currentUserId && meetup.participants.some((participant) => participant.id === currentUserId);
  const isFull = meetup.participants.length >= meetup.maxParticipants;
  const isEnded = meetup.status === 'ended';

  const leave = () => {
    const result = leaveMeetup(meetup.id);
    if (!result.ok && result.error) notify(result.error);
  };

  const handleParticipation = (event: GestureResponderEvent) => {
    event.stopPropagation();
    if (isHost) {
      notify('Bạn là host của meetup này.');
      return;
    }
    if (isJoined) {
      if (Platform.OS === 'web' && typeof globalThis.confirm === 'function') {
        if (globalThis.confirm('Rời kèo này? Bạn sẽ không còn thấy phòng chat của meetup trong danh sách.')) leave();
        return;
      }
      Alert.alert(
        'Rời kèo này?',
        'Bạn sẽ không còn thấy phòng chat của meetup trong danh sách.',
        [
          { text: 'Ở lại', style: 'cancel' },
          { text: 'Rời kèo', style: 'destructive', onPress: leave },
        ],
      );
      return;
    }
    const result = joinMeetup(meetup.id);
    if (!result.ok && result.error) notify(result.error);
  };

  const buttonLabel = isHost
    ? 'Bạn là host'
    : isJoined
      ? 'Đã tham gia'
      : isEnded
        ? 'Đã kết thúc'
        : isFull
          ? 'Đã đủ người'
          : 'Tham gia';
  const disabled = isEnded || (isFull && !isJoined);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Mở chi tiết ${meetup.title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.imageWrap}>
        <Image source={cover} style={styles.image} contentFit="cover" transition={180} />
        <View style={[styles.imageTint, { backgroundColor: meetup.color }]} />
        <View style={styles.imageShade} />
        <View style={styles.topBadges}>
          <Badge label={meetup.dateLabel} tone="amber" icon="clock-o" />
          <Badge label={formatDistance(meetup.distanceKm)} tone="neutral" icon="map-marker" />
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{meetup.title}</Text>
          <Badge label={meetup.category} tone="orange" />
        </View>
        <View style={styles.subBadges}>
          {meetup.alcoholType ? <Badge label={meetup.alcoholType} tone="amber" icon="beer" /> : null}
          {meetup.age18Plus ? <Badge label="18+" tone="neutral" icon="id-card" /> : null}
          {meetup.tableBooked ? <Badge label="Đã đặt bàn" tone="green" icon="check" /> : null}
          {(meetup.depositAmount ?? 0) > 0 ? <Badge label={`Cọc ${formatVND(meetup.depositAmount ?? 0)}`} tone="green" icon="lock" /> : null}
          {meetup.billTotal ? (getUnpaidShares(meetup).length ? <Badge label={`Còn ${getUnpaidShares(meetup).length} chưa trả`} tone="orange" icon="money" /> : <Badge label="Đã trả đủ" tone="green" icon="check" />) : null}
        </View>
        <View style={styles.meta}><FontAwesome name="clock-o" size={14} color={AppColors.accent} /><Text style={styles.metaText}>{meetup.time} · {meetup.dateLabel}</Text></View>
        <View style={styles.meta}><FontAwesome name="map-marker" size={15} color={AppColors.accent} /><Text numberOfLines={1} style={styles.metaText}>{meetup.location}, {meetup.district}</Text></View>
        <View style={styles.footer}>
          <View style={styles.host}>
            {meetup.hostAvatarUri
              ? <Image source={{ uri: meetup.hostAvatarUri }} style={styles.avatar} contentFit="cover" />
              : <View style={[styles.avatar, { backgroundColor: meetup.hostAvatarColor }]}><Text style={styles.avatarText}>{meetup.hostName.charAt(0)}</Text></View>}
            <View style={styles.hostCopy}><View style={styles.hostName}><Text numberOfLines={1} style={styles.hostText}>{meetup.hostName}</Text>{meetup.hostVerified ? <FontAwesome name="check-circle" size={13} color={AppColors.success} /> : null}</View><Text style={styles.people}>{meetup.participants.length}/{meetup.maxParticipants} người tham gia</Text></View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={buttonLabel}
            disabled={disabled}
            onPress={handleParticipation}
            style={({ pressed }) => [styles.joinButton, isJoined && styles.joinedButton, (isHost || disabled) && styles.disabledButton, pressed && !disabled && styles.joinPressed]}>
            {isJoined ? <FontAwesome name="check" size={12} color={AppColors.text} /> : null}
            <Text style={[styles.joinLabel, isJoined && styles.joinedLabel, (isHost || disabled) && styles.disabledLabel]}>{buttonLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: AppColors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: AppColors.border, overflow: 'hidden', marginBottom: 18, ...WarmShadow },
  pressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
  imageWrap: { height: 154, backgroundColor: AppColors.section }, image: { width: '100%', height: '100%' }, imageTint: { ...StyleSheet.absoluteFill, opacity: 0.08 }, imageShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(47,36,28,0.12)' },
  topBadges: { position: 'absolute', left: 12, right: 12, top: 12, flexDirection: 'row', justifyContent: 'space-between' },
  body: { padding: 16 }, titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 }, title: { ...TypeScale.h3, fontFamily: FontFamily.headingBold, color: AppColors.text, flex: 1 }, subBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 }, metaText: { ...TypeScale.caption, color: AppColors.textSecondary, flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 15, paddingTop: 14, borderTopWidth: 1, borderTopColor: AppColors.border }, host: { flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1, minWidth: 0 }, hostCopy: { flex: 1, minWidth: 0 }, avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: AppColors.surface, fontFamily: FontFamily.headingBold, fontSize: 15 }, hostName: { flexDirection: 'row', alignItems: 'center', gap: 5 }, hostText: { ...TypeScale.label, color: AppColors.text, flexShrink: 1 }, people: { fontFamily: FontFamily.body, fontSize: 10, lineHeight: 14, color: AppColors.textSecondary },
  joinButton: { minHeight: 40, paddingHorizontal: 14, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: AppColors.accent, borderWidth: 1, borderColor: AppColors.accent },
  joinLabel: { ...TypeScale.label, color: AppColors.surface }, joinedButton: { backgroundColor: AppColors.primarySoft, borderColor: AppColors.primary }, joinedLabel: { color: AppColors.text }, disabledButton: { backgroundColor: AppColors.section, borderColor: AppColors.border, opacity: 0.8 }, disabledLabel: { color: AppColors.textSecondary }, joinPressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
