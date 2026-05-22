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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';

export default function SignInScreen() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function onSignIn() {
    if (!emailOrPhone || !password) {
      return;
    }
    
    setIsLoading(true);
    // placeholder: handle auth
    console.log('sign in', { emailOrPhone, password });
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // router.push('/(tabs)');
    }, 2000);
  }

  const isFormValid = emailOrPhone && password && !isLoading;

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
                placeholder='Số điện thoại'
                placeholderTextColor='#9aa0a6'
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                keyboardType='phone-pad'
                autoCapitalize='none'
                editable={!isLoading}
              />

              <View style={{ height: 12 }} />

              <View style={styles.passwordContainer}>
                <View style={styles.passwordInputWrapper} pointerEvents="box-none">
                  <TextInput
                    style={styles.passwordInput}
                    placeholder='Password'
                    placeholderTextColor='#9aa0a6'
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)} 
                    style={styles.showHideBtn}
                    disabled={isLoading}
                  >
                    <FontAwesome 
                      name={showPassword ? 'eye' : 'eye-slash'} 
                      size={18} 
                      color='#6b7280' 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                activeOpacity={0.9} 
                style={[styles.signInButton, !isFormValid && styles.signInButtonDisabled]} 
                onPress={onSignIn}
                disabled={!isFormValid}
              >
                {isLoading ? (
                  <ActivityIndicator size='small' color='#fff' />
                ) : (
                  <ThemedText style={styles.signInText}>SIGN IN</ThemedText>
                )}
              </TouchableOpacity>

              <View style={styles.signupRow}>
                <ThemedText style={styles.noAccount}>Don't have an account?</ThemedText>
                <Pressable onPress={() => router.push('/signup-info')} disabled={isLoading}>
                  <ThemedText style={styles.signUp}> Sign Up</ThemedText>
                </Pressable>
              </View>

              <View style={styles.dividerWrap}>
                <View style={styles.divider} />
                <ThemedText style={styles.orText}>Or sign in with:</ThemedText>
                <View style={styles.divider} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity 
                  style={styles.socialButton} 
                  onPress={() => console.log('fb')}
                  disabled={isLoading}
                >
                  <FontAwesome name='facebook' size={20} color='#3b5998' />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.socialButton} 
                  onPress={() => console.log('google')}
                  disabled={isLoading}
                >
                  <FontAwesome name='google' size={20} color='#DB4437' />
                </TouchableOpacity>
              </View>

              <Pressable 
                onPress={() => router.push('/forgot')} 
                style={styles.forgotPasswordRow}
                disabled={isLoading}
              >
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
  signInButtonDisabled: {
    backgroundColor: '#d1d5db',
    shadowColor: '#d1d5db',
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
