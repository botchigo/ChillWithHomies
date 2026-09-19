import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { AppColors, FontFamily } from '@/constants/theme';

const ACTIVE = AppColors.accent;

export default function TabLayout() {
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
