import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, AppInput, BottomSheet, Chip, SurfaceCard } from '@/components/ui/app-primitives';
import { AppColors, FontFamily, Radius, TypeScale } from '@/constants/theme';

const TYPES = ['Ăn uống', 'Café', 'Board game', 'Karaoke'];
const VIBES = ['Chill', 'Vui vẻ', 'Networking', 'Người mới'];
const SIZES = [4, 6, 8, 10];

export default function CreateMeetupScreen() {
  const [title, setTitle] = useState(''); const [venue, setVenue] = useState(''); const [description, setDescription] = useState('');
  const [type, setType] = useState(TYPES[0]); const [vibes, setVibes] = useState(['Chill']); const [size, setSize] = useState(6); const [isPublic, setIsPublic] = useState(true); const [sizeSheet, setSizeSheet] = useState(false);
  const toggleVibe = (value: string) => setVibes((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  const submit = () => { if (!title.trim() || !venue.trim()) return Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên kèo và địa điểm.'); Alert.alert('Tạo kèo thành công 🎉', 'Kèo đã sẵn sàng để bạn mời thêm homie.'); setTitle(''); setVenue(''); setDescription(''); };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>HOST MODE</Text><Text style={styles.heading}>Tạo một kèo mới</Text><Text style={styles.subtitle}>Cho mọi người biết bạn muốn gặp nhau thế nào.</Text>
        <View style={styles.note}><View style={styles.noteIcon}><FontAwesome name="shield" size={16} color={AppColors.success} /></View><Text style={styles.noteText}>Chọn địa điểm công cộng và mô tả rõ chi phí để mọi người yên tâm tham gia.</Text></View>

        <View style={styles.form}>
          <AppInput label="Tên kèo *" value={title} onChangeText={setTitle} placeholder="Ví dụ: Rooftop chill sau giờ làm" />
          <View><Text style={styles.label}>Loại meetup</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{TYPES.map((item) => <Chip key={item} label={item} selected={type === item} onPress={() => setType(item)} />)}</ScrollView></View>
          <View style={styles.twoColumns}><StaticField icon="calendar" label="Ngày" value="Thứ Sáu, 18/09" /><StaticField icon="clock-o" label="Giờ" value="19:30" /></View>
          <AppInput label="Địa điểm *" icon="map-marker" value={venue} onChangeText={setVenue} placeholder="Quán café hoặc địa điểm công cộng" />
          <View style={styles.twoColumns}>
            <Pressable onPress={() => setSizeSheet(true)} style={{ flex: 1 }}><StaticField icon="users" label="Số người" value={`Tối đa ${size}`} /></Pressable>
            <StaticField icon="money" label="Ai trả?" value="Mỗi người tự trả" />
          </View>
          <View><Text style={styles.label}>Không khí bạn muốn</Text><View style={styles.chipWrap}>{VIBES.map((item) => <Chip key={item} label={item} selected={vibes.includes(item)} onPress={() => toggleVibe(item)} />)}</View></View>
          <AppInput label="Mô tả" value={description} onChangeText={setDescription} placeholder="Kể ngắn gọn về hoạt động và điều mọi người nên biết..." multiline maxLength={300} />
          <SurfaceCard style={styles.privacyCard}><View style={styles.privacyIcon}><FontAwesome name={isPublic ? 'globe' : 'lock'} size={17} color={AppColors.accent} /></View><View style={{ flex: 1 }}><Text style={styles.privacyTitle}>{isPublic ? 'Meetup công khai' : 'Meetup riêng tư'}</Text><Text style={styles.privacyText}>{isPublic ? 'Mọi người có thể khám phá và xin tham gia.' : 'Chỉ người có lời mời mới thấy meetup.'}</Text></View><Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ false: AppColors.border, true: AppColors.primary }} thumbColor={AppColors.surface} /></SurfaceCard>
          <AppButton label="Tạo meetup" icon="plus" onPress={submit} />
        </View>
      </ScrollView>

      <BottomSheet visible={sizeSheet} title="Chọn quy mô nhóm" onClose={() => setSizeSheet(false)}>
        <View style={styles.sizeOptions}>{SIZES.map((value) => <Pressable key={value} onPress={() => { setSize(value); setSizeSheet(false); }} style={[styles.sizeOption, size === value && styles.sizeOptionActive]}><View><Text style={styles.sizeTitle}>Tối đa {value} người</Text><Text style={styles.sizeText}>{value <= 6 ? 'Nhóm nhỏ, dễ trò chuyện' : 'Nhiều năng lượng hơn'}</Text></View>{size === value ? <FontAwesome name="check-circle" size={20} color={AppColors.accent} /> : null}</Pressable>)}</View>
      </BottomSheet>
    </SafeAreaView>
  );
}

function StaticField({ icon, label, value }: { icon: React.ComponentProps<typeof FontAwesome>['name']; label: string; value: string }) { return <View style={styles.staticField}><Text style={styles.label}>{label}</Text><View style={styles.staticInput}><FontAwesome name={icon} size={15} color={AppColors.accent} /><Text numberOfLines={1} style={styles.staticText}>{value}</Text><FontAwesome name="angle-down" size={15} color={AppColors.textSecondary} /></View></View>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.background }, content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 40 }, eyebrow: { ...TypeScale.caption, fontFamily: FontFamily.bodySemiBold, color: AppColors.accent, letterSpacing: 1 }, heading: { ...TypeScale.h1, color: AppColors.text, marginTop: 2 }, subtitle: { ...TypeScale.body, color: AppColors.textSecondary, marginTop: 4 },
  note: { flexDirection: 'row', gap: 11, backgroundColor: AppColors.successSoft, borderRadius: Radius.md, padding: 14, marginTop: 20 }, noteIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: AppColors.surface, alignItems: 'center', justifyContent: 'center' }, noteText: { ...TypeScale.caption, color: '#326E56', flex: 1 }, form: { gap: 21, marginTop: 24 }, label: { ...TypeScale.label, color: AppColors.text, marginBottom: 8 }, chipRow: { gap: 8, paddingRight: 18 }, chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, twoColumns: { flexDirection: 'row', gap: 12 }, staticField: { flex: 1 }, staticInput: { height: 54, borderRadius: Radius.md, borderWidth: 1, borderColor: AppColors.border, backgroundColor: AppColors.surface, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 8 }, staticText: { fontFamily: FontFamily.bodyMedium, fontSize: 12, lineHeight: 17, color: AppColors.text, flex: 1 },
  privacyCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }, privacyIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center' }, privacyTitle: { ...TypeScale.label, color: AppColors.text }, privacyText: { fontFamily: FontFamily.body, fontSize: 10, lineHeight: 15, color: AppColors.textSecondary, marginTop: 2 },
  sizeOptions: { gap: 9 }, sizeOption: { minHeight: 66, borderRadius: Radius.md, borderWidth: 1, borderColor: AppColors.border, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sizeOptionActive: { borderColor: AppColors.primary, backgroundColor: AppColors.section }, sizeTitle: { ...TypeScale.label, color: AppColors.text }, sizeText: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 2 },
});
