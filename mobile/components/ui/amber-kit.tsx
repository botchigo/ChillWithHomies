import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors as C, FontFamily as F, TypeScale, WarmShadow } from '@/constants/theme';

export type AmberIcon = React.ComponentProps<typeof Feather>['name'];
export function Icon({ name, size = 20, color = C.text }: { name: AmberIcon; size?: number; color?: string }) {
  return <Feather name={name} size={size} color={color} accessible={false} />;
}
export function Button({ label, icon, onPress, variant = 'primary', disabled, loading, small, style }: {
  label: string; icon?: AmberIcon; onPress?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'; disabled?: boolean; loading?: boolean; small?: boolean; style?: ViewStyle;
}) {
  const color = variant === 'destructive' ? C.dangerText : C.text;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled || !!loading, busy: !!loading }} disabled={disabled || loading} onPress={onPress}
    style={({ pressed }) => [s.button, s[variant], small && s.smallButton, style, pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] }, disabled && s.disabled]}>
    {loading ? <ActivityIndicator size="small" color={color} /> : icon ? <Icon name={icon} size={17} color={color} /> : null}
    <Text style={[s.buttonText, { color }]}>{label}</Text>
  </Pressable>;
}
export function RoundButton({ icon, label, onPress, selected = false }: { icon: AmberIcon; label: string; onPress?: () => void; selected?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [s.roundButton, selected && s.selected, pressed && { opacity: 0.65 }]}><Icon name={icon} size={19} /></Pressable>;
}
export function Field({ label, icon, error, hint, multiline, editable = true, ...props }: TextInputProps & { label?: string; icon?: AmberIcon; error?: string; hint?: string }) {
  const [focused, setFocused] = useState(false);
  return <View style={s.field}>
    {label && <Text style={s.label}>{label}</Text>}
    <View style={[s.inputWrap, focused && s.focus, !!error && { borderColor: C.dangerText }, !editable && s.disabled, multiline && { alignItems: 'flex-start', paddingTop: 16 }]}>
      {icon && <Icon name={icon} size={18} color={C.textSecondary} />}
      <TextInput {...props} accessibilityLabel={props.accessibilityLabel ?? label ?? props.placeholder} editable={editable} multiline={multiline} placeholderTextColor={C.textSecondary} onFocus={e => { setFocused(true); props.onFocus?.(e); }} onBlur={e => { setFocused(false); props.onBlur?.(e); }} style={[s.input, multiline && { minHeight: 80, textAlignVertical: 'top' }, props.style]} />
      {!!error && <Icon name="alert-circle" size={17} color={C.dangerText} />}
    </View>
    {(error || hint) && <Text accessibilityLiveRegion="polite" style={[s.caption, error ? { color: C.dangerText } : {}]}>{error || hint}</Text>}
  </View>;
}
export function Tag({ label, icon, selected, onPress }: { label: string; icon?: AmberIcon; selected?: boolean; onPress?: () => void }) {
  const content = <>{icon && <Icon name={icon} size={15} color={selected ? C.text : C.textSecondary} />}<Text style={[s.tagText, selected && { color: C.text }]}>{label}</Text>{selected && <Icon name="check" size={14} />}</>;
  return onPress ? <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: !!selected }} onPress={onPress} style={[s.tag, selected && s.selected]}>{content}</Pressable> : <View style={[s.tag, selected && s.selected]}>{content}</View>;
}
export function StatusBadge({ label, tone = 'amber', icon }: { label: string; tone?: 'amber' | 'green' | 'neutral' | 'orange' | 'red' | 'blue'; icon?: AmberIcon }) {
  const tones = { amber: [C.primarySoft, C.warning], green: [C.successSoft, '#276D50'], neutral: ['#F4EFE9', C.textSecondary], orange: [C.accentSoft, C.accentText], red: [C.dangerSoft, C.dangerText], blue: [C.infoSoft, C.info] };
  const [backgroundColor, color] = tones[tone];
  return <View style={[s.badge, { backgroundColor }]}>{icon && <Icon name={icon} size={12} color={color} />}<Text style={[s.badgeText, { color }]}>{label}</Text></View>;
}
export function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  return <View style={s.field}><Text style={s.label}>{label}</Text><Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} accessibilityState={{ expanded: open }} onPress={() => setOpen(true)} style={s.inputWrap}><Text style={[s.input, { paddingVertical: 14 }]}>{value}</Text><Icon name="chevron-down" size={17} /></Pressable>
    <Overlay visible={open} onClose={() => setOpen(false)} title={label} sheet>{options.map(option => <Pressable key={option} accessibilityRole="radio" accessibilityLabel={option} accessibilityState={{ checked: option === value }} onPress={() => { onChange(option); setOpen(false); }} style={s.option}><Text style={s.body}>{option}</Text>{option === value && <Icon name="check" color={C.accentText} />}</Pressable>)}</Overlay>
  </View>;
}
export const navItems: { label: string; icon: AmberIcon }[] = [{ label: 'Home', icon: 'home' }, { label: 'Match', icon: 'users' }, { label: 'Create', icon: 'plus' }, { label: 'Chat', icon: 'message-circle' }, { label: 'Me', icon: 'user' }];
export function BottomNav({ active, onChange }: { active: string; onChange: (value: string) => void }) {
  return <View accessibilityRole="tablist" style={s.nav}>{navItems.map(item => <Pressable key={item.label} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{ selected: active === item.label }} onPress={() => onChange(item.label)} style={s.navItem}><View style={[s.navIcon, item.label === 'Create' && s.createIcon, active === item.label && item.label !== 'Create' && { backgroundColor: C.primarySoft }]}><Icon name={item.icon} color={active === item.label || item.label === 'Create' ? C.text : C.textSecondary} /></View><Text style={[s.caption, active === item.label && { color: C.text, fontFamily: F.bodySemiBold }]}>{item.label}</Text></Pressable>)}</View>;
}
export function Overlay({ visible, onClose, title, children, sheet = false }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode; sheet?: boolean }) {
  return <Modal visible={visible} transparent animationType={sheet ? 'slide' : 'fade'} onRequestClose={onClose}><View style={[s.overlay, sheet && { justifyContent: 'flex-end' }]}><Pressable accessibilityRole="button" accessibilityLabel="Dismiss overlay" onPress={onClose} style={StyleSheet.absoluteFill} /><SafeAreaView edges={['bottom']} accessibilityViewIsModal style={[s.modal, sheet && s.sheet]}>{sheet && <View style={s.handle} />}<View style={s.modalHeader}><Text accessibilityRole="header" style={s.heading}>{title}</Text><RoundButton icon="x" label="Close overlay" onPress={onClose} /></View><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 16 }}>{children}</ScrollView></SafeAreaView></View></Modal>;
}
export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { if (!message) return; const timer = setTimeout(onClose, 4000); return () => clearTimeout(timer); }, [message, onClose]);
  if (!message) return null;
  return <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={s.toast}><Icon name="check-circle" color={C.success} /><Text style={[s.body, { flex: 1 }]}>{message}</Text><RoundButton icon="x" label="Dismiss notification" onPress={onClose} /></View>;
}

