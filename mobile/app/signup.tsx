import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, AppInput, Chip, SurfaceCard } from '@/components/ui/app-primitives';
import { AppColors, FontFamily, Radius, TypeScale, WarmShadow } from '@/constants/theme';
import { useDemoApp } from '@/context/demo-app-context';

const DRAFT_KEY = '@chillwithhomies/signup-draft-v1';
const DEMO_OTP = '123456';
const INTERESTS = ['Nhậu', 'Bia', 'Quán ốc', 'Rooftop', 'Lẩu nướng', 'Café', 'Board game', 'Karaoke', 'Nhóm nhỏ', 'Networking', 'Chạy bộ', 'Workshop'];
const VIBES = ['Chill', 'Vui vẻ', 'Nhậu', 'Nhóm nhỏ', 'Làm quen người mới', 'Uống có trách nhiệm'];
const AVATAR_COLORS = ['#F28C28', '#E88F9C', '#7C9A65', '#668CB8', '#B583A7', '#D07A72'];

type Step = 'account' | 'verify' | 'profile' | 'interests' | 'safety' | 'complete';
type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken';
type Draft = {
  step: Step;
  phone: string;
  phoneVerified: boolean;
  name: string;
  username: string;
  dateOfBirth: string;
  city: string;
  bio: string;
  avatarColor: string;
  avatarUri?: string;
  interests: string[];
  preferredVibes: string[];
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  notificationsEnabled: boolean;
};

const initialDraft: Draft = {
  step: 'account', phone: '', phoneVerified: false, name: '', username: '', dateOfBirth: '', city: 'TP. Hồ Chí Minh', bio: '',
  avatarColor: AVATAR_COLORS[0], avatarUri: undefined, interests: [], preferredVibes: ['Chill'], acceptedTerms: false, acceptedPrivacy: false, notificationsEnabled: true,
};

const stepNumber: Record<Exclude<Step, 'complete'>, number> = { account: 1, verify: 2, profile: 3, interests: 4, safety: 5 };

