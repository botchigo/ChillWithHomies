import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, type TextInputProps, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors, FontFamily, Radius, Spacing, TypeScale, WarmShadow } from '@/constants/theme';

type IconName = React.ComponentProps<typeof FontAwesome>['name'];

export function AppButton({ label, onPress, icon, variant = 'primary', disabled = false, loading = false, compact = false }: { label: string; onPress?: () => void; icon?: IconName; variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'; disabled?: boolean; loading?: boolean; compact?: boolean }) {
  const light = variant === 'primary' || variant === 'destructive';
  const color = light ? AppColors.surface : AppColors.text;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: disabled || loading, busy: loading }} disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [styles.button, compact && styles.buttonCompact, styles[`button_${variant}`], pressed && styles.pressed, (disabled || loading) && styles.disabled]}>{loading ? <ActivityIndicator size="small" color={color} /> : icon ? <FontAwesome name={icon} size={15} color={color} /> : null}<Text style={[styles.buttonLabel, light && styles.buttonLabelLight]}>{label}</Text></Pressable>;
}

export function AppInput({ label, icon, multiline, style, error, hint, ...props }: TextInputProps & { label?: string; icon?: IconName; error?: string; hint?: string }) {
  const [focused, setFocused] = useState(false);
  return <View style={styles.field}>{label ? <Text style={styles.label}>{label}</Text> : null}<View style={[styles.inputShell, focused && styles.inputFocused, !!error && styles.inputError, multiline && styles.inputMultiline]}>{icon ? <FontAwesome name={icon} size={16} color={error ? AppColors.danger : AppColors.textSecondary} /> : null}<TextInput {...props} accessibilityLabel={props.accessibilityLabel ?? label ?? props.placeholder} multiline={multiline} placeholderTextColor="#AA998A" onFocus={(event) => { setFocused(true); props.onFocus?.(event); }} onBlur={(event) => { setFocused(false); props.onBlur?.(event); }} style={[styles.input, multiline && styles.multilineText, style]} />{error ? <FontAwesome name="exclamation-circle" size={15} color={AppColors.danger} /> : null}</View>{error || hint ? <Text accessibilityLiveRegion="polite" style={[styles.helper, error && styles.helperError]}>{error || hint}</Text> : null}</View>;
}

export function Chip({ label, selected = false, onPress, icon }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}>{icon ? <FontAwesome name={icon} size={12} color={selected ? AppColors.text : AppColors.textSecondary} /> : null}<Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text></Pressable>;
}

export function Badge({ label, tone = 'amber', icon }: { label: string; tone?: 'amber' | 'green' | 'neutral' | 'orange'; icon?: IconName }) {
  const color = tone === 'green' ? AppColors.success : tone === 'orange' ? AppColors.accent : tone === 'neutral' ? AppColors.textSecondary : '#9A6B00';
  return <View style={[styles.badge, tone === 'green' ? styles.badgeGreen : tone === 'orange' ? styles.badgeOrange : tone === 'neutral' ? styles.badgeNeutral : styles.badgeAmber]}>{icon ? <FontAwesome name={icon} size={11} color={color} /> : null}<Text style={[styles.badgeText, { color }]}>{label}</Text></View>;
}

export function IconButton({ icon, onPress, accessibilityLabel }: { icon: IconName; onPress?: () => void; accessibilityLabel: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><FontAwesome name={icon} size={18} color={AppColors.text} /></Pressable>;
}

export function SurfaceCard({ children, style, ...props }: ViewProps) { return <View {...props} style={[styles.surfaceCard, style]}>{children}</View>; }

export function BottomSheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  return <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}><View style={styles.modalRoot}><Pressable accessibilityRole="button" accessibilityLabel="Đóng bảng lựa chọn" style={styles.scrim} onPress={onClose} /><SafeAreaView accessibilityViewIsModal edges={['bottom']} style={styles.sheet}><View style={styles.grabber} /><View style={styles.sheetHeader}><Text style={styles.sheetTitle}>{title}</Text><IconButton icon="close" accessibilityLabel="Đóng" onPress={onClose} /></View>{children}</SafeAreaView></View></Modal>;
}

