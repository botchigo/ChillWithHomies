import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';

export default function OTPVerifyScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const canResend = timeLeft === 0;
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Handle OTP input
  const handleOTPChange = (text: string, index: number) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '');

    if (numericText.length > 1) {
      // Handle paste
      const digits = numericText.split('').slice(0, 6 - index);
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        newOtp[index + i] = digit;
      });
      setOtp(newOtp);

      // Move focus to the last filled field
      const lastIndex = Math.min(index + digits.length, 5);
      if (lastIndex < 6) {
        setTimeout(() => inputRefs.current[lastIndex]?.focus(), 100);
      }
    } else {
      // Single digit input
      const newOtp = [...otp];
      newOtp[index] = numericText;
      setOtp(newOtp);

      // Move to next input
      if (numericText && index < 5) {
        setTimeout(() => inputRefs.current[index + 1]?.focus(), 100);
      }
    }
  };

  // Handle backspace
  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      setTimeout(() => inputRefs.current[index - 1]?.focus(), 100);
    }
  };

  function onVerifyOTP() {
    const otpCode = otp.join('');
    if (!/^[0-9]{6}$/.test(otpCode)) return;
    // Placeholder: verify OTP code
    
    // After successful OTP verification, redirect to reset password screen
    router.push('/reset-password');
  }

  function onResendOTP() {
    // Reset timer and allow resending
    setTimeLeft(60);
    setOtp(['', '', '', '', '', '']);
    console.log('resend otp');
    // Placeholder: resend OTP code
  }

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  };

  const isOTPComplete = otp.every((digit) => digit !== '');

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
                Verify OTP
              </ThemedText>
              <View style={{ width: 70 }} />
            </View>

            <View style={styles.form}>
              <ThemedText style={styles.description}>
                Enter the 6-digit code we sent to your email or phone number
              </ThemedText>

              <View style={{ height: 32 }} />

              {/* OTP Input Fields */}
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      digit && styles.otpInputFilled,
                      otp[index] === '' && index === otp.findIndex((d) => d === '') && styles.otpInputFocused,
                    ]}
                    placeholder="0"
                    placeholderTextColor="#d1d5db"
                    maxLength={1}
                    keyboardType="number-pad"
                    value={digit}
                    onChangeText={(text) => handleOTPChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    textAlign="center"
                    editable={true}
                  />
                ))}
              </View>

              {/* Timer or Resend Button */}
              <View style={styles.timerContainer}>
                {!canResend ? (
                  <View style={styles.timerBox}>
                    <FontAwesome name="clock-o" size={16} color="#ffb233" />
                    <ThemedText style={styles.timerText}>{formatTime(timeLeft)}</ThemedText>
                  </View>
                ) : (
                  <TouchableOpacity activeOpacity={0.7} style={styles.resendButton} onPress={onResendOTP}>
                    <FontAwesome name="repeat" size={16} color="#ffb233" />
                    <ThemedText style={styles.resendText}>Resend OTP</ThemedText>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.verifyButton, !isOTPComplete && styles.verifyButtonDisabled]}
                onPress={onVerifyOTP}
                disabled={!isOTPComplete}
              >
                <ThemedText style={styles.verifyText}>VERIFY OTP</ThemedText>
              </TouchableOpacity>

              <View style={styles.footerRow}>
                <ThemedText style={styles.footerText}>Remember your password?</ThemedText>
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#d1d5db',
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: '#ffb233',
    backgroundColor: '#fffbf0',
  },
  otpInputFocused: {
    borderColor: '#ffb233',
  },
  timerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fffbf0',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffb233',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fffbf0',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ffb233',
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffb233',
  },
  verifyButton: {
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
  verifyButtonDisabled: {
    backgroundColor: '#d1d5db',
    shadowColor: '#d1d5db',
  },
  verifyText: {
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
