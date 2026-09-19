import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, Badge, Chip, IconButton, SurfaceCard } from '@/components/ui/app-primitives';
import { MEETUPS } from '@/constants/meetups';
import { AppColors, FontFamily, Radius, TypeScale, WarmShadow } from '@/constants/theme';

const cover = require('@/assets/images/meetup-rooftop.png');
const hostAvatar = require('@/assets/images/profile-minh-anh.png');

export default function MeetupDetailScreen() {
  const router = useRouter(); const { id } = useLocalSearchParams<{ id: string }>(); const meetup = MEETUPS.find((item) => item.id === id) ?? MEETUPS[0]; const [joined, setJoined] = useState(false);
  const join = () => { setJoined(true); Alert.alert('Đã gửi yêu cầu 🎉', 'Minh Anh sẽ phản hồi sớm. Khi được duyệt, chat nhóm sẽ tự mở.'); };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.coverWrap}>
          <Image source={cover} style={styles.cover} contentFit="cover" />
          <View style={styles.coverShade} />
          <View style={styles.nav}><IconButton icon="angle-left" accessibilityLabel="Quay lại" onPress={() => router.back()} /><View style={styles.navRight}><IconButton icon="share-alt" accessibilityLabel="Chia sẻ" /><IconButton icon="bookmark-o" accessibilityLabel="Lưu meetup" /></View></View>
          <View style={styles.coverBadges}><Badge label={meetup.dateLabel} tone="amber" icon="clock-o" /><Badge label={`${meetup.members}/${meetup.capacity} người`} tone="neutral" icon="users" /></View>
        </View>

        <View style={styles.main}>
          <Text style={styles.title}>{meetup.title}</Text><Text style={styles.vibe}>{meetup.vibe}</Text>
          <View style={styles.tags}>{meetup.tags.map((tag) => <Chip key={tag} label={tag} selected />)}</View>

          <SurfaceCard style={styles.infoCard}>
            <Info icon="calendar" title={`${meetup.dateLabel}, ${meetup.time}`} subtitle="Có mặt trước 10 phút" />
            <Info icon="map-marker" title={meetup.venue} subtitle={`${meetup.area} · Cách bạn ${meetup.distance}`} />
            <Info icon="users" title={`${meetup.members} người đã tham gia`} subtitle={`Còn ${meetup.capacity - meetup.members} chỗ · ${meetup.ageRange}`} last />
          </SurfaceCard>

          <Text style={styles.sectionTitle}>Host của meetup</Text>
          <SurfaceCard style={styles.hostCard}>
            <Image source={hostAvatar} style={styles.hostAvatar} contentFit="cover" />
            <View style={{ flex: 1 }}><View style={styles.hostName}><Text style={styles.hostTitle}>{meetup.host}</Text><FontAwesome name="check-circle" size={15} color={AppColors.success} /></View><Text style={styles.hostMeta}>4.9 ★ · 7 kèo đã tổ chức</Text><Text style={styles.hostQuote}>“Cứ đến là có bạn, còn lại để mình lo.”</Text></View>
            <Pressable style={styles.chatHost}><FontAwesome name="comment-o" size={15} color={AppColors.accent} /></Pressable>
          </SurfaceCard>

          <Text style={styles.sectionTitle}>Về buổi gặp</Text><Text style={styles.description}>{meetup.description}</Text>
          <View style={styles.details}><MiniDetail icon="language" text={meetup.language} /><MiniDetail icon="money" text={meetup.payment} /></View>

          <View style={styles.memberHeader}><Text style={styles.sectionTitle}>Ai sẽ tham gia</Text><Text style={styles.memberCount}>{meetup.members}/{meetup.capacity} người</Text></View>
          <View style={styles.members}>{['L', 'T', 'N', 'H'].slice(0, meetup.members).map((letter, index) => <View key={`${letter}-${index}`} style={[styles.memberAvatar, { marginLeft: index ? -10 : 0, backgroundColor: index % 2 ? AppColors.accent : AppColors.primary }]}><Text style={styles.memberLetter}>{letter}</Text></View>)}<View style={styles.openSeats}><FontAwesome name="plus" size={13} color={AppColors.textSecondary} /><Text style={styles.openText}>{meetup.capacity - meetup.members} chỗ trống</Text></View></View>

          <View style={styles.safety}><View style={styles.safetyIcon}><FontAwesome name="shield" size={18} color={AppColors.success} /></View><View style={{ flex: 1 }}><Text style={styles.safetyTitle}>Gặp nhau an toàn</Text><Text style={styles.safetyText}>Đây là địa điểm công cộng. Không gửi tiền riêng và báo cho người thân biết lịch của bạn.</Text></View><FontAwesome name="angle-right" size={17} color={AppColors.success} /></View>
        </View>
      </ScrollView>
      <View style={styles.bottomBar}><View><Text style={styles.bottomLabel}>Tham gia miễn phí</Text><Text style={styles.bottomSub}>{meetup.payment}</Text></View><View style={styles.cta}><AppButton label={joined ? 'Đã gửi yêu cầu' : 'Tham gia meetup'} icon={joined ? 'check' : 'arrow-right'} onPress={join} disabled={joined} /></View></View>
    </SafeAreaView>
  );
}

