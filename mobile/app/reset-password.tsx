import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  const validatePasswords = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least 1 uppercase letter';
    } else if (!/[0-9]/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least 1 number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function onUpdatePassword() {
    if (!validatePasswords()) {
      return;
    }

    // Placeholder: update password in backend

    // After successful update, redirect to signin
    router.replace('/signin');
  }

  const isFormValid = newPassword && confirmPassword && newPassword === confirmPassword;

  // Password requirements check
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== '';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.backBtnWrapper}>
                <FontAwesome name="chevron-left" size={20} color="#ffb233" />
                <ThemedText style={styles.backLabel}>Back</ThemedText>
              </Pressable>
              <ThemedText type="title" style={[styles.title, styles.titleBrand]}>
                Reset Password
              </ThemedText>
              <View style={{ width: 70 }} />
            </View>

            <View style={styles.form}>
              <ThemedText style={styles.description}>
                Enter your new password to reset your account
              </ThemedText>

              <View style={{ height: 24 }} />

              {/* New Password Field */}
              <View style={styles.inputWrapper}>
                <ThemedText style={styles.label}>New Password</ThemedText>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor="#6b7280"
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (errors.newPassword) {
                        setErrors({ ...errors, newPassword: undefined });
                      }
                    }}
                    secureTextEntry={!showPassword}
                    editable={true}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <FontAwesome
                      name={showPassword ? 'eye' : 'eye-slash'}
                      size={18}
                      color="#9ca3af"
                    />
                  </TouchableOpacity>
                </View>
                {errors.newPassword && (
                  <ThemedText style={styles.errorText}>{errors.newPassword}</ThemedText>
                )}
              </View>

              <View style={{ height: 20 }} />

              {/* Confirm Password Field */}
              <View style={styles.inputWrapper}>
                <ThemedText style={styles.label}>Confirm Password</ThemedText>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor="#6b7280"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) {
                        setErrors({ ...errors, confirmPassword: undefined });
                      }
                    }}
                    secureTextEntry={!showConfirmPassword}
                    editable={true}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <FontAwesome
                      name={showConfirmPassword ? 'eye' : 'eye-slash'}
                      size={18}
                      color="#9ca3af"
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <ThemedText style={styles.errorText}>{errors.confirmPassword}</ThemedText>
                )}
              </View>

              {/* Password Requirements */}
              <View style={styles.requirementsBox}>
                <View style={styles.requirementItem}>
                  <FontAwesome
                    name={hasMinLength ? 'check' : 'times'}
                    size={14}
                    color={hasMinLength ? '#10b981' : '#d1d5db'}
                  />
                  <ThemedText style={styles.requirementText}>At least 8 characters</ThemedText>
                </View>
                <View style={styles.requirementItem}>
                  <FontAwesome
                    name={hasUppercase ? 'check' : 'times'}
                    size={14}
                    color={hasUppercase ? '#10b981' : '#d1d5db'}
                  />
                  <ThemedText style={styles.requirementText}>At least 1 uppercase letter</ThemedText>
                </View>
                <View style={styles.requirementItem}>
                  <FontAwesome
                    name={hasNumber ? 'check' : 'times'}
                    size={14}
                    color={hasNumber ? '#10b981' : '#d1d5db'}
                  />
                  <ThemedText style={styles.requirementText}>At least 1 number</ThemedText>
                </View>
                <View style={styles.requirementItem}>
                  <FontAwesome
                    name={passwordsMatch ? 'check' : 'times'}
                    size={14}
                    color={passwordsMatch ? '#10b981' : '#d1d5db'}
                  />
                  <ThemedText style={styles.requirementText}>Passwords match</ThemedText>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.updateButton, !isFormValid && styles.updateButtonDisabled]}
                onPress={onUpdatePassword}
                disabled={!isFormValid}
              >
                <ThemedText style={styles.updateText}>UPDATE PASSWORD</ThemedText>
              </TouchableOpacity>

              <View style={styles.footerRow}>
                <ThemedText style={styles.footerText}>Remember your password?</ThemedText>
                <Pressable onPress={() => router.replace('/signin')}>
                  <ThemedText style={styles.link}> Sign In</ThemedText>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 48,
  },
  backBtnWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 70,
  },
  backLabel: {
    color: '#ffb233',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
  },
  titleBrand: {
    color: '#ffb233',
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  description: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputWrapper: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#d1d5db',
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1f2937',
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 6,
  },
  requirementsBox: {
    width: '100%',
    marginTop: 24,
    marginBottom: 24,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fffbf0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffeaa7',
    gap: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requirementText: {
    fontSize: 13,
    color: '#6b7280',
  },
  updateButton: {
    width: '100%',
    borderRadius: 28,
    paddingVertical: 12,
    backgroundColor: '#ffb233',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffb233',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  updateButtonDisabled: {
    backgroundColor: '#d1d5db',
    shadowColor: '#d1d5db',
  },
  updateText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    justifyContent: 'center',
  },
  footerText: {
    color: '#6b7280',
  },
  link: {
    color: '#ffb233',
    fontWeight: '600',
  },
});
