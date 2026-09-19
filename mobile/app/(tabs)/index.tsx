import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MeetupCard } from '@/components/meetup-card';
import { Chip, IconButton } from '@/components/ui/app-primitives';
import { CATEGORIES, MEETUPS } from '@/constants/meetups';
import { AppColors, FontFamily, Radius, TypeScale } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('Tối nay');
  const openMeetup = (id: string) => router.push({ pathname: '/meetup/[id]', params: { id } });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>CHÀO BUỔI TỐI 👋</Text><Text style={styles.heading}>Đi đâu hôm nay?</Text></View>
          <IconButton icon="bell-o" accessibilityLabel="Thông báo" />
        </View>

        <View style={styles.searchBox}>
          <FontAwesome name="search" size={17} color={AppColors.textSecondary} />
          <TextInput placeholder="Tìm kèo, địa điểm, không khí..." placeholderTextColor="#AA998A" style={styles.searchInput} onFocus={() => router.push('/(tabs)/explore')} />
          <Pressable style={styles.tuneButton} onPress={() => router.push('/(tabs)/explore')}><FontAwesome name="sliders" size={16} color={AppColors.surface} /></Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {CATEGORIES.slice(1).map((item) => <Chip key={item} label={item} selected={filter === item} onPress={() => setFilter(item)} />)}
        </ScrollView>

        <Pressable onPress={() => router.push('/(tabs)/explore')}>
          <LinearGradient colors={[AppColors.primary, AppColors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.heroCopy}><View style={styles.heroLabel}><FontAwesome name="bolt" size={12} color={AppColors.text} /><Text style={styles.heroLabelText}>GỢI Ý CHO BẠN</Text></View><Text style={styles.heroTitle}>Tối nay có kèo vui gần bạn</Text><Text style={styles.heroText}>Nhóm nhỏ, host đã xác minh và vẫn còn chỗ.</Text></View>
            <View style={styles.heroArrow}><FontAwesome name="arrow-right" size={17} color={AppColors.accent} /></View>
            <View style={styles.bubbleOne} /><View style={styles.bubbleTwo} />
          </LinearGradient>
        </Pressable>

        <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Đang diễn ra tối nay</Text><Text style={styles.sectionCaption}>Kèo hợp gu, cách bạn vài phút</Text></View><Pressable onPress={() => router.push('/(tabs)/explore')}><Text style={styles.seeAll}>Xem tất cả</Text></Pressable></View>
        {MEETUPS.map((meetup) => <MeetupCard key={meetup.id} meetup={meetup} onPress={() => openMeetup(meetup.id)} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.background }, content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, eyebrow: { ...TypeScale.caption, fontFamily: FontFamily.bodySemiBold, color: AppColors.accent, letterSpacing: 1 }, heading: { ...TypeScale.h1, color: AppColors.text, marginTop: 1 },
  searchBox: { height: 54, marginTop: 20, borderRadius: Radius.md, backgroundColor: AppColors.surface, borderWidth: 1, borderColor: AppColors.border, flexDirection: 'row', alignItems: 'center', paddingLeft: 16 }, searchInput: { ...TypeScale.body, color: AppColors.text, flex: 1, height: '100%', paddingHorizontal: 11 }, tuneButton: { width: 42, height: 42, marginRight: 6, borderRadius: 13, backgroundColor: AppColors.accent, alignItems: 'center', justifyContent: 'center' },
  chips: { gap: 8, paddingVertical: 16, paddingRight: 18 },
  hero: { minHeight: 166, borderRadius: Radius.lg, padding: 20, flexDirection: 'row', alignItems: 'flex-end', overflow: 'hidden' }, heroCopy: { flex: 1, zIndex: 2 }, heroLabel: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 5, borderRadius: Radius.pill, backgroundColor: 'rgba(255,255,255,0.58)' }, heroLabelText: { fontFamily: FontFamily.bodySemiBold, fontSize: 10, color: AppColors.text, letterSpacing: 0.6 }, heroTitle: { ...TypeScale.h2, color: AppColors.surface, marginTop: 15, maxWidth: 245 }, heroText: { ...TypeScale.caption, color: '#FFF9EC', marginTop: 4, maxWidth: 260 }, heroArrow: { width: 44, height: 44, borderRadius: 22, backgroundColor: AppColors.surface, alignItems: 'center', justifyContent: 'center', zIndex: 2 }, bubbleOne: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.12)', right: -26, top: -28 }, bubbleTwo: { position: 'absolute', width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.10)', right: 64, top: 28 },
  sectionHeader: { marginTop: 28, marginBottom: 13, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, sectionTitle: { ...TypeScale.h3, fontFamily: FontFamily.headingBold, color: AppColors.text }, sectionCaption: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 2 }, seeAll: { ...TypeScale.label, color: AppColors.accent },
});
