import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, IconButton } from '@/components/ui/app-primitives';
import { AppColors, FontFamily, Radius, TypeScale } from '@/constants/theme';

const initialMessages = [
  { id: '1', sender: 'Minh Anh', text: 'Chào mọi người 👋 Tối nay tụi mình ngồi bàn ngoài nhé?', time: '18:31', mine: false },
  { id: '2', sender: 'Lan', text: 'Ok nè, mình sẽ tới trước 10 phút.', time: '18:34', mine: false },
  { id: '3', sender: 'Bạn', text: 'Mình cũng đang trên đường. Hẹn cả nhóm lúc 19:30 nha!', time: '18:39', mine: true },
  { id: '4', sender: 'Minh Anh', text: 'Tuyệt quá! Mình đã đặt bàn tên “Homies” rồi đó 🍻', time: '18:42', mine: false },
];

export default function ChatScreen() {
  const [text, setText] = useState(''); const [messages, setMessages] = useState(initialMessages);
  const send = () => { const value = text.trim(); if (!value) return; setMessages((current) => [...current, { id: String(Date.now()), sender: 'Bạn', text: value, time: 'Bây giờ', mine: true }]); setText(''); };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View style={styles.groupAvatar}><FontAwesome name="users" size={18} color={AppColors.surface} /></View>
          <View style={styles.groupCopy}><View style={styles.groupTitleRow}><Text numberOfLines={1} style={styles.groupTitle}>Startup & chill</Text><Badge label="4 online" tone="green" /></View><Text style={styles.groupSub}>6 thành viên · The Workshop Coffee</Text></View>
          <IconButton icon="info" accessibilityLabel="Thông tin nhóm" />
        </View>
        <View style={styles.quickBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickContent}>
            <QuickAction icon="bar-chart" label="Tạo bình chọn" /><QuickAction icon="map-marker" label="Gửi vị trí" /><QuickAction icon="clock-o" label="Báo ETA" />
          </ScrollView>
        </View>
        <ScrollView style={styles.messages} contentContainerStyle={styles.messageContent} showsVerticalScrollIndicator={false}>
          <View style={styles.datePill}><Text style={styles.dateText}>HÔM NAY</Text></View>
          <View style={styles.safetyNote}><FontAwesome name="lock" size={12} color={AppColors.success} /><Text style={styles.safetyText}>Chat nhóm chỉ dành cho thành viên đã được duyệt.</Text></View>
          {messages.map((message, index) => <View key={message.id} style={[styles.messageRow, message.mine && styles.messageRowMine]}>{!message.mine ? <View style={styles.miniAvatar}><Text style={styles.miniAvatarText}>{message.sender.charAt(0)}</Text></View> : null}<View style={[styles.bubbleBlock, message.mine && { alignItems: 'flex-end' }]}>{!message.mine && (index === 0 || messages[index - 1]?.sender !== message.sender) ? <Text style={styles.sender}>{message.sender}</Text> : null}<View style={[styles.bubble, message.mine ? styles.sentBubble : styles.receivedBubble]}><Text style={styles.bubbleText}>{message.text}</Text></View><Text style={styles.time}>{message.time}{message.mine ? '  ✓✓' : ''}</Text></View></View>)}
        </ScrollView>
        <View style={styles.composer}><Pressable style={styles.attach}><FontAwesome name="plus" size={16} color={AppColors.textSecondary} /></Pressable><View style={styles.inputWrap}><TextInput value={text} onChangeText={setText} placeholder="Nhắn cho cả nhóm..." placeholderTextColor="#AA998A" style={styles.input} onSubmitEditing={send} /><FontAwesome name="smile-o" size={19} color={AppColors.textSecondary} /></View><Pressable onPress={send} style={[styles.send, !text.trim() && styles.sendDisabled]}><FontAwesome name="send" size={15} color={AppColors.surface} /></Pressable></View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function QuickAction({ icon, label }: { icon: React.ComponentProps<typeof FontAwesome>['name']; label: string }) { return <Pressable style={styles.quickAction}><FontAwesome name={icon} size={13} color={AppColors.accent} /><Text style={styles.quickLabel}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.background }, header: { minHeight: 72, backgroundColor: AppColors.surface, borderBottomWidth: 1, borderBottomColor: AppColors.border, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 11 }, groupAvatar: { width: 44, height: 44, borderRadius: 16, backgroundColor: AppColors.accent, alignItems: 'center', justifyContent: 'center' }, groupCopy: { flex: 1 }, groupTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 }, groupTitle: { ...TypeScale.h3, fontFamily: FontFamily.headingBold, color: AppColors.text, maxWidth: 160 }, groupSub: { fontFamily: FontFamily.body, fontSize: 10, lineHeight: 15, color: AppColors.textSecondary },
  quickBar: { backgroundColor: AppColors.surface, borderBottomWidth: 1, borderBottomColor: AppColors.border }, quickContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 }, quickAction: { height: 34, borderRadius: Radius.pill, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: AppColors.section, borderWidth: 1, borderColor: AppColors.border }, quickLabel: { ...TypeScale.caption, fontFamily: FontFamily.bodyMedium, color: AppColors.text },
  messages: { flex: 1 }, messageContent: { padding: 16, paddingBottom: 24 }, datePill: { alignSelf: 'center', backgroundColor: '#F4EFE9', borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 5 }, dateText: { fontFamily: FontFamily.bodySemiBold, fontSize: 9, color: AppColors.textSecondary, letterSpacing: 0.8 }, safetyNote: { alignSelf: 'center', flexDirection: 'row', gap: 6, alignItems: 'center', paddingVertical: 14 }, safetyText: { fontFamily: FontFamily.body, fontSize: 10, color: AppColors.textSecondary }, messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 13 }, messageRowMine: { justifyContent: 'flex-end' }, miniAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: AppColors.primary, alignItems: 'center', justifyContent: 'center' }, miniAvatarText: { fontFamily: FontFamily.headingBold, fontSize: 11, color: AppColors.text }, bubbleBlock: { maxWidth: '78%', alignItems: 'flex-start' }, sender: { fontFamily: FontFamily.bodySemiBold, fontSize: 10, color: AppColors.textSecondary, marginBottom: 4, marginLeft: 3 }, bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 }, receivedBubble: { backgroundColor: AppColors.surface, borderBottomLeftRadius: 5, borderWidth: 1, borderColor: AppColors.border }, sentBubble: { backgroundColor: AppColors.primarySoft, borderBottomRightRadius: 5, borderWidth: 1, borderColor: '#F2D66E' }, bubbleText: { ...TypeScale.body, color: AppColors.text }, time: { fontFamily: FontFamily.body, fontSize: 9, color: '#A39282', marginTop: 4, marginHorizontal: 3 },
  composer: { minHeight: 72, backgroundColor: AppColors.surface, borderTopWidth: 1, borderTopColor: AppColors.border, paddingHorizontal: 12, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 8 }, attach: { width: 38, height: 38, borderRadius: 19, backgroundColor: AppColors.section, alignItems: 'center', justifyContent: 'center' }, inputWrap: { flex: 1, height: 44, borderRadius: 22, backgroundColor: AppColors.section, borderWidth: 1, borderColor: AppColors.border, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }, input: { ...TypeScale.body, color: AppColors.text, flex: 1 }, send: { width: 42, height: 42, borderRadius: 21, backgroundColor: AppColors.accent, alignItems: 'center', justifyContent: 'center' }, sendDisabled: { backgroundColor: AppColors.disabled },
});
