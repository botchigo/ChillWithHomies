import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppColors } from '@/constants/theme';
import { useAuth } from '@/src/features/auth/hooks/use-auth';

export default function Index() {
  const { hydrated, currentUser } = useAuth();
  if (!hydrated) return <View style={styles.loading}><ActivityIndicator color={AppColors.accent} /></View>;
  return <Redirect href={currentUser ? '/(tabs)' : '/signin'} />;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.background } });
