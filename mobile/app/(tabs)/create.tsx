import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, AppInput, BottomSheet, Chip, SurfaceCard } from '@/components/ui/app-primitives';
import { AppColors, FontFamily, Radius, TypeScale } from '@/constants/theme';
import { ALCOHOL_TYPES, BILL_SPLITS, DEPOSIT_OPTIONS, DRINK_LIMITS, SESSION_CATEGORIES } from '@/src/features/sessions/constants';
import { useCreateMeetup } from '@/src/features/sessions/hooks/use-create-meetup';
import { createMeetupDateOptions, toLocalIsoDate, validateCreateMeetupForm, type CreateMeetupFormErrors } from '@/src/features/sessions/services/create-meetup-form';
import { formatVND } from '@/src/features/sessions/services/session-rules';

const TYPES = [...SESSION_CATEGORIES];
const VIBES = ['Chill', 'Vui vẻ', 'Nhậu', 'Người mới', 'Nhóm nhỏ', 'Rooftop'];
const SIZES = [2, 3, 4, 6, 8, 10, 12];
const TIMES = ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'];

type Sheet = 'date' | 'time' | 'size' | 'payment' | 'alcohol' | 'drink' | 'deposit' | null;

export default function CreateMeetupScreen() {
  const router = useRouter();
  const { createMeetup, notify } = useCreateMeetup();
  const dates = useMemo(() => createMeetupDateOptions(), []);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('Quận 1');
  const [description, setDescription] = useState('');
  const [menuNote, setMenuNote] = useState('');
  const [billNote, setBillNote] = useState('');
  const [category, setCategory] = useState<string>(TYPES[0]);
  const [alcoholType, setAlcoholType] = useState<string>(ALCOHOL_TYPES[0]);
  const [vibes, setVibes] = useState<string[]>(['Chill']);
  const [date, setDate] = useState(dates[0]?.value ?? toLocalIsoDate(new Date()));
  const [time, setTime] = useState('19:30');
  const [size, setSize] = useState(4);
  const [paymentType, setPaymentType] = useState<string>(BILL_SPLITS[0]);
  const [drinkLimit, setDrinkLimit] = useState<string>(DRINK_LIMITS[0]);
  const [depositAmount, setDepositAmount] = useState<number>(50000);
  const [isPublic, setIsPublic] = useState(true);
  const [ageConfirm, setAgeConfirm] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [errors, setErrors] = useState<CreateMeetupFormErrors>({});

  const selectedDate = dates.find((item) => item.value === date)?.label ?? date;
  const toggleVibe = (value: string) => setVibes((current) => current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value]);

  const validate = () => {
    const next = validateCreateMeetupForm({ title, location, date, time, description, ageConfirmed: ageConfirm });
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
      district,
      maxParticipants: size,
      paymentType,
      vibe: vibes,
      description,
      isPublic,
      alcoholType,
      menuNote,
      billNote,
      drinkLimit,
      ageConfirm,
      depositAmount,
    });
    if (!meetupId) {
      notify(!ageConfirm ? 'Vui lòng xác nhận 18+ trước khi tạo kèo.' : 'Vui lòng đăng nhập trước khi tạo kèo nhậu.');
      return;
    }
    router.replace({ pathname: '/meetup/[id]', params: { id: meetupId } });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>HOST MODE · NHẬU</Text>
        <Text style={styles.heading}>Rủ kèo nhậu mới</Text>
        <Text style={styles.subtitle}>Quán rõ ràng, bill rõ ràng, 18+ và uống có trách nhiệm.</Text>

        <View style={styles.note}>
          <View style={styles.noteIcon}><FontAwesome name="beer" size={16} color={AppColors.accent} /></View>
          <Text style={styles.noteText}>Chỉ rủ ở quán công cộng. Ghi rõ ai trả + giới hạn uống để mọi người yên tâm tham gia.</Text>
        </View>

        <View style={styles.form}>
          <View>
            <AppInput
              label="Tên kèo *"
              value={title}
              onChangeText={(value) => { setTitle(value); if (errors.title) setErrors((current) => ({ ...current, title: undefined })); }}
              placeholder="Ví dụ: Rooftop bia sau giờ làm"
              maxLength={80}
            />
            <FieldMessage error={errors.title} />
          </View>

          <View>
            <Text style={styles.label}>Loại kèo nhậu</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {TYPES.map((item) => <Chip key={item} label={item} selected={category === item} onPress={() => setCategory(item)} />)}
            </ScrollView>
          </View>

          <View style={styles.twoColumns}>
            <PickerField icon="beer" label="Uống gì?" value={alcoholType} onPress={() => setSheet('alcohol')} />
            <PickerField icon="glass" label="Giới hạn" value={drinkLimit} onPress={() => setSheet('drink')} />
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
              label="Quán / địa điểm *"
              icon="map-marker"
              value={location}
              onChangeText={(value) => { setLocation(value); if (errors.location) setErrors((current) => ({ ...current, location: undefined })); }}
              placeholder="Ốc Đào, Heart of Darkness, rooftop..."
              maxLength={100}
            />
            <FieldMessage error={errors.location} />
          </View>

          <View>
            <AppInput
              label="Quận / khu vực"
              icon="location-arrow"
              value={district}
              onChangeText={setDistrict}
              placeholder="Quận 1, Bình Thạnh, TP. Thủ Đức..."
              maxLength={60}
            />
          </View>

          <View style={styles.twoColumns}>
            <PickerField icon="users" label="Số người" value={`Tối đa ${size}`} onPress={() => setSheet('size')} />
            <PickerField icon="money" label="Chia bill" value={paymentType} onPress={() => setSheet('payment')} />
          </View>

          <PickerField icon="lock" label="Cọc chống bùng / người" value={depositAmount === 0 ? 'Không cọc' : formatVND(depositAmount)} onPress={() => setSheet('deposit')} />
          <Text style={styles.hint}>Cọc demo giữ chỗ. Hủy sát giờ mất cọc chia cho người ở lại.</Text>

          <View>
            <Text style={styles.label}>Không khí bạn muốn</Text>
            <View style={styles.chipWrap}>
              {VIBES.map((item) => <Chip key={item} label={item} selected={vibes.includes(item)} onPress={() => toggleVibe(item)} />)}
            </View>
          </View>

          <View>
            <AppInput
              label="Món dự kiến (mỗi dòng 1 món)"
              value={menuNote}
              onChangeText={setMenuNote}
              placeholder={'Ốc len xào dừa 95k\nBia Tiger 23k'}
              multiline
              maxLength={300}
            />
            <Text style={styles.hint}>Ghi tên + giá để app ước tính bill/người.</Text>
          </View>

          <View>
            <AppInput
              label="Ghi chú chia tiền"
              value={billNote}
              onChangeText={setBillNote}
              placeholder="Campuchia tại bàn, khoảng 120k/người"
              multiline
              maxLength={200}
            />
          </View>

          <View>
            <AppInput
              label="Mô tả kèo"
              value={description}
              onChangeText={setDescription}
              placeholder="Happy hour mấy giờ, có chỗ không cồn không, ai say thì Grab về chung..."
              multiline
              maxLength={300}
            />
            <View style={styles.descriptionMeta}>
              <FieldMessage error={errors.description} />
              <Text style={styles.counter}>{description.length}/300</Text>
            </View>
          </View>

          <SurfaceCard style={styles.privacyCard}>
            <View style={styles.privacyIcon}><FontAwesome name="id-card" size={17} color={AppColors.danger} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.privacyTitle}>Cam kết 18+</Text>
              <Text style={styles.privacyText}>Tất cả thành viên tham gia kèo có cồn đã đủ 18 tuổi. Không ép uống.</Text>
            </View>
            <Switch value={ageConfirm} onValueChange={(v) => { setAgeConfirm(v); if (v) setErrors((c) => ({ ...c, age: undefined })); }} trackColor={{ false: AppColors.border, true: AppColors.success }} thumbColor={AppColors.surface} />
          </SurfaceCard>
          <FieldMessage error={errors.age} />

          <SurfaceCard style={styles.privacyCard}>
            <View style={styles.privacyIcon}><FontAwesome name={isPublic ? 'globe' : 'lock'} size={17} color={AppColors.accent} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.privacyTitle}>{isPublic ? 'Kèo công khai' : 'Kèo riêng tư'}</Text>
              <Text style={styles.privacyText}>{isPublic ? 'Mọi người có thể khám phá và xin tham gia.' : 'Chỉ thành viên được mời mới thấy.'}</Text>
            </View>
            <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ false: AppColors.border, true: AppColors.primary }} thumbColor={AppColors.surface} />
          </SurfaceCard>

          <AppButton label="Tạo kèo nhậu" icon="beer" onPress={submit} />
        </View>
      </ScrollView>

      <BottomSheet visible={sheet === 'date'} title="Chọn ngày nhậu" onClose={() => setSheet(null)}>
        <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.options}>{dates.map((item) => <OptionRow key={item.value} label={item.label} selected={date === item.value} onPress={() => { setDate(item.value); setErrors((current) => ({ ...current, date: undefined })); setSheet(null); }} />)}</View>
        </ScrollView>
      </BottomSheet>

      <BottomSheet visible={sheet === 'time'} title="Chọn giờ lên bia" onClose={() => setSheet(null)}>
          <View style={styles.optionGrid}>{TIMES.map((item) => <Pressable key={item} onPress={() => { setTime(item); setErrors((current) => ({ ...current, date: undefined })); setSheet(null); }} style={[styles.timeOption, time === item && styles.timeOptionActive]}><Text style={[styles.timeText, time === item && styles.timeTextActive]}>{item}</Text></Pressable>)}</View>
      </BottomSheet>

      <BottomSheet visible={sheet === 'size'} title="Chọn quy mô bàn nhậu" onClose={() => setSheet(null)}>
        <View style={styles.options}>{SIZES.map((value) => <OptionRow key={value} label={`Tối đa ${value} người`} caption={value <= 4 ? 'Bàn nhỏ, dễ tàn chuyện' : value <= 6 ? 'Vừa vui vừa ấm' : 'Bàn đông, chia 2 mâm'} selected={size === value} onPress={() => { setSize(value); setSheet(null); }} />)}</View>
      </BottomSheet>

      <BottomSheet visible={sheet === 'payment'} title="Chia bill thế nào?" onClose={() => setSheet(null)}>
        <View style={styles.options}>{BILL_SPLITS.map((item) => <OptionRow key={item} label={item} selected={paymentType === item} onPress={() => { setPaymentType(item); setSheet(null); }} />)}</View>
      </BottomSheet>

      <BottomSheet visible={sheet === 'alcohol'} title="Nhậu món gì?" onClose={() => setSheet(null)}>
        <View style={styles.options}>{ALCOHOL_TYPES.map((item) => <OptionRow key={item} label={item} selected={alcoholType === item} onPress={() => { setAlcoholType(item); setSheet(null); }} />)}</View>
      </BottomSheet>

      <BottomSheet visible={sheet === 'drink'} title="Giới hạn uống" onClose={() => setSheet(null)}>
        <View style={styles.options}>{DRINK_LIMITS.map((item) => <OptionRow key={item} label={item} selected={drinkLimit === item} onPress={() => { setDrinkLimit(item); setSheet(null); }} />)}</View>
      </BottomSheet>

      <BottomSheet visible={sheet === 'deposit'} title="Cọc chống bùng" onClose={() => setSheet(null)}>
        <View style={styles.options}>{DEPOSIT_OPTIONS.map((v) => <OptionRow key={v} label={v === 0 ? 'Không cọc' : formatVND(v)} caption={v === 0 ? 'Dễ bị bùng giờ chót' : v <= 50000 ? 'Giữ chỗ nhẹ, dễ rủ' : 'Chắc kèo, lọc người nghiêm túc'} selected={depositAmount === v} onPress={() => { setDepositAmount(v); setSheet(null); }} />)}</View>
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
  note: { flexDirection: 'row', gap: 11, backgroundColor: AppColors.accentSoft, borderRadius: Radius.md, padding: 14, marginTop: 20 },
  noteIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: AppColors.surface, alignItems: 'center', justifyContent: 'center' },
  noteText: { ...TypeScale.caption, color: AppColors.accentText, flex: 1 },
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
