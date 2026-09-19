import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, Badge, Chip, IconButton, SurfaceCard } from '@/components/ui/app-primitives';
import { AppColors, FontFamily, Radius, TypeScale } from '@/constants/theme';

const avatar = require('@/assets/images/profile-minh-anh.png');

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Text style={styles.heading}>Hồ sơ của tôi</Text><IconButton icon="cog" accessibilityLabel="Cài đặt" /></View>
        <SurfaceCard style={styles.profileCard}>
          <View style={styles.avatarWrap}><Image source={avatar} style={styles.avatar} contentFit="cover" /><View style={styles.online} /></View>
          <View style={styles.nameRow}><Text style={styles.name}>Minh Anh</Text><FontAwesome name="check-circle" size={18} color={AppColors.success} /></View>
          <Text style={styles.handle}>@minhanh · TP. Hồ Chí Minh</Text>
          <Text style={styles.bio}>Thích những quán café có nắng, sản phẩm công nghệ và các cuộc trò chuyện thật lòng.</Text>
          <View style={styles.badges}><Badge label="Đã xác minh" tone="green" icon="shield" /><Badge label="Host thân thiện" tone="amber" icon="star" /></View>
          <AppButton label="Chỉnh sửa hồ sơ" variant="secondary" icon="pencil" />
        </SurfaceCard>

        <View style={styles.stats}><Stat value="4.9" label="Đánh giá" icon="star" /><Stat value="18" label="Đã tham gia" icon="users" /><Stat value="7" label="Đã tổ chức" icon="calendar-check-o" /></View>

        <SectionHeader title="Sở thích" action="Chỉnh sửa" />
        <View style={styles.chips}>{['Café', 'Startup', 'Rooftop', 'Board game', 'Nhóm nhỏ', 'Karaoke'].map((item) => <Chip key={item} label={item} selected />)}</View>

        <SectionHeader title="Kèo đã tổ chức" action="Xem tất cả" />
        <SurfaceCard style={styles.hostedCard}><View style={styles.calendarBox}><Text style={styles.month}>THG 9</Text><Text style={styles.day}>18</Text></View><View style={{ flex: 1 }}><Text style={styles.hostedTitle}>Startup & chill</Text><Text style={styles.hostedMeta}>19:30 · Quận 1 · 4/6 người</Text></View><Badge label="Tối nay" tone="orange" /></SurfaceCard>

        <SectionHeader title="Nhận xét gần đây" action="12 nhận xét" />
        <SurfaceCard style={styles.reviewCard}><View style={styles.reviewTop}><View style={styles.reviewAvatar}><Text style={styles.reviewInitial}>L</Text></View><View style={{ flex: 1 }}><Text style={styles.reviewer}>Lan Chi</Text><Text style={styles.reviewDate}>2 tuần trước</Text></View><View style={styles.rating}><FontAwesome name="star" size={12} color={AppColors.primary} /><Text style={styles.ratingText}>5.0</Text></View></View><Text style={styles.reviewText}>“Host chu đáo, chọn quán xinh và giúp mọi người làm quen rất tự nhiên. Sẽ tham gia kèo sau!”</Text></SurfaceCard>

        <Text style={styles.sectionTitle}>An toàn & hỗ trợ</Text>
        <Menu icon="shield" title="Trung tâm an toàn" subtitle="Hướng dẫn gặp gỡ và liên hệ hỗ trợ" />
        <Menu icon="ban" title="Quản lý tài khoản đã chặn" subtitle="Xem và chỉnh sửa danh sách chặn" />
        <Menu icon="flag-o" title="Báo cáo sự cố" subtitle="Gửi báo cáo cho đội ngũ kiểm duyệt" danger />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon: React.ComponentProps<typeof FontAwesome>['name'] }) { return <View style={styles.stat}><FontAwesome name={icon} size={14} color={AppColors.primary} /><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
function SectionHeader({ title, action }: { title: string; action: string }) { return <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text><Pressable><Text style={styles.sectionAction}>{action}</Text></Pressable></View>; }
function Menu({ icon, title, subtitle, danger = false }: { icon: React.ComponentProps<typeof FontAwesome>['name']; title: string; subtitle: string; danger?: boolean }) { const color = danger ? AppColors.danger : AppColors.accent; return <Pressable style={styles.menu}><View style={[styles.menuIcon, { backgroundColor: danger ? AppColors.dangerSoft : AppColors.accentSoft }]}><FontAwesome name={icon} size={16} color={color} /></View><View style={{ flex: 1 }}><Text style={[styles.menuTitle, danger && { color }]}>{title}</Text><Text style={styles.menuSub}>{subtitle}</Text></View><FontAwesome name="angle-right" size={18} color="#AA998A" /></Pressable>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.background }, content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 38 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, heading: { ...TypeScale.h1, color: AppColors.text },
  profileCard: { marginTop: 18, padding: 20, alignItems: 'center' }, avatarWrap: { width: 92, height: 92 }, avatar: { width: 92, height: 92, borderRadius: 30 }, online: { position: 'absolute', right: -1, bottom: 3, width: 19, height: 19, borderRadius: 10, backgroundColor: AppColors.success, borderWidth: 3, borderColor: AppColors.surface }, nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 }, name: { ...TypeScale.h2, color: AppColors.text }, handle: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 2 }, bio: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center', marginTop: 12, marginBottom: 13 }, badges: { flexDirection: 'row', gap: 7, marginBottom: 16 },
  stats: { flexDirection: 'row', backgroundColor: AppColors.text, borderRadius: Radius.lg, paddingVertical: 16, marginTop: 14 }, stat: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#57493F', gap: 2 }, statValue: { fontFamily: FontFamily.headingBold, fontSize: 18, color: AppColors.surface }, statLabel: { fontFamily: FontFamily.body, fontSize: 10, color: '#D6C9BD' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 27, marginBottom: 11 }, sectionTitle: { ...TypeScale.h3, fontFamily: FontFamily.headingBold, color: AppColors.text, marginTop: 27, marginBottom: 11 }, sectionHeaderTitle: { ...TypeScale.h3 }, sectionAction: { ...TypeScale.caption, fontFamily: FontFamily.bodySemiBold, color: AppColors.accent }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hostedCard: { padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 }, calendarBox: { width: 48, height: 50, borderRadius: 13, backgroundColor: AppColors.primarySoft, alignItems: 'center', justifyContent: 'center' }, month: { fontFamily: FontFamily.bodySemiBold, fontSize: 8, color: '#966700' }, day: { fontFamily: FontFamily.headingBold, fontSize: 18, color: AppColors.text }, hostedTitle: { ...TypeScale.label, color: AppColors.text }, hostedMeta: { fontFamily: FontFamily.body, fontSize: 10, lineHeight: 15, color: AppColors.textSecondary, marginTop: 2 },
  reviewCard: { padding: 16 }, reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 10 }, reviewAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: AppColors.primarySoft, alignItems: 'center', justifyContent: 'center' }, reviewInitial: { fontFamily: FontFamily.headingBold, color: AppColors.text }, reviewer: { ...TypeScale.label, color: AppColors.text }, reviewDate: { fontFamily: FontFamily.body, fontSize: 9, color: AppColors.textSecondary }, rating: { flexDirection: 'row', gap: 4, alignItems: 'center' }, ratingText: { ...TypeScale.label, color: AppColors.text }, reviewText: { ...TypeScale.body, color: AppColors.textSecondary, marginTop: 12 },
  menu: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: AppColors.border }, menuIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, menuTitle: { ...TypeScale.label, color: AppColors.text }, menuSub: { fontFamily: FontFamily.body, fontSize: 10, lineHeight: 15, color: AppColors.textSecondary, marginTop: 2 },
});