export default function SignUpScreen() {
  const router = useRouter();
  const { hydrated, state, completeSignUp, notify } = useDemoApp();
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accountTouched, setAccountTouched] = useState({ phone: false, password: false, confirm: false });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [verifying, setVerifying] = useState(false);
  const [usernameCheck, setUsernameCheck] = useState<{ value: string; taken: boolean } | null>(null);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [interestError, setInterestError] = useState('');
  const [consentAttempted, setConsentAttempted] = useState(false);
  const [creating, setCreating] = useState(false);
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const [completionInProgress, setCompletionInProgress] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(DRAFT_KEY).then((raw) => {
      if (!active || !raw) return;
      const stored = JSON.parse(raw) as Partial<Draft>;
      const requestedStep: Step = ['account', 'verify', 'profile', 'interests', 'safety'].includes(stored.step ?? '') ? stored.step as Step : 'account';
      const validStep: Step = !stored.phoneVerified && !['account', 'verify'].includes(requestedStep) ? 'verify' : requestedStep;
      setDraft({
        ...initialDraft,
        ...stored,
        step: validStep,
        dateOfBirth: normalizeStoredDateOfBirth(stored.dateOfBirth),
        interests: Array.isArray(stored.interests) ? stored.interests : [],
        preferredVibes: Array.isArray(stored.preferredVibes) ? stored.preferredVibes : [],
      });
    }).catch(() => undefined).finally(() => { if (active) setDraftHydrated(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!draftHydrated || draft.step === 'complete') return;
    AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft)).catch(() => notify('Không thể lưu tiến trình đăng ký trên thiết bị này.'));
  }, [draft, draftHydrated, notify]);

  useEffect(() => {
    if (hydrated && draftHydrated && state.currentUser && !completionInProgress) router.replace('/');
  }, [completionInProgress, draftHydrated, hydrated, router, state.currentUser]);

  useEffect(() => {
    if (draft.step !== 'verify' || countdown <= 0 || draft.phoneVerified) return;
    const timer = setInterval(() => setCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [countdown, draft.phoneVerified, draft.step]);

  useEffect(() => {
    const username = cleanUsername(draft.username);
    if (draft.step !== 'profile' || !usernamePattern(username)) return;
    const timer = setTimeout(() => {
      const taken = state.users.some((user) => user.username.toLowerCase() === username.toLowerCase());
      setUsernameCheck({ value: username.toLowerCase(), taken });
    }, 450);
    return () => clearTimeout(timer);
  }, [draft.step, draft.username, state.users]);

  const accountErrors = useMemo(() => validateAccount(draft.phone, password, confirmPassword), [confirmPassword, draft.phone, password]);
  const accountValid = !accountErrors.phone && !accountErrors.password && !accountErrors.confirm;
  const normalizedUsername = cleanUsername(draft.username).toLowerCase();
  const usernameStatus: UsernameStatus = draft.step !== 'profile' || !usernamePattern(normalizedUsername)
    ? 'idle'
    : usernameCheck?.value !== normalizedUsername
      ? 'checking'
      : usernameCheck.taken ? 'taken' : 'available';
  const currentStep = draft.step === 'complete' ? 5 : stepNumber[draft.step];

  const updateDraft = (values: Partial<Draft>) => setDraft((current) => ({ ...current, ...values }));
  const setStep = (step: Step) => updateDraft({ step });

  const goBack = () => {
    if (draft.step === 'account') return router.replace('/signin');
    if (draft.step === 'verify') return setStep('account');
    if (draft.step === 'profile') return setStep('verify');
    if (draft.step === 'interests') return setStep('profile');
    if (draft.step === 'safety') return setStep('interests');
  };

  const continueAccount = () => {
    if (!accountValid) return;
    updateDraft({ step: 'verify' });
    setOtpError('');
  };

  const changeOtp = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '');
    setOtpError('');
    if (digits.length > 1) {
      const next = [...otp];
      digits.slice(0, 6).split('').forEach((digit, offset) => { if (index + offset < 6) next[index + offset] = digit; });
      setOtp(next);
      otpRefs.current[Math.min(index + digits.length, 5)]?.focus();
      return;
    }
    setOtp((current) => current.map((digit, digitIndex) => digitIndex === index ? digits : digit));
    if (digits && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const verifyOtp = async () => {
    if (otp.join('').length !== 6) return setOtpError('Vui lòng nhập đủ 6 chữ số.');
    setVerifying(true);
    await delay(550);
    if (otp.join('') !== DEMO_OTP) {
      setOtpError('Mã xác thực không đúng.');
      setVerifying(false);
      return;
    }
    updateDraft({ phoneVerified: true, step: 'profile' });
    setVerifying(false);
    notify('Xác thực số điện thoại thành công.');
  };

  const resendOtp = () => {
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setCountdown(60);
    otpRefs.current[0]?.focus();
    notify('Đã gửi lại mã xác thực demo.');
  };

  const continueProfile = () => {
    const errors = validateProfile(draft, state.users.map((user) => user.username));
    setProfileErrors(errors);
    if (Object.keys(errors).length || usernameStatus === 'checking') return;
    setStep('interests');
  };

  const toggleInterest = (interest: string) => {
    updateDraft({ interests: draft.interests.includes(interest) ? draft.interests.filter((item) => item !== interest) : [...draft.interests, interest] });
    setInterestError('');
  };
  const toggleVibe = (vibe: string) => updateDraft({ preferredVibes: draft.preferredVibes.includes(vibe) ? draft.preferredVibes.filter((item) => item !== vibe) : [...draft.preferredVibes, vibe] });

  const continueInterests = () => {
    if (draft.interests.length < 3) return setInterestError('Vui lòng chọn ít nhất 3 sở thích.');
    setStep('safety');
  };

  const finish = async () => {
    setConsentAttempted(true);
    if (!draft.acceptedTerms || !draft.acceptedPrivacy || creating) return;
    if (!draft.phoneVerified) {
      setStep('verify');
      notify('Vui lòng xác thực số điện thoại trước khi tạo tài khoản.');
      return;
    }
    setCreating(true);
    await delay(650);
    setCompletionInProgress(true);
    const result = completeSignUp({
      phone: draft.phone,
      name: draft.name,
      username: draft.username,
      dateOfBirth: draft.dateOfBirth,
      city: draft.city,
      bio: draft.bio,
      avatarColor: draft.avatarColor,
      avatarUri: draft.avatarUri,
      interests: draft.interests,
      preferredVibes: draft.preferredVibes,
      notificationsEnabled: draft.notificationsEnabled,
    });
    if (!result.ok) {
      setCompletionInProgress(false);
      setCreating(false);
      notify(result.error ?? 'Không thể tạo tài khoản.');
      if (result.error?.toLowerCase().includes('username')) setStep('profile');
      return;
    }
    await AsyncStorage.removeItem(DRAFT_KEY).catch(() => undefined);
    setDraft((current) => ({ ...current, step: 'complete' }));
    setCreating(false);
    notify('Tạo tài khoản thành công!');
  };

  if (!hydrated || !draftHydrated || (state.currentUser && !completionInProgress && draft.step !== 'complete')) {
    return <View style={styles.loading}><ActivityIndicator color={AppColors.accent} /><Text style={styles.loadingText}>Đang mở đăng ký...</Text></View>;
  }

  if (draft.step === 'complete') {
    return <CompleteScreen name={draft.name} interests={draft.interests} onContinue={() => router.replace('/')} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={goBack} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><FontAwesome name="angle-left" size={20} color={AppColors.text} /></Pressable>
          <View style={styles.progressCopy}><Text style={styles.progressText}>BƯỚC {currentStep}/5</Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${currentStep * 20}%` }]} /></View></View>
          <View style={styles.backSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {draft.step === 'account' ? <AccountStep draft={draft} updateDraft={updateDraft} password={password} setPassword={setPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} showPassword={showPassword} setShowPassword={setShowPassword} showConfirm={showConfirm} setShowConfirm={setShowConfirm} touched={accountTouched} setTouched={setAccountTouched} errors={accountErrors} valid={accountValid} onContinue={continueAccount} /> : null}
          {draft.step === 'verify' ? <VerifyStep phone={draft.phone} verified={draft.phoneVerified} otp={otp} refs={otpRefs} error={otpError} countdown={countdown} loading={verifying} onChange={changeOtp} onVerify={verifyOtp} onResend={resendOtp} onContinue={() => setStep('profile')} onChangePhone={() => updateDraft({ step: 'account', phoneVerified: false })} /> : null}
          {draft.step === 'profile' ? <ProfileStep draft={draft} updateDraft={updateDraft} errors={profileErrors} setErrors={setProfileErrors} usernameStatus={usernameStatus} onContinue={continueProfile} /> : null}
          {draft.step === 'interests' ? <InterestsStep draft={draft} error={interestError} onToggleInterest={toggleInterest} onToggleVibe={toggleVibe} onContinue={continueInterests} /> : null}
          {draft.step === 'safety' ? <SafetyStep draft={draft} updateDraft={updateDraft} attempted={consentAttempted} loading={creating} onFinish={finish} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AccountStep({ draft, updateDraft, password, setPassword, confirmPassword, setConfirmPassword, showPassword, setShowPassword, showConfirm, setShowConfirm, touched, setTouched, errors, valid, onContinue }: {
  draft: Draft; updateDraft: (values: Partial<Draft>) => void; password: string; setPassword: (value: string) => void; confirmPassword: string; setConfirmPassword: (value: string) => void;
  showPassword: boolean; setShowPassword: (value: boolean) => void; showConfirm: boolean; setShowConfirm: (value: boolean) => void;
  touched: { phone: boolean; password: boolean; confirm: boolean }; setTouched: React.Dispatch<React.SetStateAction<{ phone: boolean; password: boolean; confirm: boolean }>>;
  errors: Record<string, string>; valid: boolean; onContinue: () => void;
}) {
  return <StepShell icon="user-plus" eyebrow="TẠO TÀI KHOẢN" title="Bắt đầu với số điện thoại" subtitle="Thông tin đăng nhập chỉ dùng để bảo vệ tài khoản demo của bạn.">
    <AppInput label="Số điện thoại" icon="phone" value={draft.phone} onChangeText={(phone) => updateDraft({ phone, phoneVerified: false })} onBlur={() => setTouched((current) => ({ ...current, phone: true }))} keyboardType="phone-pad" autoComplete="tel" placeholder="0901 234 567" error={touched.phone ? errors.phone : undefined} hint={!touched.phone ? 'Dùng số di động Việt Nam bắt đầu bằng 03, 05, 07, 08 hoặc 09.' : undefined} />
    <PasswordField label="Mật khẩu" value={password} onChangeText={setPassword} visible={showPassword} onToggle={() => setShowPassword(!showPassword)} onBlur={() => setTouched((current) => ({ ...current, password: true }))} error={touched.password ? errors.password : undefined} hint={!touched.password ? 'Ít nhất 8 ký tự, có cả chữ và số.' : undefined} />
    <PasswordField label="Xác nhận mật khẩu" value={confirmPassword} onChangeText={setConfirmPassword} visible={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} onBlur={() => setTouched((current) => ({ ...current, confirm: true }))} error={touched.confirm ? errors.confirm : undefined} />
    <View style={styles.secureNote}><FontAwesome name="lock" size={13} color={AppColors.success} /><Text style={styles.secureText}>Password và OTP không được lưu vào bộ nhớ thiết bị.</Text></View>
    <AppButton label="Tiếp tục" icon="arrow-right" disabled={!valid} onPress={onContinue} />
  </StepShell>;
}

function VerifyStep({ phone, verified, otp, refs, error, countdown, loading, onChange, onVerify, onResend, onContinue, onChangePhone }: {
  phone: string; verified: boolean; otp: string[]; refs: React.MutableRefObject<(TextInput | null)[]>; error: string; countdown: number; loading: boolean;
  onChange: (index: number, value: string) => void; onVerify: () => void; onResend: () => void; onContinue: () => void; onChangePhone: () => void;
}) {
  return <StepShell icon={verified ? 'check' : 'mobile'} eyebrow="XÁC THỰC ĐIỆN THOẠI" title={verified ? 'Số điện thoại đã xác thực' : 'Nhập mã xác thực'} subtitle={verified ? `${formatPhone(phone)} đã sẵn sàng cho tài khoản mới.` : `Chúng tôi đã gửi mã đến ${formatPhone(phone)}.`}>
    {verified ? <View style={styles.verifiedCard}><FontAwesome name="check-circle" size={24} color={AppColors.success} /><View style={{ flex: 1 }}><Text style={styles.verifiedTitle}>Xác thực thành công</Text><Text style={styles.verifiedText}>Bạn có thể tiếp tục hoàn thiện hồ sơ.</Text></View></View> : <>
      <View style={styles.otpRow}>{otp.map((digit, index) => <TextInput key={index} ref={(input) => { refs.current[index] = input; }} accessibilityLabel={`Chữ số OTP ${index + 1}`} value={digit} onChangeText={(value) => onChange(index, value)} onKeyPress={({ nativeEvent }) => { if (nativeEvent.key === 'Backspace' && !digit && index > 0) refs.current[index - 1]?.focus(); }} keyboardType="number-pad" textContentType={index === 0 ? 'oneTimeCode' : 'none'} autoComplete={index === 0 ? 'one-time-code' : 'off'} maxLength={6} selectTextOnFocus style={[styles.otpInput, !!error && styles.otpInputError]} />)}</View>
      {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
      <Text style={styles.demoOtp}>Demo OTP: <Text style={styles.demoOtpValue}>123456</Text></Text>
      <View style={styles.resendRow}><Text style={styles.resendHint}>{countdown > 0 ? `Có thể gửi lại sau ${countdown}s` : 'Bạn chưa nhận được mã?'}</Text><Pressable accessibilityRole="button" disabled={countdown > 0} onPress={onResend} style={({ pressed }) => [styles.resendButton, countdown > 0 && styles.disabled, pressed && styles.pressed]}><Text style={styles.resendLabel}>Gửi lại mã</Text></Pressable></View>
    </>}
    <AppButton label={verified ? 'Tiếp tục' : 'Xác thực'} icon={verified ? 'arrow-right' : 'check'} loading={loading} disabled={!verified && otp.join('').length !== 6} onPress={verified ? onContinue : onVerify} />
    <AppButton label="Đổi số điện thoại" variant="ghost" compact onPress={onChangePhone} />
  </StepShell>;
}

function ProfileStep({ draft, updateDraft, errors, setErrors, usernameStatus, onContinue }: { draft: Draft; updateDraft: (values: Partial<Draft>) => void; errors: Record<string, string>; setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>; usernameStatus: UsernameStatus; onContinue: () => void }) {
  const { notify } = useDemoApp();
  const [pickingAvatar, setPickingAvatar] = useState(false);
  const change = (values: Partial<Draft>, field: string) => { updateDraft(values); setErrors((current) => ({ ...current, [field]: '' })); };
  const usernameHint = usernameStatus === 'checking' ? 'Đang kiểm tra username...' : usernameStatus === 'available' ? '✓ Username khả dụng' : undefined;
  const usernameError = errors.username || (usernameStatus === 'taken' ? 'Username này đã được sử dụng.' : undefined);

  const pickAvatar = async () => {
    if (pickingAvatar) return;
    setPickingAvatar(true);
    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          notify('Bạn cần cho phép truy cập thư viện ảnh để chọn ảnh đại diện.');
          return;
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.72,
        base64: Platform.OS === 'web',
      });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      const avatarUri = Platform.OS === 'web' && asset.base64
        ? `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`
        : asset.uri;
      if (Platform.OS === 'web' && avatarUri.length > 3_500_000) {
        notify('Ảnh quá lớn để lưu trên trình duyệt. Vui lòng chọn ảnh khác.');
        return;
      }
      updateDraft({ avatarUri });
      notify('Đã cập nhật ảnh đại diện.');
    } catch {
      notify('Không thể mở thư viện ảnh. Vui lòng thử lại.');
    } finally {
      setPickingAvatar(false);
    }
  };

  return <StepShell icon="id-card" eyebrow="HỒ SƠ CƠ BẢN" title="Mọi người sẽ gọi bạn là gì?" subtitle="Chỉ hiển thị những thông tin giúp cộng đồng dễ làm quen với bạn.">
    <View style={styles.avatarSection}>
      <Pressable accessibilityRole="button" accessibilityLabel={draft.avatarUri ? 'Đổi ảnh đại diện' : 'Chọn ảnh đại diện'} disabled={pickingAvatar} onPress={pickAvatar} style={[styles.avatarPreview, { backgroundColor: draft.avatarColor }]}>
        {draft.avatarUri ? <Image source={{ uri: draft.avatarUri }} style={styles.avatarImage} contentFit="cover" /> : <Text style={styles.avatarInitials}>{initials(draft.name || 'Bạn')}</Text>}
        <View style={styles.avatarCamera}>{pickingAvatar ? <ActivityIndicator size="small" color={AppColors.surface} /> : <FontAwesome name="camera" size={12} color={AppColors.surface} />}</View>
      </Pressable>
      <View style={styles.avatarCopy}>
        <Text style={styles.avatarTitle}>{draft.avatarUri ? 'Ảnh đại diện đã chọn' : 'Chọn ảnh đại diện'}</Text>
        <Text style={styles.avatarHint}>Chạm vào avatar để chọn ảnh vuông từ thiết bị.</Text>
        <View style={styles.avatarActions}><Pressable accessibilityRole="button" disabled={pickingAvatar} onPress={pickAvatar} style={({ pressed }) => [styles.avatarAction, pressed && styles.pressed]}><Text style={styles.avatarActionText}>{draft.avatarUri ? 'Đổi ảnh' : 'Chọn ảnh'}</Text></Pressable>{draft.avatarUri ? <Pressable accessibilityRole="button" onPress={() => updateDraft({ avatarUri: undefined })} style={({ pressed }) => [styles.avatarRemove, pressed && styles.pressed]}><Text style={styles.avatarRemoveText}>Xóa</Text></Pressable> : null}</View>
        {!draft.avatarUri ? <View style={styles.colorRow}>{AVATAR_COLORS.map((color) => <Pressable key={color} accessibilityRole="radio" accessibilityState={{ checked: draft.avatarColor === color }} accessibilityLabel={`Chọn màu avatar ${color}`} onPress={() => updateDraft({ avatarColor: color })} style={[styles.colorDot, { backgroundColor: color }, draft.avatarColor === color && styles.colorDotSelected]} />)}</View> : null}
      </View>
    </View>
    <AppInput label="Họ và tên" icon="user" value={draft.name} onChangeText={(name) => change({ name }, 'name')} placeholder="Nguyễn Minh Anh" error={errors.name} maxLength={60} />
    <AppInput label="Username" icon="at" value={draft.username} onChangeText={(username) => change({ username: username.replace(/^@/, '') }, 'username')} placeholder="minhanh" autoCapitalize="none" autoCorrect={false} error={usernameError} hint={usernameHint} maxLength={20} />
    <AppInput label="Ngày sinh" icon="calendar" value={draft.dateOfBirth} onChangeText={(value) => change({ dateOfBirth: formatDateOfBirthInput(value, draft.dateOfBirth) }, 'dateOfBirth')} placeholder="MM-DD-YYYY" keyboardType="number-pad" error={errors.dateOfBirth} hint={!errors.dateOfBirth ? 'Nhập tháng, ngày và năm. Dấu gạch ngang được thêm tự động.' : undefined} maxLength={10} />
    <AppInput label="Thành phố" icon="map-marker" value={draft.city} onChangeText={(city) => change({ city }, 'city')} placeholder="TP. Hồ Chí Minh" error={errors.city} maxLength={60} />
    <AppInput label="Giới thiệu (không bắt buộc)" icon="quote-left" value={draft.bio} onChangeText={(bio) => change({ bio }, 'bio')} placeholder="Một chút về bạn và kiểu meetup bạn thích..." multiline maxLength={160} error={errors.bio} />
    <Text style={styles.counter}>{draft.bio.length}/160</Text>
    <AppButton label="Tiếp tục" icon="arrow-right" disabled={usernameStatus === 'checking' || usernameStatus === 'taken'} onPress={onContinue} />
  </StepShell>;
}

function InterestsStep({ draft, error, onToggleInterest, onToggleVibe, onContinue }: { draft: Draft; error: string; onToggleInterest: (interest: string) => void; onToggleVibe: (vibe: string) => void; onContinue: () => void }) {
  return <StepShell icon="heart" eyebrow="CÁ NHÂN HÓA" title="Bạn thích những kèo nào?" subtitle="Chọn ít nhất 3 sở thích để gợi ý meetup và bạn mới phù hợp hơn.">
    <View style={styles.selectionHeader}><Text style={styles.selectionTitle}>Sở thích</Text><Text style={[styles.selectionCount, draft.interests.length >= 3 && styles.selectionCountDone]}>{draft.interests.length}/3 tối thiểu</Text></View>
    <View style={styles.chips}>{INTERESTS.map((interest) => <Chip key={interest} label={interest} selected={draft.interests.includes(interest)} onPress={() => onToggleInterest(interest)} />)}</View>
    {error ? <Text accessibilityRole="alert" style={styles.errorBox}>{error}</Text> : null}
    <Text style={styles.subheading}>Không khí bạn thích</Text>
    <Text style={styles.sectionHint}>Có thể chọn nhiều hoặc để trống.</Text>
    <View style={styles.chips}>{VIBES.map((vibe) => <Chip key={vibe} label={vibe} selected={draft.preferredVibes.includes(vibe)} onPress={() => onToggleVibe(vibe)} />)}</View>
    <View style={styles.personalizationNote}><FontAwesome name="magic" size={15} color={AppColors.accent} /><Text style={styles.personalizationText}>Lựa chọn này sẽ cá nhân hóa Home, Explore và gợi ý bạn bè.</Text></View>
    <AppButton label="Tiếp tục" icon="arrow-right" onPress={onContinue} />
  </StepShell>;
}

function SafetyStep({ draft, updateDraft, attempted, loading, onFinish }: { draft: Draft; updateDraft: (values: Partial<Draft>) => void; attempted: boolean; loading: boolean; onFinish: () => void }) {
  return <StepShell icon="shield" eyebrow="AN TOÀN & ĐỒNG Ý" title="Cùng giữ cộng đồng thân thiện" subtitle="Bốn nguyên tắc ngắn để mọi meetup đều thoải mái và an toàn.">
    <View style={styles.rules}><Rule icon="handshake-o" title="Tôn trọng người khác" text="Lắng nghe ranh giới và lựa chọn của mỗi người." /><Rule icon="ban" title="Không spam hoặc quấy rối" text="Không ép buộc, công kích hay gửi nội dung không phù hợp." /><Rule icon="flag" title="Báo cáo và chặn khi cần" text="Bạn luôn có công cụ để tự bảo vệ mình." /><Rule icon="lock" title="Giữ kín thông tin nhạy cảm" text="Không đăng số giấy tờ, tài chính hoặc địa chỉ riêng tư." /></View>
    <View style={styles.consents}>
      <Checkbox checked={draft.acceptedTerms} label="Tôi đồng ý Điều khoản sử dụng" onPress={() => updateDraft({ acceptedTerms: !draft.acceptedTerms })} error={attempted && !draft.acceptedTerms} />
      {attempted && !draft.acceptedTerms ? <Text accessibilityRole="alert" style={styles.consentError}>Bạn cần đồng ý Điều khoản sử dụng.</Text> : null}
      <Checkbox checked={draft.acceptedPrivacy} label="Tôi đồng ý Chính sách quyền riêng tư" onPress={() => updateDraft({ acceptedPrivacy: !draft.acceptedPrivacy })} error={attempted && !draft.acceptedPrivacy} />
      {attempted && !draft.acceptedPrivacy ? <Text accessibilityRole="alert" style={styles.consentError}>Bạn cần đồng ý Chính sách quyền riêng tư.</Text> : null}
      <Checkbox checked={draft.notificationsEnabled} label="Nhận thông báo về kèo mới và tin nhắn" onPress={() => updateDraft({ notificationsEnabled: !draft.notificationsEnabled })} />
    </View>
    <AppButton label="Hoàn tất đăng ký" icon="check" loading={loading} onPress={onFinish} />
  </StepShell>;
}

function CompleteScreen({ name, interests, onContinue }: { name: string; interests: string[]; onContinue: () => void }) {
  return <SafeAreaView style={styles.completeSafe}><View style={styles.completeCard}><View style={styles.celebration}><FontAwesome name="users" size={30} color={AppColors.surface} /><View style={styles.sparkOne} /><View style={styles.sparkTwo} /></View><Text style={styles.completeEyebrow}>TÀI KHOẢN ĐÃ SẴN SÀNG</Text><Text style={styles.completeTitle}>Chào mừng {name || 'bạn'} đến với ChillWithHomies 🎉</Text><Text style={styles.completeText}>Từ {interests.slice(0, 3).join(', ')}, chúng mình đã chuẩn bị những meetup hợp gu để bạn khám phá.</Text><View style={styles.completeBenefits}><Benefit icon="check" text="Số điện thoại đã xác thực" /><Benefit icon="heart" text={`${interests.length} sở thích đã chọn`} /><Benefit icon="shield" text="Công cụ an toàn luôn sẵn sàng" /></View><AppButton label="Khám phá kèo" icon="compass" onPress={onContinue} /></View></SafeAreaView>;
}

function StepShell({ icon, eyebrow, title, subtitle, children }: { icon: React.ComponentProps<typeof FontAwesome>['name']; eyebrow: string; title: string; subtitle: string; children: React.ReactNode }) {
  return <View style={styles.step}><View style={styles.stepIcon}><FontAwesome name={icon} size={21} color={AppColors.accent} /></View><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text><SurfaceCard style={styles.form}>{children}</SurfaceCard></View>;
}

function PasswordField({ label, value, onChangeText, visible, onToggle, onBlur, error, hint }: { label: string; value: string; onChangeText: (value: string) => void; visible: boolean; onToggle: () => void; onBlur: () => void; error?: string; hint?: string }) {
  const [focused, setFocused] = useState(false);
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><View style={[styles.inputShell, focused && styles.inputFocused, !!error && styles.inputError]}><FontAwesome name="lock" size={16} color={error ? AppColors.danger : AppColors.textSecondary} /><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} secureTextEntry={!visible} autoCapitalize="none" autoCorrect={false} autoComplete="new-password" placeholder="Ít nhất 8 ký tự" placeholderTextColor="#AA998A" onFocus={() => setFocused(true)} onBlur={() => { setFocused(false); onBlur(); }} style={styles.passwordInput} /><Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onPress={onToggle} hitSlop={8} style={({ pressed }) => [styles.eye, pressed && styles.pressed]}><FontAwesome name={visible ? 'eye' : 'eye-slash'} size={17} color={AppColors.textSecondary} /></Pressable></View>{error || hint ? <Text accessibilityLiveRegion="polite" style={[styles.helper, error && styles.helperError]}>{error || hint}</Text> : null}</View>;
}

function Checkbox({ checked, label, onPress, error = false }: { checked: boolean; label: string; onPress: () => void; error?: boolean }) {
  return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={onPress} style={({ pressed }) => [styles.checkboxRow, error && styles.checkboxError, pressed && styles.pressed]}><View style={[styles.checkbox, checked && styles.checkboxChecked]}>{checked ? <FontAwesome name="check" size={11} color={AppColors.surface} /> : null}</View><Text style={styles.checkboxLabel}>{label}</Text></Pressable>;
}

function Rule({ icon, title, text }: { icon: React.ComponentProps<typeof FontAwesome>['name']; title: string; text: string }) {
  return <View style={styles.rule}><View style={styles.ruleIcon}><FontAwesome name={icon} size={15} color={AppColors.accent} /></View><View style={{ flex: 1 }}><Text style={styles.ruleTitle}>{title}</Text><Text style={styles.ruleText}>{text}</Text></View></View>;
}

function Benefit({ icon, text }: { icon: React.ComponentProps<typeof FontAwesome>['name']; text: string }) {
  return <View style={styles.benefit}><View style={styles.benefitIcon}><FontAwesome name={icon} size={11} color={AppColors.success} /></View><Text style={styles.benefitText}>{text}</Text></View>;
}

function validateAccount(phone: string, password: string, confirm: string) {
  const errors: Record<string, string> = {};
  if (!phone.trim()) errors.phone = 'Vui lòng nhập số điện thoại.';
  else if (!vietnamPhoneValid(phone)) errors.phone = 'Số điện thoại không hợp lệ.';
  if (!password) errors.password = 'Vui lòng nhập mật khẩu.';
  else if (password.length < 8) errors.password = 'Mật khẩu phải có ít nhất 8 ký tự.';
  else if (!/\p{L}/u.test(password) || !/\d/.test(password)) errors.password = 'Mật khẩu cần có ít nhất một chữ và một số.';
  if (!confirm) errors.confirm = 'Vui lòng xác nhận mật khẩu.';
  else if (confirm !== password) errors.confirm = 'Mật khẩu xác nhận không khớp.';
  return errors;
}

function validateProfile(draft: Draft, usernames: string[]) {
  const errors: Record<string, string> = {};
  const username = cleanUsername(draft.username);
  if (draft.name.trim().length < 2) errors.name = 'Vui lòng nhập họ và tên.';
  if (!usernamePattern(username)) errors.username = 'Username cần 3–20 chữ, số, dấu chấm hoặc gạch dưới.';
  else if (usernames.some((value) => value.toLowerCase() === username.toLowerCase())) errors.username = 'Username này đã được sử dụng.';
  const birthDate = parseDate(draft.dateOfBirth);
  if (!draft.dateOfBirth.trim()) errors.dateOfBirth = 'Vui lòng nhập ngày sinh.';
  else if (!birthDate) errors.dateOfBirth = 'Ngày sinh không hợp lệ. Dùng định dạng MM-DD-YYYY.';
  else {
    const today = new Date();
    const adultCutoff = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    if (birthDate > today) errors.dateOfBirth = 'Ngày sinh không được ở tương lai.';
    else if (birthDate > adultCutoff) errors.dateOfBirth = 'Bạn phải đủ 18 tuổi để tham gia.';
  }
  if (!draft.city.trim()) errors.city = 'Vui lòng nhập thành phố.';
  if (draft.bio.length > 160) errors.bio = 'Giới thiệu không được quá 160 ký tự.';
  return errors;
}

function vietnamPhoneValid(value: string) {
  return /^(?:\+84|84|0)(?:3|5|7|8|9)\d{8}$/.test(normalizePhone(value));
}

function normalizePhone(value: string) {
  return value.replace(/[\s.-]/g, '');
}

function formatPhone(value: string) {
  let digits = normalizePhone(value).replace(/^\+84/, '0').replace(/^84/, '0');
  if (digits.length === 10) digits = `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  return digits;
}

function usernamePattern(value: string) {
  return /^[a-zA-Z0-9_.]{3,20}$/.test(value);
}

function cleanUsername(value: string) {
  return value.trim().replace(/^@/, '');
}

function parseDate(value: string) {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(value)) return null;
  const [month, day, year] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

function normalizeStoredDateOfBirth(value?: string) {
  if (!value) return '';
  const legacy = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return legacy ? `${legacy[2]}-${legacy[3]}-${legacy[1]}` : value;
}

function formatDateOfBirthInput(value: string, previous: string) {
  const deletingSeparator = value.length < previous.length && previous.endsWith('-') && value === previous.slice(0, -1);
  if (deletingSeparator) return value.slice(0, -1);
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length < 2) return digits;
  if (digits.length === 2) return `${digits}-`;
  if (digits.length < 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  if (digits.length === 4) return `${digits.slice(0, 2)}-${digits.slice(2)}-`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(-2).map((part) => part.charAt(0)).join('').toUpperCase() || 'B';
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, safeArea: { flex: 1, backgroundColor: AppColors.background }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: AppColors.background }, loadingText: { ...TypeScale.body, color: AppColors.textSecondary },
  topBar: { minHeight: 68, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: AppColors.border, backgroundColor: AppColors.surface }, backButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AppColors.border }, backSpacer: { width: 44 }, progressCopy: { flex: 1, alignItems: 'center', gap: 7 }, progressText: { fontFamily: FontFamily.bodySemiBold, fontSize: 10, color: AppColors.accent, letterSpacing: 0.9 }, progressTrack: { width: 138, height: 5, borderRadius: 3, backgroundColor: AppColors.border, overflow: 'hidden' }, progressFill: { height: '100%', borderRadius: 3, backgroundColor: AppColors.primary },
  content: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 24, paddingBottom: 36 }, step: { width: '100%', maxWidth: 520, alignSelf: 'center' }, stepIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }, eyebrow: { ...TypeScale.caption, fontFamily: FontFamily.bodySemiBold, color: AppColors.accent, letterSpacing: 1, textAlign: 'center', marginTop: 12 }, title: { ...TypeScale.h1, color: AppColors.text, textAlign: 'center', marginTop: 3 }, subtitle: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center', marginTop: 7, paddingHorizontal: 10 }, form: { padding: 18, gap: 16, marginTop: 22 },
  field: { gap: 8 }, label: { ...TypeScale.label, color: AppColors.text }, inputShell: { minHeight: 54, borderRadius: Radius.md, borderWidth: 1, borderColor: AppColors.border, backgroundColor: AppColors.surface, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 15 }, inputFocused: { borderColor: AppColors.accent }, inputError: { borderColor: AppColors.danger }, passwordInput: { ...TypeScale.body, color: AppColors.text, flex: 1, paddingVertical: 0, outlineWidth: 0 }, eye: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, helper: { ...TypeScale.caption, color: AppColors.textSecondary }, helperError: { color: AppColors.dangerText }, secureNote: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 10, borderRadius: Radius.sm, backgroundColor: AppColors.successSoft }, secureText: { ...TypeScale.caption, color: AppColors.textSecondary, flex: 1 },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 7 }, otpInput: { flex: 1, minWidth: 0, height: 58, borderRadius: 15, borderWidth: 1, borderColor: AppColors.border, backgroundColor: AppColors.background, textAlign: 'center', fontFamily: FontFamily.headingBold, fontSize: 21, color: AppColors.text, outlineWidth: 0 }, otpInputError: { borderColor: AppColors.danger }, errorText: { ...TypeScale.caption, color: AppColors.dangerText, textAlign: 'center' }, demoOtp: { ...TypeScale.caption, color: AppColors.textSecondary, textAlign: 'center' }, demoOtpValue: { fontFamily: FontFamily.bodySemiBold, color: AppColors.accent }, resendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, resendHint: { ...TypeScale.caption, color: AppColors.textSecondary, flex: 1 }, resendButton: { minHeight: 40, paddingHorizontal: 8, justifyContent: 'center' }, resendLabel: { ...TypeScale.label, color: AppColors.accent }, verifiedCard: { minHeight: 84, padding: 16, borderRadius: Radius.md, backgroundColor: AppColors.successSoft, flexDirection: 'row', alignItems: 'center', gap: 12 }, verifiedTitle: { ...TypeScale.label, color: '#29664F' }, verifiedText: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 2 },
  avatarSection: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 13, borderRadius: Radius.md, backgroundColor: AppColors.section }, avatarPreview: { width: 78, height: 78, borderRadius: 26, alignItems: 'center', justifyContent: 'center' }, avatarImage: { width: '100%', height: '100%', borderRadius: 26 }, avatarCamera: { position: 'absolute', right: -4, bottom: -4, width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: AppColors.surface, backgroundColor: AppColors.accent, alignItems: 'center', justifyContent: 'center' }, avatarInitials: { fontFamily: FontFamily.headingBold, fontSize: 22, color: AppColors.surface }, avatarCopy: { flex: 1 }, avatarTitle: { ...TypeScale.label, color: AppColors.text }, avatarHint: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 2 }, avatarActions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }, avatarAction: { minHeight: 32, paddingHorizontal: 11, borderRadius: Radius.pill, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center' }, avatarActionText: { ...TypeScale.caption, fontFamily: FontFamily.bodySemiBold, color: AppColors.accent }, avatarRemove: { minHeight: 32, justifyContent: 'center' }, avatarRemoveText: { ...TypeScale.caption, color: AppColors.dangerText }, colorRow: { flexDirection: 'row', gap: 8, marginTop: 9 }, colorDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: AppColors.surface }, colorDotSelected: { borderColor: AppColors.text, transform: [{ scale: 1.1 }] }, counter: { ...TypeScale.caption, color: AppColors.textSecondary, textAlign: 'right', marginTop: -10 },
  selectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, selectionTitle: { ...TypeScale.h3, color: AppColors.text }, selectionCount: { ...TypeScale.caption, color: AppColors.dangerText }, selectionCountDone: { color: AppColors.success }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, errorBox: { ...TypeScale.caption, color: AppColors.dangerText, padding: 10, borderRadius: Radius.sm, backgroundColor: AppColors.dangerSoft }, subheading: { ...TypeScale.h3, color: AppColors.text, marginTop: 5 }, sectionHint: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: -10 }, personalizationNote: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 11, borderRadius: Radius.sm, backgroundColor: AppColors.accentSoft }, personalizationText: { ...TypeScale.caption, color: AppColors.textSecondary, flex: 1 },
  rules: { gap: 9 }, rule: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 11, borderRadius: Radius.sm, backgroundColor: AppColors.section }, ruleIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: AppColors.surface, alignItems: 'center', justifyContent: 'center' }, ruleTitle: { ...TypeScale.label, color: AppColors.text }, ruleText: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 2 }, consents: { gap: 7 }, checkboxRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12, borderRadius: Radius.sm, borderWidth: 1, borderColor: AppColors.border, backgroundColor: AppColors.surface }, checkboxError: { borderColor: AppColors.danger }, checkbox: { width: 22, height: 22, borderRadius: 7, borderWidth: 1, borderColor: AppColors.border, alignItems: 'center', justifyContent: 'center' }, checkboxChecked: { backgroundColor: AppColors.accent, borderColor: AppColors.accent }, checkboxLabel: { ...TypeScale.body, color: AppColors.text, flex: 1 }, consentError: { ...TypeScale.caption, color: AppColors.dangerText, marginLeft: 4 },
  completeSafe: { flex: 1, backgroundColor: AppColors.background, alignItems: 'center', justifyContent: 'center', padding: 20 }, completeCard: { width: '100%', maxWidth: 460, padding: 24, borderRadius: Radius.lg, backgroundColor: AppColors.surface, borderWidth: 1, borderColor: AppColors.border, alignItems: 'center', ...WarmShadow }, celebration: { width: 84, height: 84, borderRadius: 30, backgroundColor: AppColors.accent, alignItems: 'center', justifyContent: 'center' }, sparkOne: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: AppColors.primary, top: -8, right: 3 }, sparkTwo: { position: 'absolute', width: 7, height: 7, borderRadius: 4, backgroundColor: '#E88F9C', left: -8, bottom: 10 }, completeEyebrow: { ...TypeScale.caption, fontFamily: FontFamily.bodySemiBold, color: AppColors.accent, letterSpacing: 1, marginTop: 20 }, completeTitle: { ...TypeScale.h1, color: AppColors.text, textAlign: 'center', marginTop: 5 }, completeText: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 18 }, completeBenefits: { alignSelf: 'stretch', gap: 8, marginBottom: 20 }, benefit: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 10, borderRadius: Radius.sm, backgroundColor: AppColors.section }, benefitIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: AppColors.successSoft, alignItems: 'center', justifyContent: 'center' }, benefitText: { ...TypeScale.caption, color: AppColors.text }, pressed: { opacity: 0.74 }, disabled: { opacity: 0.45 },
});
