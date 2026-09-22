import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, AppInput, BottomSheet, Chip, SurfaceCard } from '@/components/ui/app-primitives';
import { AppColors, FontFamily, Radius, TypeScale } from '@/constants/theme';
import { useDemoApp } from '@/context/demo-app-context';

const TYPES = ['Ăn uống', 'Café', 'Board game', 'Karaoke', 'Rooftop', 'Networking', 'Khác'];
const VIBES = ['Chill', 'Vui vẻ', 'Networking', 'Người mới', 'Nhóm nhỏ'];
const SIZES = [2, 4, 6, 8, 10, 12];
const TIMES = ['08:00', '09:30', '14:00', '17:30', '18:00', '19:00', '19:30', '20:00'];
const PAYMENTS = ['Mỗi người tự trả', 'Chia đều', 'Host mời', 'Thống nhất tại meetup'];

type Sheet = 'date' | 'time' | 'size' | 'payment' | null;
type FormErrors = Partial<Record<'title' | 'location' | 'date' | 'description', string>>;

function toIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createDateOptions() {
  return Array.from({ length: 14 }, (_, index) => {
    const value = new Date();
    value.setHours(12, 0, 0, 0);
    value.setDate(value.getDate() + index);
    const prefix = index === 0 ? 'Hôm nay' : index === 1 ? 'Ngày mai' : value.toLocaleDateString('vi-VN', { weekday: 'long' });
    return {
      value: toIsoDate(value),
      label: `${prefix}, ${value.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`,
    };
  });
}

