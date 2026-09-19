import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton, Badge } from '@/components/ui/app-primitives';
import type { Meetup } from '@/constants/meetups';
import { AppColors, FontFamily, Radius, TypeScale, WarmShadow } from '@/constants/theme';

const cover = require('@/assets/images/meetup-rooftop.png');

export function MeetupCard({ meetup, onPress }: { meetup: Meetup; onPress: () => void }) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.imageWrap, pressed && styles.pressed]}>
        <Image source={cover} style={styles.image} contentFit="cover" transition={180} />
        <View style={styles.imageShade} />
        <View style={styles.topBadges}><Badge label={meetup.dateLabel} tone="amber" icon="clock-o" /><Badge label={meetup.distance} tone="neutral" icon="map-marker" /></View>
      </Pressable>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Pressable onPress={onPress} style={{ flex: 1 }}><Text style={styles.title}>{meetup.title}</Text></Pressable>
          <Badge label={meetup.category} tone="orange" />
        </View>
        <View style={styles.meta}><FontAwesome name="clock-o" size={14} color={AppColors.accent} /><Text style={styles.metaText}>{meetup.time} · {meetup.dateLabel}</Text></View>
        <View style={styles.meta}><FontAwesome name="map-marker" size={15} color={AppColors.accent} /><Text numberOfLines={1} style={styles.metaText}>{meetup.venue}, {meetup.area}</Text></View>
        <View style={styles.footer}>
          <View style={styles.host}>
            <View style={[styles.avatar, { backgroundColor: meetup.color }]}><Text style={styles.avatarText}>{meetup.host.charAt(0)}</Text></View>
            <View><View style={styles.hostName}><Text style={styles.hostText}>{meetup.host}</Text>{meetup.hostVerified ? <FontAwesome name="check-circle" size={13} color={AppColors.success} /> : null}</View><Text style={styles.people}>{meetup.members}/{meetup.capacity} người tham gia</Text></View>
          </View>
          <AppButton label="Tham gia" compact onPress={onPress} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: AppColors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: AppColors.border, overflow: 'hidden', marginBottom: 18, ...WarmShadow },
  imageWrap: { height: 154, backgroundColor: AppColors.section }, image: { width: '100%', height: '100%' }, imageShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(47,36,28,0.12)' },
  topBadges: { position: 'absolute', left: 12, right: 12, top: 12, flexDirection: 'row', justifyContent: 'space-between' }, pressed: { opacity: 0.85 },
  body: { padding: 16 }, titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 }, title: { ...TypeScale.h3, fontFamily: FontFamily.headingBold, color: AppColors.text },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 }, metaText: { ...TypeScale.caption, color: AppColors.textSecondary, flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 15, paddingTop: 14, borderTopWidth: 1, borderTopColor: AppColors.border }, host: { flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1 }, avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: AppColors.surface, fontFamily: FontFamily.headingBold, fontSize: 15 }, hostName: { flexDirection: 'row', alignItems: 'center', gap: 5 }, hostText: { ...TypeScale.label, color: AppColors.text }, people: { fontFamily: FontFamily.body, fontSize: 10, lineHeight: 14, color: AppColors.textSecondary },
});
