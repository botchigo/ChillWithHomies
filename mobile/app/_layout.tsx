import { DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { Toast } from '@/components/ui/amber-kit';
import { AppColors } from '@/constants/theme';
import { DemoAppProvider, useDemoApp } from '@/context/demo-app-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Manrope_600SemiBold, Manrope_700Bold });

  useEffect(() => { if (loaded) void SplashScreen.hideAsync(); }, [loaded]);
  if (!loaded) return null;

  return <DemoAppProvider><AppNavigator /></DemoAppProvider>;
}

function AppNavigator() {
  const { toast, dismissToast } = useDemoApp();
  return (
    <ThemeProvider value={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: AppColors.background, primary: AppColors.accent, card: AppColors.surface, text: AppColors.text, border: AppColors.border } }}>
      <Stack>
        <Stack.Screen name="signin" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="design-system" options={{ headerShown: false }} />
        <Stack.Screen name="signup-info" options={{ headerShown: false }} />
        <Stack.Screen name="signup-otp" options={{ headerShown: false }} />
        <Stack.Screen name="signup-kyc-guide" options={{ headerShown: false }} />
        <Stack.Screen name="signup-id-card" options={{ headerShown: false }} />
        <Stack.Screen name="signup-nfc-guide" options={{ headerShown: false }} />
        <Stack.Screen name="signup-liveness" options={{ headerShown: false }} />
        <Stack.Screen name="signup-review" options={{ headerShown: false }} />
        <Stack.Screen name="forgot" options={{ headerShown: false }} />
        <Stack.Screen name="otp-verify" options={{ headerShown: false }} />
        <Stack.Screen name="reset-password" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="meetup/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[meetupId]" options={{ headerShown: false }} />
        <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="friends" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="dark" />
      <Toast message={toast} onClose={dismissToast} />
    </ThemeProvider>
  );
}