export function ConfirmDialog({ visible, title, message, confirmLabel, cancelLabel = 'Hủy', destructive = false, onConfirm, onCancel }: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.confirmRoot}>
        <Pressable accessibilityRole="button" accessibilityLabel="Đóng hộp thoại xác nhận" style={styles.scrim} onPress={onCancel} />
        <View accessibilityViewIsModal style={styles.confirmCard}>
          <View style={[styles.confirmIcon, destructive && styles.confirmIconDanger]}>
            <FontAwesome name={destructive ? 'exclamation-triangle' : 'question'} size={20} color={destructive ? AppColors.danger : AppColors.accent} />
          </View>
          <Text accessibilityRole="header" style={styles.confirmTitle}>{title}</Text>
          <Text style={styles.confirmMessage}>{message}</Text>
          <View style={styles.confirmActions}>
            <View style={styles.confirmAction}><AppButton label={cancelLabel} variant="ghost" onPress={onCancel} /></View>
            <View style={styles.confirmAction}><AppButton label={confirmLabel} variant={destructive ? 'destructive' : 'primary'} onPress={onConfirm} /></View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 54, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, borderWidth: 1 },
  buttonCompact: { minHeight: 40, paddingHorizontal: 16, borderRadius: 13 }, button_primary: { backgroundColor: AppColors.accent, borderColor: AppColors.accent }, button_secondary: { backgroundColor: AppColors.primarySoft, borderColor: '#F6D66B' }, button_ghost: { backgroundColor: AppColors.surface, borderColor: AppColors.border }, button_destructive: { backgroundColor: AppColors.danger, borderColor: AppColors.danger },
  buttonLabel: { ...TypeScale.label, color: AppColors.text }, buttonLabelLight: { color: AppColors.surface }, pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] }, disabled: { opacity: 0.5 },
  field: { gap: 8 }, label: { ...TypeScale.label, color: AppColors.text }, inputShell: { minHeight: 54, borderRadius: Radius.md, backgroundColor: AppColors.surface, borderWidth: 1, borderColor: AppColors.border, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 }, inputFocused: { borderColor: AppColors.accent }, inputError: { borderColor: AppColors.danger }, inputMultiline: { minHeight: 112, alignItems: 'flex-start', paddingTop: 16 }, input: { ...TypeScale.body, color: AppColors.text, flex: 1, paddingVertical: 0, outlineWidth: 0 }, multilineText: { minHeight: 80, textAlignVertical: 'top' }, helper: { ...TypeScale.caption, color: AppColors.textSecondary }, helperError: { color: AppColors.dangerText },
  chip: { minHeight: 44, borderRadius: Radius.pill, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: AppColors.border, backgroundColor: AppColors.surface }, chipSelected: { backgroundColor: AppColors.primarySoft, borderColor: AppColors.primary }, chipText: { ...TypeScale.caption, fontFamily: FontFamily.bodyMedium, color: AppColors.textSecondary }, chipTextSelected: { color: AppColors.text, fontFamily: FontFamily.bodySemiBold },
  badge: { height: 26, borderRadius: Radius.pill, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 5 }, badgeAmber: { backgroundColor: AppColors.primarySoft }, badgeOrange: { backgroundColor: AppColors.accentSoft }, badgeGreen: { backgroundColor: AppColors.successSoft }, badgeNeutral: { backgroundColor: '#F4EFE9' }, badgeText: { fontFamily: FontFamily.bodySemiBold, fontSize: 11, lineHeight: 15 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: AppColors.surface, borderWidth: 1, borderColor: AppColors.border, alignItems: 'center', justifyContent: 'center' }, surfaceCard: { backgroundColor: AppColors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: AppColors.border, ...WarmShadow },
  modalRoot: { flex: 1, justifyContent: 'flex-end' }, scrim: { ...StyleSheet.absoluteFill, backgroundColor: AppColors.overlay }, sheet: { maxHeight: '88%', backgroundColor: AppColors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 }, grabber: { width: 42, height: 5, borderRadius: 3, backgroundColor: AppColors.border, alignSelf: 'center', marginBottom: 18 }, sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }, sheetTitle: { ...TypeScale.h2, color: AppColors.text },
  confirmRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }, confirmCard: { width: '100%', maxWidth: 420, alignItems: 'center', padding: 24, borderRadius: Radius.lg, borderWidth: 1, borderColor: AppColors.border, backgroundColor: AppColors.surface, ...WarmShadow }, confirmIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.accentSoft }, confirmIconDanger: { backgroundColor: AppColors.dangerSoft }, confirmTitle: { ...TypeScale.h2, color: AppColors.text, textAlign: 'center', marginTop: 16 }, confirmMessage: { ...TypeScale.body, color: AppColors.textSecondary, textAlign: 'center', marginTop: 8 }, confirmActions: { alignSelf: 'stretch', flexDirection: 'row', gap: 10, marginTop: 22 }, confirmAction: { flex: 1 },
});
