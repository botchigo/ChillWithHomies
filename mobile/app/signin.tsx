import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors, FontFamily, Radius, TypeScale, WarmShadow } from '@/constants/theme';
import { createInitialSignupDraft } from '@/src/features/auth/constants';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { formatPhone, isVietnamPhoneValid } from '@/src/features/auth/services/auth-validation';
import { saveSignupDraft } from '@/src/features/auth/services/signup-draft-storage';

type FieldErrors = { phone?: string; otp?: string; form?: string };

export default function SignInScreen() {
  const router = useRouter();
  const { hydrated, currentUser, requestOtp, verifyOtp, notify } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (hydrated && currentUser) router.replace('/(tabs)');
  }, [currentUser, hydrated, router]);

  async function onRequestOtp() {
    if (isLoading) return;
    if (!isVietnamPhoneValid(phone)) {
      setErrors({ phone: 'Số điện thoại Việt Nam không hợp lệ.' });
      return;
    }
    setIsLoading(true);
    const result = await requestOtp(phone);
    setIsLoading(false);
    if (!result.ok) return setErrors({ form: result.error ?? 'Không thể gửi mã xác thực.' });
    setSent(true);
    setOtp('');
    setErrors({});
    notify('Đã gửi mã xác thực đến số điện thoại của bạn.');
  }

  async function onVerifyOtp() {
    if (isLoading) return;
    if (!/^\d{6}$/.test(otp)) return setErrors({ otp: 'Vui lòng nhập đủ 6 chữ số.' });
    setIsLoading(true);
    const result = await verifyOtp(phone, otp);
    if (!result.ok) {
      setIsLoading(false);
      return setErrors({ form: result.error ?? 'Không thể xác thực mã OTP.' });
    }
    if (!result.profileComplete) {
      await saveSignupDraft({ ...createInitialSignupDraft(), step: 'profile', phone, phoneVerified: true });
      notify('Xác thực thành công. Hãy hoàn tất hồ sơ của bạn.');
      router.replace('/signup');
      return;
    }
    notify('Đăng nhập thành công. Chào bạn quay lại!');
    router.replace('/(tabs)');
  }

  if (!hydrated || currentUser) return <View style={styles.loading}><ActivityIndicator color={AppColors.accent} /></View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.brandMark}><FontAwesome name="users" size={24} color={AppColors.surface} /></View>
          <Text style={styles.brand}>ChillWithHomies</Text>
          <Text style={styles.heading}>Chào mừng bạn quay lại</Text>
          <Text style={styles.subtitle}>Đăng nhập bằng mã OTP để tìm một kèo vui gần bạn tối nay.</Text>

          <View style={styles.formCard}>
            <Text style={styles.label}>Số điện thoại</Text>
            <View style={[styles.inputShell, errors.phone && styles.inputError]}>
              <FontAwesome name="phone" size={16} color={AppColors.textSecondary} />
              <TextInput
                accessibilityLabel="Số điện thoại"
                autoComplete="tel"
                editable={!isLoading && !sent}
                keyboardType="phone-pad"
                onChangeText={(value) => { setPhone(value); setErrors({}); }}
                placeholder="0901 234 567"
                placeholderTextColor="#AA998A"
                style={styles.input}
                value={phone}
              />
            </View>
            {errors.phone ? <Text accessibilityRole="alert" style={styles.errorText}>{errors.phone}</Text> : null}

            {sent ? <>
              <Text style={[styles.label, styles.otpLabel]}>Mã OTP gửi đến {formatPhone(phone)}</Text>
              <View style={[styles.inputShell, errors.otp && styles.inputError]}>
                <FontAwesome name="key" size={16} color={AppColors.textSecondary} />
                <TextInput accessibilityLabel="Mã OTP" autoComplete="sms-otp" editable={!isLoading} keyboardType="number-pad" maxLength={6} onChangeText={(value) => { setOtp(value.replace(/\D/g, '')); setErrors({}); }} onSubmitEditing={onVerifyOtp} placeholder="6 chữ số" placeholderTextColor="#AA998A" returnKeyType="go" style={[styles.input, styles.otpInput]} value={otp} />
              </View>
              {errors.otp ? <Text accessibilityRole="alert" style={styles.errorText}>{errors.otp}</Text> : null}
            </> : null}
            {errors.form ? <Text accessibilityRole="alert" style={styles.formError}>{errors.form}</Text> : null}

            <Pressable accessibilityRole="button" disabled={isLoading} onPress={sent ? onVerifyOtp : onRequestOtp} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, isLoading && styles.disabled]}>
              {isLoading ? <ActivityIndicator color={AppColors.surface} /> : <><Text style={styles.primaryButtonText}>{sent ? 'Xác thực OTP' : 'Gửi mã OTP'}</Text><FontAwesome name="arrow-right" size={15} color={AppColors.surface} /></>}
            </Pressable>
            {sent ? <Pressable accessibilityRole="button" disabled={isLoading} onPress={onRequestOtp} style={styles.textButton}><Text style={styles.textButtonLabel}>Gửi lại mã</Text></Pressable> : null}
            {sent ? <Pressable accessibilityRole="button" disabled={isLoading} onPress={() => { setSent(false); setOtp(''); setErrors({}); }} style={styles.textButton}><Text style={styles.textButtonLabel}>Đổi số điện thoại</Text></Pressable> : null}
          </View>

          <View style={styles.signupRow}><Text style={styles.muted}>Chưa có tài khoản?</Text><Pressable accessibilityRole="button" onPress={() => router.push('/signup')}><Text style={styles.signupLink}> Tạo tài khoản</Text></Pressable></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, safeArea: { flex: 1, backgroundColor: AppColors.background }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.background },
  content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 34, paddingBottom: 32, alignItems: 'center', justifyContent: 'center' },
  brandMark: { width: 58, height: 58, borderRadius: 20, backgroundColor: AppColors.accent, alignItems: 'center', justifyContent: 'center', ...WarmShadow }, brand: { marginTop: 14, fontFamily: FontFamily.headingBold, fontSize: 16, color: AppColors.accent, letterSpacing: 0.3 },
  heading: { ...TypeScale.h1, color: AppColors.text, textAlign: 'center', marginTop: 22 }, subtitle: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center', maxWidth: 330, marginTop: 7, marginBottom: 24 },
  formCard: { width: '100%', maxWidth: 440, padding: 20, borderRadius: Radius.lg, backgroundColor: AppColors.surface, borderWidth: 1, borderColor: AppColors.border, ...WarmShadow }, label: { ...TypeScale.label, color: AppColors.text, marginBottom: 7 }, otpLabel: { marginTop: 16 },
  inputShell: { minHeight: 54, paddingHorizontal: 15, borderWidth: 1, borderColor: AppColors.border, borderRadius: Radius.md, backgroundColor: AppColors.background, flexDirection: 'row', alignItems: 'center', gap: 10 }, inputError: { borderColor: AppColors.danger }, input: { ...TypeScale.body, color: AppColors.text, flex: 1, paddingVertical: 12, minWidth: 0 }, otpInput: { letterSpacing: 8, fontFamily: FontFamily.headingBold },
  errorText: { ...TypeScale.caption, color: AppColors.dangerText, marginTop: 5 }, formError: { ...TypeScale.caption, color: AppColors.dangerText, backgroundColor: AppColors.dangerSoft, borderRadius: Radius.sm, padding: 10, marginTop: 14 },
  primaryButton: { minHeight: 54, marginTop: 22, borderRadius: Radius.md, backgroundColor: AppColors.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }, primaryButtonText: { ...TypeScale.label, color: AppColors.surface, fontSize: 15 },
  textButton: { alignSelf: 'center', minHeight: 40, justifyContent: 'center', paddingHorizontal: 12 }, textButtonLabel: { ...TypeScale.label, color: AppColors.accentText }, signupRow: { flexDirection: 'row', alignItems: 'center', marginTop: 22 }, muted: { ...TypeScale.body, color: AppColors.textSecondary }, signupLink: { ...TypeScale.label, color: AppColors.accent }, pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] }, disabled: { opacity: 0.55 },
});