function Info({ icon, title, subtitle, last = false }: { icon: React.ComponentProps<typeof FontAwesome>['name']; title: string; subtitle: string; last?: boolean }) { return <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}><View style={styles.infoIcon}><FontAwesome name={icon} size={16} color={AppColors.accent} /></View><View><Text style={styles.infoTitle}>{title}</Text><Text style={styles.infoSub}>{subtitle}</Text></View></View>; }
function MiniDetail({ icon, text }: { icon: React.ComponentProps<typeof FontAwesome>['name']; text: string }) { return <View style={styles.miniDetail}><FontAwesome name={icon} size={14} color={AppColors.accent} /><Text style={styles.miniText}>{text}</Text></View>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.background }, content: { paddingBottom: 105 }, coverWrap: { height: 282, backgroundColor: AppColors.section }, cover: { width: '100%', height: '100%' }, coverShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(47,36,28,0.18)' }, nav: { position: 'absolute', top: 12, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }, navRight: { flexDirection: 'row', gap: 8 }, coverBadges: { position: 'absolute', left: 18, right: 18, bottom: 16, flexDirection: 'row', justifyContent: 'space-between' },
  main: { paddingHorizontal: 18, paddingTop: 20 }, title: { ...TypeScale.h1, color: AppColors.text }, vibe: { ...TypeScale.body, color: AppColors.textSecondary, marginTop: 4 }, tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 15 },
  infoCard: { paddingHorizontal: 16, marginTop: 20 }, infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: AppColors.border }, infoIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center' }, infoTitle: { ...TypeScale.label, color: AppColors.text }, infoSub: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 1 },
  sectionTitle: { ...TypeScale.h3, fontFamily: FontFamily.headingBold, color: AppColors.text, marginTop: 26, marginBottom: 10 }, hostCard: { padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' }, hostAvatar: { width: 54, height: 54, borderRadius: 19 }, hostName: { flexDirection: 'row', gap: 5, alignItems: 'center' }, hostTitle: { ...TypeScale.label, color: AppColors.text }, hostMeta: { fontFamily: FontFamily.body, fontSize: 10, lineHeight: 15, color: AppColors.textSecondary }, hostQuote: { fontFamily: FontFamily.body, fontSize: 10, lineHeight: 15, color: AppColors.text, marginTop: 3 }, chatHost: { width: 36, height: 36, borderRadius: 18, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  description: { ...TypeScale.body, color: AppColors.textSecondary }, details: { flexDirection: 'row', gap: 8, marginTop: 14 }, miniDetail: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: AppColors.section, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 }, miniText: { ...TypeScale.caption, color: AppColors.text }, memberHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, memberCount: { ...TypeScale.caption, color: AppColors.textSecondary, marginBottom: 11 }, members: { flexDirection: 'row', alignItems: 'center' }, memberAvatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: AppColors.background, alignItems: 'center', justifyContent: 'center' }, memberLetter: { fontFamily: FontFamily.headingBold, color: AppColors.text }, openSeats: { height: 38, marginLeft: 10, paddingHorizontal: 11, borderRadius: Radius.pill, borderWidth: 1, borderStyle: 'dashed', borderColor: AppColors.border, flexDirection: 'row', alignItems: 'center', gap: 6 }, openText: { ...TypeScale.caption, color: AppColors.textSecondary },
  safety: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 15, borderRadius: Radius.md, backgroundColor: AppColors.successSoft, marginTop: 27 }, safetyIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: AppColors.surface, alignItems: 'center', justifyContent: 'center' }, safetyTitle: { ...TypeScale.label, color: '#29664F' }, safetyText: { fontFamily: FontFamily.body, fontSize: 10, lineHeight: 15, color: '#4C7D69', marginTop: 2 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 88, backgroundColor: AppColors.surface, borderTopWidth: 1, borderTopColor: AppColors.border, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...WarmShadow }, bottomLabel: { ...TypeScale.label, color: AppColors.text }, bottomSub: { fontFamily: FontFamily.body, fontSize: 10, color: AppColors.textSecondary }, cta: { minWidth: 190 },
});