export default function CreateMeetupScreen() {
  const router = useRouter();
  const { createMeetup, notify } = useDemoApp();
  const dates = useMemo(() => createDateOptions(), []);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(TYPES[0]);
  const [vibes, setVibes] = useState<string[]>(['Chill']);
  const [date, setDate] = useState(dates[1]?.value ?? toIsoDate(new Date()));
  const [time, setTime] = useState('19:30');
  const [size, setSize] = useState(6);
  const [paymentType, setPaymentType] = useState(PAYMENTS[0]);
  const [isPublic, setIsPublic] = useState(true);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const selectedDate = dates.find((item) => item.value === date)?.label ?? date;
  const toggleVibe = (value: string) => setVibes((current) => current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value]);

  const validate = () => {
    const next: FormErrors = {};
    if (!title.trim()) next.title = 'Vui lòng đặt tên cho kèo.';
    else if (title.trim().length < 3) next.title = 'Tên kèo cần ít nhất 3 ký tự.';
    if (!location.trim()) next.location = 'Vui lòng nhập địa điểm gặp mặt.';
    const startsAt = new Date(`${date}T${time}:00`);
    if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) next.date = 'Ngày và giờ meetup phải ở trong tương lai.';
    if (description.length > 300) next.description = 'Mô tả tối đa 300 ký tự.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    const meetupId = createMeetup({
      title,
      category,
      date,
      time,
      location,
      maxParticipants: size,
      paymentType,
      vibe: vibes,
      description,
      isPublic,
    });
    if (!meetupId) {
      notify('Vui lòng đăng nhập trước khi tạo meetup.');
      return;
    }
    router.replace({ pathname: '/meetup/[id]', params: { id: meetupId } });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>HOST MODE</Text>
        <Text style={styles.heading}>Tạo một kèo mới</Text>
        <Text style={styles.subtitle}>Cho mọi người biết bạn muốn gặp nhau thế nào.</Text>

        <View style={styles.note}>
          <View style={styles.noteIcon}><FontAwesome name="shield" size={16} color={AppColors.success} /></View>
          <Text style={styles.noteText}>Chọn địa điểm công cộng và mô tả rõ chi phí để mọi người yên tâm tham gia.</Text>
        </View>

        <View style={styles.form}>
          <View>
            <AppInput
              label="Tên kèo *"
              value={title}
              onChangeText={(value) => { setTitle(value); if (errors.title) setErrors((current) => ({ ...current, title: undefined })); }}
              placeholder="Ví dụ: Rooftop chill sau giờ làm"
              maxLength={80}
            />
            <FieldMessage error={errors.title} />
          </View>

          <View>
            <Text style={styles.label}>Loại meetup</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {TYPES.map((item) => <Chip key={item} label={item} selected={category === item} onPress={() => setCategory(item)} />)}
            </ScrollView>
          </View>

          <View>
            <View style={styles.twoColumns}>
              <PickerField icon="calendar" label="Ngày" value={selectedDate} onPress={() => setSheet('date')} />
              <PickerField icon="clock-o" label="Giờ" value={time} onPress={() => setSheet('time')} />
            </View>
            <FieldMessage error={errors.date} />
          </View>

          <View>
            <AppInput
              label="Địa điểm *"
              icon="map-marker"
              value={location}
              onChangeText={(value) => { setLocation(value); if (errors.location) setErrors((current) => ({ ...current, location: undefined })); }}
              placeholder="Quán café hoặc địa điểm công cộng"
              maxLength={100}
            />
            <FieldMessage error={errors.location} />
          </View>

          <View style={styles.twoColumns}>
            <PickerField icon="users" label="Số người" value={`Tối đa ${size}`} onPress={() => setSheet('size')} />
            <PickerField icon="money" label="Ai trả?" value={paymentType} onPress={() => setSheet('payment')} />
          </View>

          <View>
            <Text style={styles.label}>Không khí bạn muốn</Text>
            <View style={styles.chipWrap}>
              {VIBES.map((item) => <Chip key={item} label={item} selected={vibes.includes(item)} onPress={() => toggleVibe(item)} />)}
            </View>
            {!vibes.length ? <Text style={styles.hint}>Bạn có thể để trống hoặc chọn nhiều vibe.</Text> : null}
          </View>

          <View>
            <AppInput
              label="Mô tả"
              value={description}
              onChangeText={setDescription}
              placeholder="Kể ngắn gọn về hoạt động và điều mọi người nên biết..."
              multiline
              maxLength={300}
            />
            <View style={styles.descriptionMeta}>
              <FieldMessage error={errors.description} />
              <Text style={styles.counter}>{description.length}/300</Text>
            </View>
          </View>

          <SurfaceCard style={styles.privacyCard}>
            <View style={styles.privacyIcon}><FontAwesome name={isPublic ? 'globe' : 'lock'} size={17} color={AppColors.accent} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.privacyTitle}>{isPublic ? 'Meetup công khai' : 'Meetup riêng tư'}</Text>
              <Text style={styles.privacyText}>{isPublic ? 'Mọi người có thể khám phá và tham gia.' : 'Chỉ host và thành viên hiện có nhìn thấy meetup.'}</Text>
            </View>
            <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ false: AppColors.border, true: AppColors.primary }} thumbColor={AppColors.surface} />
          </SurfaceCard>

          <AppButton label="Tạo meetup" icon="plus" onPress={submit} />
        </View>
      </ScrollView>

      <BottomSheet visible={sheet === 'date'} title="Chọn ngày gặp" onClose={() => setSheet(null)}>
        <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.options}>{dates.map((item) => <OptionRow key={item.value} label={item.label} selected={date === item.value} onPress={() => { setDate(item.value); setErrors((current) => ({ ...current, date: undefined })); setSheet(null); }} />)}</View>
        </ScrollView>
      </BottomSheet>

      <BottomSheet visible={sheet === 'time'} title="Chọn giờ bắt đầu" onClose={() => setSheet(null)}>
          <View style={styles.optionGrid}>{TIMES.map((item) => <Pressable key={item} onPress={() => { setTime(item); setErrors((current) => ({ ...current, date: undefined })); setSheet(null); }} style={[styles.timeOption, time === item && styles.timeOptionActive]}><Text style={[styles.timeText, time === item && styles.timeTextActive]}>{item}</Text></Pressable>)}</View>
      </BottomSheet>

      <BottomSheet visible={sheet === 'size'} title="Chọn quy mô nhóm" onClose={() => setSheet(null)}>
        <View style={styles.options}>{SIZES.map((value) => <OptionRow key={value} label={`Tối đa ${value} người`} caption={value <= 6 ? 'Nhóm nhỏ, dễ trò chuyện' : 'Nhiều năng lượng hơn'} selected={size === value} onPress={() => { setSize(value); setSheet(null); }} />)}</View>
      </BottomSheet>

      <BottomSheet visible={sheet === 'payment'} title="Chi phí được chia thế nào?" onClose={() => setSheet(null)}>
        <View style={styles.options}>{PAYMENTS.map((item) => <OptionRow key={item} label={item} selected={paymentType === item} onPress={() => { setPaymentType(item); setSheet(null); }} />)}</View>
      </BottomSheet>
    </SafeAreaView>
  );
}

