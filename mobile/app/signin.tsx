import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors, FontFamily, Radius, TypeScale, WarmShadow } from '@/constants/theme';
import { useAuth } from '@/src/features/auth/hooks/use-auth';

type FieldErrors = { phone?: string; password?: string; form?: string };

export default function SignInScreen() {
  const router = useRouter();
  const { hydrated, currentUser, signIn, notify } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<'phone' | 'password' | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (hydrated && currentUser) router.replace('/(tabs)');
  }, [currentUser, hydrated, router]);

  function validate() {
    const next: FieldErrors = {};
    const digits = phone.replace(/\s/g, '');
    if (!phone.trim()) next.phone = 'Vui lòng nhập số điện thoại.';
    else if (!/^[0-9]{9,11}$/.test(digits)) next.phone = 'Số điện thoại cần có 9–11 chữ số.';
    if (!password) next.password = 'Vui lòng nhập mật khẩu.';
    else if (password.trim().length < 6) next.password = 'Mật khẩu cần ít nhất 6 ký tự.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSignIn() {
    if (isLoading || !validate()) return;
    setIsLoading(true);
    const result = signIn(phone, password);
    if (!result.ok) {
      setErrors({ form: result.error ?? 'Không thể đăng nhập. Vui lòng thử lại.' });
      setIsLoading(false);
      return;
    }
    notify('Đăng nhập thành công. Chào bạn quay lại!');
    router.replace('/(tabs)');
  }

  if (!hydrated || currentUser) {
    return <View style={styles.loading}><ActivityIndicator color={AppColors.accent} /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.brandMark}><FontAwesome name="users" size={24} color={AppColors.surface} /></View>
          <Text style={styles.brand}>ChillWithHomies</Text>
          <Text style={styles.heading}>Chào mừng bạn quay lại</Text>
          <Text style={styles.subtitle}>Đăng nhập để tìm một kèo vui gần bạn tối nay.</Text>

          <View style={styles.formCard}>
            <Text style={styles.label}>Số điện thoại</Text>
            <View style={[styles.inputShell, focused === 'phone' && styles.inputFocused, errors.phone && styles.inputError]}>
              <FontAwesome name="phone" size={16} color={focused === 'phone' ? AppColors.accent : AppColors.textSecondary} />
              <TextInput
                accessibilityLabel="Số điện thoại"
                autoComplete="tel"
                editable={!isLoading}
                keyboardType="phone-pad"
                onBlur={() => setFocused(null)}
                onChangeText={(value) => { setPhone(value); setErrors((current) => ({ ...current, phone: undefined, form: undefined })); }}
                onFocus={() => setFocused('phone')}
                placeholder="0901 234 567"
                placeholderTextColor="#AA998A"
                returnKeyType="next"
                style={styles.input}
                value={phone}
              />
            </View>
            {errors.phone ? <Text accessibilityRole="alert" style={styles.errorText}>{errors.phone}</Text> : null}

            <Text style={[styles.label, styles.passwordLabel]}>Mật khẩu</Text>
            <View style={[styles.inputShell, focused === 'password' && styles.inputFocused, errors.password && styles.inputError]}>
              <FontAwesome name="lock" size={16} color={focused === 'password' ? AppColors.accent : AppColors.textSecondary} />
              <TextInput
                accessibilityLabel="Mật khẩu"
                autoCapitalize="none"
                autoComplete="password"
                autoCorrect={false}
                editable={!isLoading}
                onBlur={() => setFocused(null)}
                onChangeText={(value) => { setPassword(value); setErrors((current) => ({ ...current, password: undefined, form: undefined })); }}
                onFocus={() => setFocused('password')}
                onSubmitEditing={onSignIn}
                placeholder="Ít nhất 6 ký tự"
                placeholderTextColor="#AA998A"
                returnKeyType="go"
                secureTextEntry={!showPassword}
                style={styles.input}
                value={password}
              />
              <Pressable
                accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                accessibilityRole="button"
                hitSlop={10}
                onPress={() => setShowPassword((value) => !value)}
                style={({ pressed }) => [styles.eyeButton, pressed && styles.pressed]}>
                <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={18} color={AppColors.textSecondary} />
              </Pressable>
            </View>
            {errors.password ? <Text accessibilityRole="alert" style={styles.errorText}>{errors.password}</Text> : null}
            {errors.form ? <Text accessibilityRole="alert" style={styles.formError}>{errors.form}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={isLoading}
              onPress={onSignIn}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, isLoading && styles.disabled]}>
              {isLoading ? <ActivityIndicator color={AppColors.surface} /> : <><Text style={styles.primaryButtonText}>Đăng nhập</Text><FontAwesome name="arrow-right" size={15} color={AppColors.surface} /></>}
            </Pressable>

            <Pressable accessibilityRole="button" onPress={() => router.push('/forgot-password')} style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}>
              <Text style={styles.textButtonLabel}>Quên mật khẩu?</Text>
            </Pressable>
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.muted}>Chưa có tài khoản?</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push('/signup')}><Text style={styles.signupLink}> Tạo tài khoản demo</Text></Pressable>
          </View>
          <Text style={styles.demoNote}>Bản demo chấp nhận mọi số điện thoại và mật khẩu đúng định dạng.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: AppColors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.background },
  content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 34, paddingBottom: 32, alignItems: 'center', justifyContent: 'center' },
  brandMark: { width: 58, height: 58, borderRadius: 20, backgroundColor: AppColors.accent, alignItems: 'center', justifyContent: 'center', ...WarmShadow },
  brand: { marginTop: 14, fontFamily: FontFamily.headingBold, fontSize: 16, color: AppColors.accent, letterSpacing: 0.3 },
  heading: { ...TypeScale.h1, color: AppColors.text, textAlign: 'center', marginTop: 22 },
  subtitle: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center', maxWidth: 330, marginTop: 7, marginBottom: 24 },
  formCard: { width: '100%', maxWidth: 440, padding: 20, borderRadius: Radius.lg, backgroundColor: AppColors.surface, borderWidth: 1, borderColor: AppColors.border, ...WarmShadow },
  label: { ...TypeScale.label, color: AppColors.text, marginBottom: 7 },
  passwordLabel: { marginTop: 16 },
  inputShell: { minHeight: 54, paddingHorizontal: 15, borderWidth: 1, borderColor: AppColors.border, borderRadius: Radius.md, backgroundColor: AppColors.background, flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputFocused: { borderColor: AppColors.accent, backgroundColor: AppColors.surface },
  inputError: { borderColor: AppColors.danger },
  input: { ...TypeScale.body, color: AppColors.text, flex: 1, paddingVertical: 12, minWidth: 0 },
  eyeButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19 },
  errorText: { ...TypeScale.caption, color: AppColors.dangerText, marginTop: 5 },
  formError: { ...TypeScale.caption, color: AppColors.dangerText, backgroundColor: AppColors.dangerSoft, borderRadius: Radius.sm, padding: 10, marginTop: 14 },
  primaryButton: { minHeight: 54, marginTop: 22, borderRadius: Radius.md, backgroundColor: AppColors.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  primaryButtonText: { ...TypeScale.label, color: AppColors.surface, fontSize: 15 },
  textButton: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, marginTop: 8 },
  textButtonLabel: { ...TypeScale.label, color: AppColors.accentText },
  signupRow: { flexDirection: 'row', alignItems: 'center', marginTop: 22 },
  muted: { ...TypeScale.body, color: AppColors.textSecondary },
  signupLink: { ...TypeScale.label, color: AppColors.accent },
  demoNote: { ...TypeScale.caption, color: AppColors.textSecondary, textAlign: 'center', maxWidth: 320, marginTop: 12 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.55 },
});
