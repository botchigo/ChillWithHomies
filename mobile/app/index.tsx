import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppColors } from '@/constants/theme';
import { useDemoApp } from '@/context/demo-app-context';

export default function Index() {
  const { hydrated, state } = useDemoApp();
  if (!hydrated) return <View style={styles.loading}><ActivityIndicator color={AppColors.accent} /></View>;
  return <Redirect href={state.currentUser ? '/(tabs)' : '/signin'} />;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.background } });
