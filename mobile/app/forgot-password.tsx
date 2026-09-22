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

import { AppColors, Radius, TypeScale, WarmShadow } from '@/constants/theme';
import { useDemoApp } from '@/context/demo-app-context';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { hydrated, state, notify } = useDemoApp();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (hydrated && state.currentUser) router.replace('/(tabs)');
  }, [hydrated, router, state.currentUser]);

  function onSend() {
    const digits = phone.replace(/\s/g, '');
    if (!digits) {
      setError('Vui lòng nhập số điện thoại.');
      return;
    }
    if (!/^[0-9]{9,11}$/.test(digits)) {
      setError('Số điện thoại cần có 9–11 chữ số.');
      return;
    }
    setError('');
    setSent(true);
    notify('Đã gửi hướng dẫn đặt lại mật khẩu (demo).');
  }

  if (!hydrated || state.currentUser) {
    return <View style={styles.loading}><ActivityIndicator color={AppColors.accent} /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable accessibilityLabel="Quay lại đăng nhập" accessibilityRole="button" onPress={() => router.replace('/signin')} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <FontAwesome name="chevron-left" size={17} color={AppColors.text} />
          </Pressable>

          <View style={styles.card}>
            {sent ? (
              <>
                <View style={[styles.iconCircle, styles.successCircle]}><FontAwesome name="check" size={24} color={AppColors.success} /></View>
                <Text style={styles.heading}>Kiểm tra hướng dẫn nhé</Text>
                <Text style={styles.subtitle}>Đã gửi hướng dẫn đặt lại mật khẩu (demo) đến số {phone.trim()}.</Text>
                <View style={styles.note}><FontAwesome name="info-circle" size={15} color={AppColors.info} /><Text style={styles.noteText}>Đây là bản demo nên bạn không cần chờ SMS thật.</Text></View>
                <Pressable accessibilityRole="button" onPress={() => router.replace('/signin')} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                  <Text style={styles.primaryButtonText}>Trở lại đăng nhập</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => setSent(false)} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryLabel}>Dùng số điện thoại khác</Text></Pressable>
              </>
            ) : (
              <>
                <View style={styles.iconCircle}><FontAwesome name="key" size={23} color={AppColors.accent} /></View>
                <Text style={styles.heading}>Quên mật khẩu?</Text>
                <Text style={styles.subtitle}>Nhập số điện thoại đã dùng đăng ký. Chúng mình sẽ gửi hướng dẫn đặt lại mật khẩu.</Text>
                <View style={styles.field}>
                  <Text style={styles.label}>Số điện thoại</Text>
                  <View style={[styles.inputShell, focused && styles.inputFocused, error && styles.inputError]}>
                    <FontAwesome name="phone" size={16} color={focused ? AppColors.accent : AppColors.textSecondary} />
                    <TextInput
                      accessibilityLabel="Số điện thoại"
                      autoComplete="tel"
                      keyboardType="phone-pad"
                      onBlur={() => setFocused(false)}
                      onChangeText={(value) => { setPhone(value); setError(''); }}
                      onFocus={() => setFocused(true)}
                      onSubmitEditing={onSend}
                      placeholder="0901 234 567"
                      placeholderTextColor="#AA998A"
                      returnKeyType="send"
                      style={styles.input}
                      value={phone}
                    />
                  </View>
                  {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
                </View>
                <Pressable accessibilityRole="button" onPress={onSend} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                  <Text style={styles.primaryButtonText}>Gửi hướng dẫn</Text><FontAwesome name="paper-plane" size={14} color={AppColors.surface} />
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => router.replace('/signin')} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
                  <FontAwesome name="arrow-left" size={13} color={AppColors.accentText} /><Text style={styles.secondaryLabel}>Trở lại đăng nhập</Text>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: AppColors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.background },
  content: { flexGrow: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  backButton: { position: 'absolute', top: 16, left: 20, width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: AppColors.border, backgroundColor: AppColors.surface, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  card: { width: '100%', maxWidth: 440, padding: 24, borderRadius: Radius.lg, borderWidth: 1, borderColor: AppColors.border, backgroundColor: AppColors.surface, alignItems: 'center', ...WarmShadow },
  iconCircle: { width: 60, height: 60, borderRadius: 22, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  successCircle: { backgroundColor: AppColors.successSoft },
  heading: { ...TypeScale.h1, color: AppColors.text, textAlign: 'center', marginTop: 18 },
  subtitle: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 22 },
  field: { width: '100%', gap: 7 },
  label: { ...TypeScale.label, color: AppColors.text },
  inputShell: { minHeight: 54, paddingHorizontal: 15, borderWidth: 1, borderColor: AppColors.border, borderRadius: Radius.md, backgroundColor: AppColors.background, flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputFocused: { borderColor: AppColors.accent, backgroundColor: AppColors.surface },
  inputError: { borderColor: AppColors.danger },
  input: { ...TypeScale.body, flex: 1, color: AppColors.text, paddingVertical: 12 },
  errorText: { ...TypeScale.caption, color: AppColors.dangerText },
  note: { width: '100%', padding: 12, borderRadius: Radius.sm, backgroundColor: AppColors.infoSoft, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  noteText: { ...TypeScale.caption, color: AppColors.info, flex: 1 },
  primaryButton: { width: '100%', minHeight: 54, marginTop: 18, borderRadius: Radius.md, backgroundColor: AppColors.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  primaryButtonText: { ...TypeScale.label, fontSize: 15, color: AppColors.surface },
  secondaryButton: { minHeight: 46, marginTop: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  secondaryLabel: { ...TypeScale.label, color: AppColors.accentText },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
});
