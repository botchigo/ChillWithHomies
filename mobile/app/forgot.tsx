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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  function onSendReset() {
    // placeholder: handle password reset email
    console.log('send reset email to', { email });
  }

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
                <FontAwesome name='chevron-left' size={20} color='#ffb233' />
                <ThemedText style={styles.backLabel}>Back</ThemedText>
              </Pressable>
              <ThemedText type="title" style={[styles.title, styles.titleBrand]}>
                Forgot Password
              </ThemedText>
              <View style={styles.backBtnWrapper} />
            </View>

            <View style={styles.form}>
              <ThemedText style={styles.description}>
                Enter your email or phone number and we'll send you instructions to reset your password.
              </ThemedText>

              <View style={{ height: 12 }} />

              <TextInput
                style={styles.input}
                placeholder='Email or Phone'
                placeholderTextColor='#6b7280'
                value={email}
                onChangeText={setEmail}
                editable={true}
              />

              <TouchableOpacity activeOpacity={0.9} style={styles.sendButton} onPress={onSendReset}>
                <ThemedText style={styles.sendText}>SEND RESET LINK</ThemedText>
              </TouchableOpacity>

              <View style={styles.footerRow}>
                <ThemedText style={styles.footerText}>Remember your password?</ThemedText>
                <Pressable onPress={() => router.push('/signin')}>
                  <ThemedText style={styles.link}> Sign In</ThemedText>
                </Pressable>
              </View>

              <View style={styles.footerRow}>
                <ThemedText style={styles.footerText}>Don't have an account?</ThemedText>
                <Pressable onPress={() => router.push('/signup')}>
                  <ThemedText style={styles.link}> Sign Up</ThemedText>
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
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  backLabel: {
    color: '#ffb233',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
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
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 1.2,
    borderColor: '#d1d5db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  sendButton: {
    marginTop: 20,
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
  sendText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
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
