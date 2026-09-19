import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MeetupCard } from '@/components/meetup-card';
import { Chip } from '@/components/ui/app-primitives';
import { CATEGORIES, MEETUPS } from '@/constants/meetups';
import { AppColors, FontFamily, Radius, TypeScale } from '@/constants/theme';

export default function ExploreScreen() {
  const router = useRouter(); const [query, setQuery] = useState(''); const [category, setCategory] = useState('Tất cả');
  const results = useMemo(() => MEETUPS.filter((meetup) => {
    const haystack = `${meetup.title} ${meetup.category} ${meetup.area} ${meetup.venue} ${meetup.tags.join(' ')}`.toLowerCase();
    const matchesQuery = haystack.includes(query.trim().toLowerCase());
    const matchesCategory = category === 'Tất cả' || (category === 'Tối nay' ? meetup.dateLabel === 'Tối nay' : category === 'Gần đây' ? Number.parseFloat(meetup.distance.replace(',', '.')) < 3 : category === '2–4 người' ? meetup.members <= 4 : meetup.category === category || meetup.tags.includes(category));
    return matchesQuery && matchesCategory;
  }), [category, query]);
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>KHÁM PHÁ</Text><Text style={styles.heading}>Tìm đúng kèo, gặp đúng gu</Text><Text style={styles.subtitle}>Các nhóm thân thiện quanh TP. Hồ Chí Minh.</Text>
        <View style={styles.search}><FontAwesome name="search" size={17} color={AppColors.textSecondary} /><TextInput value={query} onChangeText={setQuery} placeholder="Karaoke, rooftop, Quận 1..." placeholderTextColor="#AA998A" style={styles.input} /><Pressable style={styles.filterButton}><FontAwesome name="sliders" size={16} color={AppColors.surface} /></Pressable></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{CATEGORIES.map((item) => <Chip key={item} label={item} selected={category === item} onPress={() => setCategory(item)} />)}</ScrollView>
        <View style={styles.resultHeader}><View><Text style={styles.resultTitle}>{results.length} meetup dành cho bạn</Text><Text style={styles.resultSub}>Ưu tiên gần và còn chỗ</Text></View><Pressable style={styles.sort}><Text style={styles.sortText}>Gần nhất</Text><FontAwesome name="angle-down" size={14} color={AppColors.textSecondary} /></Pressable></View>
        {results.map((meetup) => <MeetupCard key={meetup.id} meetup={meetup} onPress={() => router.push({ pathname: '/meetup/[id]', params: { id: meetup.id } })} />)}
        {!results.length ? <View style={styles.empty}><View style={styles.emptyIcon}><FontAwesome name="compass" size={30} color={AppColors.accent} /></View><Text style={styles.emptyTitle}>Chưa thấy kèo phù hợp</Text><Text style={styles.emptyText}>Thử đổi bộ lọc hoặc tự tạo một meetup theo gu của bạn nhé.</Text></View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.background }, content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 34 }, eyebrow: { ...TypeScale.caption, fontFamily: FontFamily.bodySemiBold, color: AppColors.accent, letterSpacing: 1 }, heading: { ...TypeScale.h1, color: AppColors.text, marginTop: 2 }, subtitle: { ...TypeScale.body, color: AppColors.textSecondary, marginTop: 4 },
  search: { height: 54, marginTop: 20, borderRadius: Radius.md, backgroundColor: AppColors.surface, borderWidth: 1, borderColor: AppColors.border, flexDirection: 'row', alignItems: 'center', paddingLeft: 16 }, input: { ...TypeScale.body, color: AppColors.text, flex: 1, paddingHorizontal: 11 }, filterButton: { width: 42, height: 42, borderRadius: 13, backgroundColor: AppColors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 6 }, filters: { gap: 8, paddingVertical: 16, paddingRight: 18 }, resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 3, marginBottom: 13 }, resultTitle: { ...TypeScale.h3, fontFamily: FontFamily.headingBold, color: AppColors.text }, resultSub: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 1 }, sort: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: AppColors.section, paddingHorizontal: 10, paddingVertical: 7, borderRadius: Radius.pill }, sortText: { ...TypeScale.caption, color: AppColors.textSecondary },
  empty: { alignItems: 'center', paddingVertical: 54 }, emptyIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center' }, emptyTitle: { ...TypeScale.h3, fontFamily: FontFamily.headingBold, color: AppColors.text, marginTop: 14 }, emptyText: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center', maxWidth: 260, marginTop: 5 },
});