function PickerField({ icon, label, value, onPress }: { icon: React.ComponentProps<typeof FontAwesome>['name']; label: string; value: string; onPress: () => void }) {
  return <View style={styles.pickerField}><Text style={styles.label}>{label}</Text><Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} onPress={onPress} style={({ pressed }) => [styles.staticInput, pressed && styles.pressed]}><FontAwesome name={icon} size={15} color={AppColors.accent} /><Text numberOfLines={1} style={styles.staticText}>{value}</Text><FontAwesome name="angle-down" size={15} color={AppColors.textSecondary} /></Pressable></View>;
}

function OptionRow({ label, caption, selected, onPress }: { label: string; caption?: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={({ pressed }) => [styles.option, selected && styles.optionActive, pressed && styles.pressed]}><View style={{ flex: 1 }}><Text style={styles.optionTitle}>{label}</Text>{caption ? <Text style={styles.optionCaption}>{caption}</Text> : null}</View>{selected ? <FontAwesome name="check-circle" size={20} color={AppColors.accent} /> : null}</Pressable>;
}

function FieldMessage({ error }: { error?: string }) {
  return error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.background },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 40 },
  eyebrow: { ...TypeScale.caption, fontFamily: FontFamily.bodySemiBold, color: AppColors.accent, letterSpacing: 1 },
  heading: { ...TypeScale.h1, color: AppColors.text, marginTop: 2 },
  subtitle: { ...TypeScale.body, color: AppColors.textSecondary, marginTop: 4 },
  note: { flexDirection: 'row', gap: 11, backgroundColor: AppColors.successSoft, borderRadius: Radius.md, padding: 14, marginTop: 20 },
  noteIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: AppColors.surface, alignItems: 'center', justifyContent: 'center' },
  noteText: { ...TypeScale.caption, color: '#326E56', flex: 1 },
  form: { gap: 21, marginTop: 24 },
  label: { ...TypeScale.label, color: AppColors.text, marginBottom: 8 },
  chipRow: { gap: 8, paddingRight: 18 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  twoColumns: { flexDirection: 'row', gap: 12 },
  pickerField: { flex: 1 },
  staticInput: { height: 54, borderRadius: Radius.md, borderWidth: 1, borderColor: AppColors.border, backgroundColor: AppColors.surface, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 8 },
  staticText: { fontFamily: FontFamily.bodyMedium, fontSize: 12, lineHeight: 17, color: AppColors.text, flex: 1 },
  pressed: { opacity: 0.76 },
  error: { ...TypeScale.caption, color: AppColors.danger, marginTop: 6 },
  hint: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 7 },
  descriptionMeta: { minHeight: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  counter: { ...TypeScale.caption, color: AppColors.textSecondary, marginLeft: 'auto', marginTop: 6 },
  privacyCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  privacyIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  privacyTitle: { ...TypeScale.label, color: AppColors.text },
  privacyText: { fontFamily: FontFamily.body, fontSize: 10, lineHeight: 15, color: AppColors.textSecondary, marginTop: 2 },
  sheetScroll: { maxHeight: 430 },
  options: { gap: 9, paddingBottom: 4 },
  option: { minHeight: 58, borderRadius: Radius.md, borderWidth: 1, borderColor: AppColors.border, paddingHorizontal: 16, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionActive: { borderColor: AppColors.primary, backgroundColor: AppColors.section },
  optionTitle: { ...TypeScale.label, color: AppColors.text },
  optionCaption: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 2 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeOption: { width: '22%', minWidth: 68, height: 48, borderRadius: 14, borderWidth: 1, borderColor: AppColors.border, backgroundColor: AppColors.surface, alignItems: 'center', justifyContent: 'center' },
  timeOptionActive: { borderColor: AppColors.primary, backgroundColor: AppColors.primarySoft },
  timeText: { ...TypeScale.label, color: AppColors.textSecondary },
  timeTextActive: { color: AppColors.text },
});
