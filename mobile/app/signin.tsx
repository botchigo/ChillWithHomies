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
  SafeAreaView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';

export default function SignInScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function onSignIn() {
    // placeholder: handle auth
    console.log('sign in', { phone, password });
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <ThemedText type="title" style={[styles.title, styles.titleBrand]}>
              ChillWithHomies
            </ThemedText>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder='Username'
                placeholderTextColor='#9aa0a6'
                value={phone}
                onChangeText={setPhone}
              />

              <View style={{ height: 12 }} />

              <View style={styles.passwordContainer}>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder='Password'
                    placeholderTextColor='#9aa0a6'
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable onPress={() => setShowPassword(v => !v)} style={styles.showHideBtn}>
                    <ThemedText style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</ThemedText>
                  </Pressable>
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.9} style={styles.signInButton} onPress={onSignIn}>
                <ThemedText style={styles.signInText}>SIGN IN</ThemedText>
              </TouchableOpacity>

              <View style={styles.signupRow}>
                <ThemedText style={styles.noAccount}>Don't have an account?</ThemedText>
                <Pressable onPress={() => router.push('/signup')}>
                  <ThemedText style={styles.signUp}> Sign Up</ThemedText>
                </Pressable>
              </View>

              <View style={styles.dividerWrap}>
                <View style={styles.divider} />
                <ThemedText style={styles.orText}>Or sign in with:</ThemedText>
                <View style={styles.divider} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialButton} onPress={() => console.log('fb') }>
                  <FontAwesome name='facebook' size={20} color='#3b5998' />
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButton} onPress={() => console.log('google') }>
                  <FontAwesome name='google' size={20} color='#DB4437' />
                </TouchableOpacity>
              </View>

              <Pressable onPress={() => router.push('/forgot')} style={styles.forgotPasswordRow}>
                <ThemedText style={styles.forgotPasswordText}>Forgot password?</ThemedText>
              </Pressable>
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
    paddingTop: 36,
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    marginTop: 6,
    marginBottom: 28,
    textAlign: 'center',
  },
  titleBrand: {
    color: '#ffb233',
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: '#8b8f93',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e6e6e6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  passwordContainer: {
    width: '100%',
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e6e6e6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
    paddingRight: 60,
  },
  showHideBtn: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  showHideText: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '500',
  },
  signInButton: {
    marginTop: 22,
    width: '100%',
    borderRadius: 30,
    paddingVertical: 14,
    backgroundColor: '#ffb233',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffb233',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  signInText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  noAccount: {
    color: '#6b7280',
  },
  signUp: {
    color: '#ffb233',
    fontWeight: '600',
  },
  dividerWrap: {
    width: '100%',
    marginTop: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ececec',
    marginHorizontal: 8,
  },
  orText: {
    color: '#9aa0a6',
    fontSize: 13,
  },
  socialRow: {
    marginTop: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialButton: {
    width: 140,
    height: 48,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  forgotPasswordRow: {
    marginTop: 20,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
});
