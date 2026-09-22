import { FontAwesome } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { AppColors, FontFamily } from '@/constants/theme';
import { useDemoApp } from '@/context/demo-app-context';

const ACTIVE = AppColors.accent;

export default function TabLayout() {
  const { hydrated, state } = useDemoApp();
  if (!hydrated) return <View style={styles.loading}><ActivityIndicator color={AppColors.accent} /></View>;
  if (!state.currentUser) return <Redirect href="/signin" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: '#A39282',
        tabBarLabelStyle: { fontSize: 11, fontFamily: FontFamily.bodySemiBold, marginBottom: 4 },
        tabBarStyle: {
          height: 72,
          paddingTop: 8,
          backgroundColor: AppColors.surface,
          borderTopColor: AppColors.border,
        },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Trang chủ', tabBarIcon: ({ color }) => <FontAwesome name="home" size={21} color={color} /> }} />
      <Tabs.Screen name="explore" options={{ title: 'Ghép kèo', tabBarIcon: ({ color }) => <FontAwesome name="compass" size={21} color={color} /> }} />
      <Tabs.Screen name="create" options={{ title: 'Tạo kèo', tabBarIcon: ({ color }) => <FontAwesome name="plus-circle" size={25} color={color} /> }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarIcon: ({ color }) => <FontAwesome name="comments" size={21} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Tôi', tabBarIcon: ({ color }) => <FontAwesome name="user" size={20} color={color} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.background } });
