import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MeetupCard } from '@/components/meetup-card';
import { AppButton, Chip, IconButton } from '@/components/ui/app-primitives';
import { AppColors, FontFamily, Radius, TypeScale } from '@/constants/theme';
import { SESSION_FILTERS, type MeetupFilter } from '@/src/features/sessions/constants';
import { useMeetupDiscovery } from '@/src/features/sessions/hooks/use-meetup-discovery';

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<MeetupFilter[]>([]);
  const { meetups, unreadNotifications } = useMeetupDiscovery({ query, filters, sort: 'Sắp diễn ra', personalize: true });

  const toggleFilter = (filter: MeetupFilter) => {
    setFilters((current) => current.includes(filter)
      ? current.filter((item) => item !== filter)
      : [...current, filter]);
  };
  const clearSearch = () => { setQuery(''); setFilters([]); };
  const openMeetup = (id: string) => router.push({ pathname: '/meetup/[id]', params: { id } });
  const openExplore = () => router.push({ pathname: '/explore', params: query.trim() ? { q: query.trim() } : undefined });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>TỐI NAY NHẬU GÌ? 🍺</Text><Text style={styles.heading}>Kèo nhậu gần bạn</Text></View>
          <View style={styles.notificationButton}>
            <IconButton icon="bell-o" accessibilityLabel={`Thông báo${unreadNotifications ? `, ${unreadNotifications} chưa đọc` : ''}`} onPress={() => router.push('/notifications' as Href)} />
            {unreadNotifications ? <View style={styles.notificationCount}><Text style={styles.notificationCountText}>{Math.min(unreadNotifications, 9)}</Text></View> : null}
          </View>
        </View>

        <View style={styles.searchBox}>
          <FontAwesome name="search" size={17} color={AppColors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm bia, quán ốc, rooftop..."
            placeholderTextColor="#AA998A"
            style={styles.searchInput}
            returnKeyType="search"
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Mở trang khám phá" style={styles.tuneButton} onPress={openExplore}><FontAwesome name="sliders" size={16} color={AppColors.surface} /></Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {SESSION_FILTERS.slice(1).map((item) => <Chip key={item} label={item} selected={filters.includes(item)} onPress={() => toggleFilter(item)} />)}
        </ScrollView>

        <Pressable accessibilityRole="button" onPress={openExplore}>
          <LinearGradient colors={[AppColors.primary, AppColors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.heroCopy}><View style={styles.heroLabel}><FontAwesome name="beer" size={12} color={AppColors.text} /><Text style={styles.heroLabelText}>18+ · UỐNG CÓ TRÁCH NHIỆM</Text></View><Text style={styles.heroTitle}>Tối nay có kèo nhậu gần bạn</Text><Text style={styles.heroText}>Bàn nhỏ, bill rõ, host đã đặt bàn và vẫn còn chỗ.</Text></View>
            <View style={styles.heroArrow}><FontAwesome name="arrow-right" size={17} color={AppColors.accent} /></View>
            <View style={styles.bubbleOne} /><View style={styles.bubbleTwo} />
          </LinearGradient>
        </Pressable>

        <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>{filters.includes('Tối nay') ? 'Nhậu tối nay' : 'Kèo nhậu dành cho bạn'}</Text><Text style={styles.sectionCaption}>{meetups.length} kèo hợp gu của bạn · 18+ only</Text></View><Pressable onPress={openExplore}><Text style={styles.seeAll}>Xem tất cả</Text></Pressable></View>
        {meetups.map((meetup) => <MeetupCard key={meetup.id} meetup={meetup} onPress={() => openMeetup(meetup.id)} />)}
        {!meetups.length ? <View style={styles.empty}><View style={styles.emptyIcon}><FontAwesome name="search" size={27} color={AppColors.accent} /></View><Text style={styles.emptyTitle}>Chưa tìm thấy kèo phù hợp</Text><Text style={styles.emptyText}>Thử một từ khóa khác hoặc xóa bộ lọc để xem thêm meetup.</Text><View style={styles.emptyAction}><AppButton label="Xóa bộ lọc" compact variant="secondary" onPress={clearSearch} /></View></View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.background }, content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, eyebrow: { ...TypeScale.caption, fontFamily: FontFamily.bodySemiBold, color: AppColors.accent, letterSpacing: 1 }, heading: { ...TypeScale.h1, color: AppColors.text, marginTop: 1 },
  notificationButton: { position: 'relative' }, notificationCount: { position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, backgroundColor: AppColors.danger, borderWidth: 2, borderColor: AppColors.background, alignItems: 'center', justifyContent: 'center' }, notificationCountText: { fontFamily: FontFamily.bodySemiBold, fontSize: 8, color: AppColors.surface },
  searchBox: { height: 54, marginTop: 20, borderRadius: Radius.md, backgroundColor: AppColors.surface, borderWidth: 1, borderColor: AppColors.border, flexDirection: 'row', alignItems: 'center', paddingLeft: 16 }, searchInput: { ...TypeScale.body, color: AppColors.text, flex: 1, height: '100%', paddingHorizontal: 11 }, tuneButton: { width: 42, height: 42, marginRight: 6, borderRadius: 13, backgroundColor: AppColors.accent, alignItems: 'center', justifyContent: 'center' },
  chips: { gap: 8, paddingVertical: 16, paddingRight: 18 },
  hero: { minHeight: 166, borderRadius: Radius.lg, padding: 20, flexDirection: 'row', alignItems: 'flex-end', overflow: 'hidden' }, heroCopy: { flex: 1, zIndex: 2 }, heroLabel: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 5, borderRadius: Radius.pill, backgroundColor: 'rgba(255,255,255,0.58)' }, heroLabelText: { fontFamily: FontFamily.bodySemiBold, fontSize: 10, color: AppColors.text, letterSpacing: 0.6 }, heroTitle: { ...TypeScale.h2, color: AppColors.surface, marginTop: 15, maxWidth: 245 }, heroText: { ...TypeScale.caption, color: '#FFF9EC', marginTop: 4, maxWidth: 260 }, heroArrow: { width: 44, height: 44, borderRadius: 22, backgroundColor: AppColors.surface, alignItems: 'center', justifyContent: 'center', zIndex: 2 }, bubbleOne: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.12)', right: -26, top: -28 }, bubbleTwo: { position: 'absolute', width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.10)', right: 64, top: 28 },
  sectionHeader: { marginTop: 28, marginBottom: 13, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, sectionTitle: { ...TypeScale.h3, fontFamily: FontFamily.headingBold, color: AppColors.text }, sectionCaption: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 2 }, seeAll: { ...TypeScale.label, color: AppColors.accent },
  empty: { alignItems: 'center', paddingVertical: 44 }, emptyIcon: { width: 62, height: 62, borderRadius: 31, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center' }, emptyTitle: { ...TypeScale.h3, fontFamily: FontFamily.headingBold, color: AppColors.text, marginTop: 14 }, emptyText: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center', maxWidth: 270, marginTop: 5 }, emptyAction: { marginTop: 16 },
});
