import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MeetupCard } from '@/components/meetup-card';
import { AppButton, BottomSheet, Chip } from '@/components/ui/app-primitives';
import { useDemoApp } from '@/context/demo-app-context';
import { FILTERS, filterAndSortMeetups, visibleMeetupsForUser, type MeetupFilter, type MeetupSort } from '@/data/demo-data';
import { AppColors, FontFamily, Radius, TypeScale } from '@/constants/theme';

const SORT_OPTIONS: MeetupSort[] = ['Gần nhất', 'Sắp diễn ra', 'Còn nhiều chỗ'];

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const { state } = useDemoApp();
  const [query, setQuery] = useState(typeof params.q === 'string' ? params.q : '');
  const [filters, setFilters] = useState<MeetupFilter[]>([]);
  const [sort, setSort] = useState<MeetupSort>('Gần nhất');
  const [sortSheet, setSortSheet] = useState(false);

  const personalizedFilters = useMemo(() => {
    const preferences = new Set([...state.profile.interests, ...state.profile.preferredVibes].map((value) => value.toLocaleLowerCase('vi-VN')));
    return [FILTERS[0], ...FILTERS.slice(1).map((filter, index) => ({ filter, index }))
      .sort((a, b) => Number(preferences.has(b.filter.toLocaleLowerCase('vi-VN'))) - Number(preferences.has(a.filter.toLocaleLowerCase('vi-VN'))) || a.index - b.index)
      .map(({ filter }) => filter)];
  }, [state.profile.interests, state.profile.preferredVibes]);

  const results = useMemo(
    () => filterAndSortMeetups(visibleMeetupsForUser(state.meetups, state.currentUser?.id), query, filters, sort),
    [filters, query, sort, state.currentUser?.id, state.meetups],
  );

  const toggleFilter = (filter: MeetupFilter) => {
    if (filter === 'Tất cả') {
      setFilters([]);
      return;
    }
    setFilters((current) => current.includes(filter)
      ? current.filter((item) => item !== filter)
      : [...current, filter]);
  };
  const reset = () => { setQuery(''); setFilters([]); setSort('Gần nhất'); };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>KHÁM PHÁ</Text><Text style={styles.heading}>Tìm đúng kèo, gặp đúng gu</Text><Text style={styles.subtitle}>Các nhóm thân thiện quanh TP. Hồ Chí Minh.</Text>
        <View style={styles.search}>
          <FontAwesome name="search" size={17} color={AppColors.textSecondary} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Karaoke, rooftop, Quận 1..." placeholderTextColor="#AA998A" style={styles.input} returnKeyType="search" />
          <Pressable accessibilityRole="button" accessibilityLabel="Sắp xếp kết quả" style={styles.filterButton} onPress={() => setSortSheet(true)}><FontAwesome name="sliders" size={16} color={AppColors.surface} /></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {personalizedFilters.map((item) => <Chip key={item} label={item} selected={item === 'Tất cả' ? filters.length === 0 : filters.includes(item)} onPress={() => toggleFilter(item)} />)}
        </ScrollView>
        <View style={styles.resultHeader}>
          <View style={styles.resultCopy}><Text style={styles.resultTitle}>{results.length} meetup dành cho bạn</Text><Text style={styles.resultSub}>Đang xếp theo: {sort.toLocaleLowerCase('vi-VN')}</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel={`Sắp xếp: ${sort}`} style={styles.sort} onPress={() => setSortSheet(true)}><Text numberOfLines={1} style={styles.sortText}>{sort}</Text><FontAwesome name="angle-down" size={14} color={AppColors.textSecondary} /></Pressable>
        </View>
        {results.map((meetup) => <MeetupCard key={meetup.id} meetup={meetup} onPress={() => router.push({ pathname: '/meetup/[id]', params: { id: meetup.id } })} />)}
        {!results.length ? <View style={styles.empty}><View style={styles.emptyIcon}><FontAwesome name="compass" size={30} color={AppColors.accent} /></View><Text style={styles.emptyTitle}>Chưa tìm thấy kèo phù hợp</Text><Text style={styles.emptyText}>Thử đổi từ khóa hoặc xóa bộ lọc để xem thêm meetup quanh bạn.</Text><View style={styles.emptyAction}><AppButton label="Xóa bộ lọc" compact variant="secondary" onPress={reset} /></View></View> : null}
      </ScrollView>

      <BottomSheet visible={sortSheet} title="Sắp xếp meetup" onClose={() => setSortSheet(false)}>
        <View style={styles.sortOptions}>
          {SORT_OPTIONS.map((option) => (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected: sort === option }}
              onPress={() => { setSort(option); setSortSheet(false); }}
              style={({ pressed }) => [styles.sortOption, sort === option && styles.sortOptionSelected, pressed && styles.optionPressed]}>
              <View style={[styles.radio, sort === option && styles.radioSelected]}>{sort === option ? <View style={styles.radioDot} /> : null}</View>
              <View style={{ flex: 1 }}><Text style={styles.sortOptionTitle}>{option}</Text><Text style={styles.sortOptionSub}>{sortDescription(option)}</Text></View>
              {sort === option ? <FontAwesome name="check" size={15} color={AppColors.accent} /> : null}
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

function sortDescription(sort: MeetupSort) {
  if (sort === 'Sắp diễn ra') return 'Ưu tiên ngày và giờ gần nhất';
  if (sort === 'Còn nhiều chỗ') return 'Ưu tiên các nhóm vẫn còn nhiều chỗ';
  return 'Ưu tiên meetup có khoảng cách gần bạn';
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.background }, content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 34 }, eyebrow: { ...TypeScale.caption, fontFamily: FontFamily.bodySemiBold, color: AppColors.accent, letterSpacing: 1 }, heading: { ...TypeScale.h1, color: AppColors.text, marginTop: 2 }, subtitle: { ...TypeScale.body, color: AppColors.textSecondary, marginTop: 4 },
  search: { height: 54, marginTop: 20, borderRadius: Radius.md, backgroundColor: AppColors.surface, borderWidth: 1, borderColor: AppColors.border, flexDirection: 'row', alignItems: 'center', paddingLeft: 16 }, input: { ...TypeScale.body, color: AppColors.text, flex: 1, paddingHorizontal: 11 }, filterButton: { width: 42, height: 42, borderRadius: 13, backgroundColor: AppColors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 6 }, filters: { gap: 8, paddingVertical: 16, paddingRight: 18 }, resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 3, marginBottom: 13 }, resultCopy: { flex: 1, minWidth: 0 }, resultTitle: { ...TypeScale.h3, fontFamily: FontFamily.headingBold, color: AppColors.text }, resultSub: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 1 }, sort: { maxWidth: 128, flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: AppColors.section, paddingHorizontal: 10, paddingVertical: 7, borderRadius: Radius.pill }, sortText: { ...TypeScale.caption, color: AppColors.textSecondary, flexShrink: 1 },
  empty: { alignItems: 'center', paddingVertical: 54 }, emptyIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center' }, emptyTitle: { ...TypeScale.h3, fontFamily: FontFamily.headingBold, color: AppColors.text, marginTop: 14 }, emptyText: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center', maxWidth: 270, marginTop: 5 }, emptyAction: { marginTop: 16 },
  sortOptions: { gap: 9 }, sortOption: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1, borderColor: AppColors.border, backgroundColor: AppColors.surface }, sortOptionSelected: { borderColor: AppColors.primary, backgroundColor: AppColors.primarySoft }, optionPressed: { opacity: 0.78 }, radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: AppColors.border, alignItems: 'center', justifyContent: 'center' }, radioSelected: { borderColor: AppColors.accent }, radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: AppColors.accent }, sortOptionTitle: { ...TypeScale.label, color: AppColors.text }, sortOptionSub: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 2 },
});