const s = StyleSheet.create({
  body: { ...TypeScale.body, color: C.text }, caption: { ...TypeScale.caption, color: C.textSecondary }, heading: { ...TypeScale.h2, color: C.text },
  button: { minHeight: 48, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, smallButton: { paddingHorizontal: 16 }, buttonText: { ...TypeScale.label },
  primary: { backgroundColor: C.primary, borderColor: C.primary }, secondary: { backgroundColor: C.primarySoft, borderColor: '#E9CC79' }, ghost: { backgroundColor: 'transparent', borderColor: C.border }, destructive: { backgroundColor: C.dangerSoft, borderColor: '#EDB9B2' }, disabled: { backgroundColor: '#F1EDE7', borderColor: '#E1D9CF', opacity: 0.55 }, focus: { outlineWidth: 2, outlineColor: C.accentText, outlineOffset: 3, borderColor: C.accentText },
  roundButton: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  field: { gap: 8 }, label: { ...TypeScale.label, color: C.text }, inputWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8, minHeight: 48, borderWidth: 1, borderColor: C.border, borderRadius: 16, backgroundColor: C.surface }, input: { ...TypeScale.body, color: C.text, flex: 1, minWidth: 0, paddingVertical: 14, outlineWidth: 0 },
  tag: { minHeight: 48, borderRadius: 999, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface }, tagText: { fontFamily: F.bodyMedium, fontSize: 12, color: C.textSecondary }, selected: { backgroundColor: C.primarySoft, borderColor: C.primary },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }, badgeText: { fontFamily: F.bodySemiBold, fontSize: 11 },
  nav: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderColor: C.border, backgroundColor: C.surface, borderRadius: 16 }, navItem: { flex: 1, alignItems: 'center', gap: 4, minHeight: 56, borderRadius: 8 }, navIcon: { width: 44, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, createIcon: { backgroundColor: C.primary, height: 36, width: 40 },
  overlay: { flex: 1, backgroundColor: C.overlay, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }, modal: { backgroundColor: C.surface, borderRadius: 24, padding: 24, width: '100%', maxWidth: 480, maxHeight: '85%', ...WarmShadow }, sheet: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }, modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }, handle: { height: 4, width: 40, backgroundColor: C.border, borderRadius: 4, alignSelf: 'center', marginBottom: 16 }, option: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: C.border },
  toast: { position: 'absolute', bottom: 24, left: 16, right: 16, maxWidth: 480, alignSelf: 'center', marginHorizontal: 'auto', backgroundColor: C.surface, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', gap: 12, ...WarmShadow },
});
