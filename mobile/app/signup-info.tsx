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

export default function SignUpInfoScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10,}$/.test(phone.replace(/[^\d]/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must contain 1 uppercase letter';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain 1 number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function onContinue() {
    if (!validateForm()) {
      return;
    }

    // Navigate to OTP verification with phone number
    router.push({
      pathname: '/signup-otp',
      params: { phone },
    });
  }

  // Clear a specific error key from the errors object
  const clearError = (field: string) => {
    setErrors(prev => {
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };

  // Check validity without relying on the errors object so the button lights up
  const checkFormValidity = () => {
    if (!fullName.trim()) return false;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
    if (!phone.trim() || !/^[0-9]{10,}$/.test(phone.replace(/[^\d]/g, ''))) return false;
    if (!password) return false;
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!confirmPassword) return false;
    if (password !== confirmPassword) return false;
    return true;
  };

  const isFormValid = checkFormValidity();

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
                Sign Up
              </ThemedText>
              <View style={{ width: 70 }} />
            </View>

            <View style={styles.form}>
              <ThemedText style={styles.description}>
                Create your account to get started
              </ThemedText>

              <View style={{ height: 24 }} />

              {/* Full Name */}
              <View style={styles.inputWrapper}>
                <ThemedText style={styles.label}>Full Name</ThemedText>
                <TextInput
                  style={[styles.input, errors.fullName && styles.inputError]}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9aa0a6"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (errors.fullName) clearError('fullName');
                  }}
                  editable={true}
                />
                {errors.fullName && <ThemedText style={styles.errorText}>{errors.fullName}</ThemedText>}
              </View>

              <View style={{ height: 16 }} />

              {/* Email */}
              <View style={styles.inputWrapper}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Enter your email"
                  placeholderTextColor="#9aa0a6"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) clearError('email');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={true}
                />
                {errors.email && <ThemedText style={styles.errorText}>{errors.email}</ThemedText>}
              </View>

              <View style={{ height: 16 }} />

              {/* Phone */}
              <View style={styles.inputWrapper}>
                <ThemedText style={styles.label}>Phone Number</ThemedText>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9aa0a6"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    if (errors.phone) clearError('phone');
                  }}
                  keyboardType="phone-pad"
                  editable={true}
                />
                {errors.phone && <ThemedText style={styles.errorText}>{errors.phone}</ThemedText>}
              </View>

              <View style={{ height: 16 }} />

              {/* Password */}
              <View style={styles.inputWrapper}>
                <ThemedText style={styles.label}>Password</ThemedText>
                <View style={[styles.passwordInputContainer, errors.password && styles.inputError]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter password"
                    placeholderTextColor="#9aa0a6"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) clearError('password');
                    }}
                    secureTextEntry={!showPassword}
                    editable={true}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <FontAwesome
                      name={showPassword ? 'eye' : 'eye-slash'}
                      size={16}
                      color="#6b7280"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && <ThemedText style={styles.errorText}>{errors.password}</ThemedText>}
              </View>

              <View style={{ height: 16 }} />

              {/* Confirm Password */}
              <View style={styles.inputWrapper}>
                <ThemedText style={styles.label}>Confirm Password</ThemedText>
                <View
                  style={[
                    styles.passwordInputContainer,
                    errors.confirmPassword && styles.inputError,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm password"
                    placeholderTextColor="#9aa0a6"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) clearError('confirmPassword');
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
                      size={16}
                      color="#6b7280"
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <ThemedText style={styles.errorText}>{errors.confirmPassword}</ThemedText>
                )}
              </View>

              <View style={{ height: 28 }} />

              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.continueButton, !isFormValid && styles.continueButtonDisabled]}
                onPress={onContinue}
                disabled={!isFormValid}
              >
                <ThemedText style={styles.continueText}>CONTINUE</ThemedText>
              </TouchableOpacity>

              <View style={styles.footerRow}>
                <ThemedText style={styles.footerText}>Already have an account?</ThemedText>
                <Pressable onPress={() => router.push('/signin')}>
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
    marginBottom: 32,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1.2,
    borderColor: '#d1d5db',
    fontSize: 15,
    color: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  inputError: {
    borderColor: '#ef4444',
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
  passwordInput: {
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
    marginTop: 4,
  },
  continueButton: {
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
  },
  continueButtonDisabled: {
    backgroundColor: '#d1d5db',
    shadowColor: '#d1d5db',
  },
  continueText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    justifyContent: 'center',
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  link: {
    color: '#ffb233',
    fontWeight: '600',
  },
});
