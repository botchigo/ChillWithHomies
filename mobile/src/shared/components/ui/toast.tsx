import { Feather } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppColors as C, TypeScale, WarmShadow } from '@/constants/theme';

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);
  if (!message) return null;
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={s.toast}>
      <Feather name="check-circle" size={20} color={C.success} />
      <Text style={[s.body, { flex: 1 }]}>{message}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Dismiss notification" onPress={onClose} style={s.dismiss}>
        <Feather name="x" size={20} color={C.text} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  body: { ...TypeScale.body, color: C.text },
  toast: {
    position: 'absolute', bottom: 24, left: 16, right: 16, maxWidth: 480, alignSelf: 'center',
    marginHorizontal: 'auto', backgroundColor: C.surface, padding: 16, borderRadius: 20,
    borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', gap: 12, ...WarmShadow,
  },
  dismiss: {
    width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
  },
});
