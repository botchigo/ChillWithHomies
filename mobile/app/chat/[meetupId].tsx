import { FontAwesome } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, AppInput, Badge, BottomSheet, IconButton } from '@/components/ui/app-primitives';
import { AppColors, FontFamily, Radius, TypeScale } from '@/constants/theme';
import { useDemoApp } from '@/context/demo-app-context';
import type { ChatMessage } from '@/data/demo-data';

const ETA_OPTIONS = [5, 10, 15, 30];
const DEMO_LOCATIONS = [
  { name: 'Ốc Đào Nguyễn Trãi', address: 'Quận 1 · Ốc len xào dừa' },
  { name: 'Heart of Darkness', address: 'Thảo Điền · Bia craft' },
];
const POLL_TEMPLATES = [
  { q: 'Tối nay uống gì?', a: 'Bia hơi', b: 'Không cồn' },
  { q: 'Ngồi ở đâu?', a: 'Bàn trong nhà', b: 'Bàn ngoài trời' },
  { q: 'Chốt món gì?', a: 'Ốc len xào dừa', b: 'Nghêu hấp sả' },
];

type Sheet = 'poll' | 'location' | 'eta' | 'bill' | null;

function timeLabel(value: string) {
  return new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ meetupId: string }>();
  const meetupId = Array.isArray(params.meetupId) ? params.meetupId[0] : params.meetupId;
  const { state, hydrated, sendMessage, sendLocation, sendEta, createPoll, votePoll, markRoomRead, ensureChatRoom, sendBillNote, checkIn, setBillTotal, sendSafetySignal, notify } = useDemoApp();
  const [text, setText] = useState('');
  const [sheet, setSheet] = useState<Sheet>(null);
  const [pollQuestion, setPollQuestion] = useState(POLL_TEMPLATES[0].q);
  const [pollOptionA, setPollOptionA] = useState(POLL_TEMPLATES[0].a);
  const [pollOptionB, setPollOptionB] = useState(POLL_TEMPLATES[0].b);
  const [pollError, setPollError] = useState('');
  const [billText, setBillText] = useState('');
  const [billTotal, setBillTotalInput] = useState('');
  const [billError, setBillError] = useState('');
  const messageList = useRef<ScrollView>(null);

  const meetup = state.meetups.find((item) => item.id === meetupId);
  const room = state.chats.find((item) => item.meetupId === meetupId);
  const currentUser = state.currentUser;
  const allowed = !!meetup && !!currentUser && (meetup.hostId === currentUser.id || meetup.participants.some((participant) => participant.id === currentUser.id));

  useEffect(() => {
    if (allowed && room?.meetupId) markRoomRead(room.meetupId);
  }, [allowed, markRoomRead, room?.meetupId]);

  useEffect(() => {
    if (hydrated && allowed && meetupId && !room) ensureChatRoom(meetupId);
  }, [allowed, ensureChatRoom, hydrated, meetupId, room]);

  useEffect(() => {
    if (!room?.messages.length) return;
    const frame = requestAnimationFrame(() => messageList.current?.scrollToEnd({ animated: true }));
    return () => cancelAnimationFrame(frame);
  }, [room?.messages.length]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/chat');
  };

  if (!hydrated) {
    return <RoomState icon="comments" title="Đang mở phòng chat" description="Tin nhắn của cả nhóm đang được tải..." loading onPress={goBack} />;
  }

  if (!currentUser) return <Redirect href="/signin" />;

  if (!meetup) {
    return <RoomState icon="search" title="Không tìm thấy phòng chat" description="Meetup này không còn tồn tại hoặc đường dẫn chưa đúng." onPress={goBack} />;
  }

  if (!allowed) {
    return <RoomState icon="lock" title="Bạn chưa thể vào phòng này" description="Hãy tham gia meetup trước để trò chuyện cùng cả nhóm." onPress={goBack} />;
  }

  if (!room) {
    return <RoomState icon="hourglass-half" title="Phòng chat đang được chuẩn bị" description="Quay lại danh sách chat và thử mở lại sau ít phút." onPress={goBack} />;
  }

  const send = () => {
    const value = text.trim();
    if (!value) return;
    const result = sendMessage(meetup.id, value);
    if (!result.ok) {
      notify(result.error ?? 'Không thể gửi tin nhắn.');
      return;
    }
    setText('');
  };

  const submitPoll = () => {
    const options = [pollOptionA.trim(), pollOptionB.trim()];
    if (!pollQuestion.trim()) {
      setPollError('Vui lòng nhập câu hỏi bình chọn.');
      return;
    }
    if (options.some((option) => !option)) {
      setPollError('Bình chọn cần ít nhất 2 lựa chọn.');
      return;
    }
    if (options[0].toLocaleLowerCase('vi') === options[1].toLocaleLowerCase('vi')) {
      setPollError('Hai lựa chọn cần khác nhau.');
      return;
    }
    const result = createPoll(meetup.id, pollQuestion, options);
    if (!result.ok) {
      setPollError(result.error ?? 'Không thể tạo bình chọn.');
      return;
    }
    setPollQuestion('');
    setPollOptionA('');
    setPollOptionB('');
    setPollError('');
    setSheet(null);
    notify('Đã gửi bình chọn vào nhóm.');
  };

  const chooseLocation = (location: { name: string; address: string }) => {
    const result = sendLocation(meetup.id, location);
    if (!result.ok) notify(result.error ?? 'Không thể gửi vị trí.');
    else notify('Đã gửi vị trí cho cả nhóm.');
    setSheet(null);
  };

  const chooseEta = (minutes: number) => {
    const result = sendEta(meetup.id, minutes);
    if (!result.ok) notify(result.error ?? 'Không thể báo ETA.');
    else notify(`Cả nhóm đã biết bạn sẽ tới sau ${minutes} phút.`);
    setSheet(null);
  };

  const submitBill = () => {
    const total = Number(billTotal.replace(/[^\d]/g, ''));
    if (billTotal.trim() && (!total || total <= 0)) {
      setBillError('Tổng bill chưa đúng. Ví dụ 850000.');
      return;
    }
    if (total > 0) {
      const isHost = meetup.hostId === currentUser?.id;
      if (!isHost) {
        setBillError('Chỉ host mới được nhập tổng bill. Bạn ghi note bên dưới nhé.');
        return;
      }
      const res = setBillTotal(meetup.id, total);
      if (!res.ok) {
        setBillError(res.error ?? 'Không thể chốt bill.');
        return;
      }
    }
    if (billText.trim()) {
      const result = sendBillNote(meetup.id, billText);
      if (!result.ok) {
        setBillError(result.error ?? 'Không thể chốt bill.');
        return;
      }
    }
    if (!billText.trim() && !(total > 0)) {
      setBillError('Nhập tổng bill hoặc ghi chú chia tiền.');
      return;
    }
    setBillText('');
    setBillTotalInput('');
    setBillError('');
    setSheet(null);
    notify('Đã chốt bill cho cả nhóm.');
  };

  const locations = [{ name: meetup.location, address: meetup.district }, ...DEMO_LOCATIONS.filter((item) => item.name !== meetup.location)];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <IconButton icon="angle-left" accessibilityLabel="Quay lại danh sách chat" onPress={goBack} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Xem chi tiết ${meetup.title}`}
            onPress={() => router.push({ pathname: '/meetup/[id]', params: { id: meetup.id } })}
            style={({ pressed }) => [styles.groupCopy, pressed && styles.pressed]}
          >
            <View style={styles.groupTitleRow}>
              <Text numberOfLines={1} style={styles.groupTitle}>{meetup.title}</Text>
              <FontAwesome name="angle-right" size={14} color={AppColors.textSecondary} />
            </View>
            <Text numberOfLines={1} style={styles.groupSub}>{meetup.participants.length} thành viên · {meetup.location}</Text>
          </Pressable>
          <Badge label={`${room.onlineCount} online`} tone="green" />
        </View>

        <View style={styles.quickBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickContent}>
            <QuickAction icon="bar-chart" label="Vote món" onPress={() => setSheet('poll')} />
            <QuickAction icon="map-marker" label="Vị trí quán" onPress={() => setSheet('location')} />
            <QuickAction icon="clock-o" label="Báo giờ tới" onPress={() => setSheet('eta')} />
            <QuickAction icon="money" label="Chốt bill" onPress={() => setSheet('bill')} />
            <QuickAction icon="check" label="Check-in" onPress={() => { const r = checkIn(meetup.id); if (!r.ok && r.error) notify(r.error); }} />
            <QuickAction icon="cab" label="Grab về" onPress={() => { const r = sendSafetySignal(meetup.id, 'grab'); if (!r.ok && r.error) notify(r.error); }} />
          </ScrollView>
        </View>

        <ScrollView
          ref={messageList}
          style={styles.messages}
          contentContainerStyle={styles.messageContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => messageList.current?.scrollToEnd({ animated: false })}
        >
          <View style={styles.datePill}><Text style={styles.dateText}>NHÓM NHẬU · 18+</Text></View>
          <View style={styles.safetyNote}><FontAwesome name="cab" size={12} color={AppColors.success} /><Text style={styles.safetyText}>Đã uống không lái xe. Không ép uống, có option không cồn.</Text></View>
          {room.messages.map((message) => message.type === 'system' ? (
            <View key={message.id} style={styles.systemMessage}><FontAwesome name="info-circle" size={12} color={AppColors.textSecondary} /><Text style={styles.systemText}>{message.text}</Text></View>
          ) : (
            <MessageBubble
              key={message.id}
              message={message}
              mine={message.senderId === currentUser.id}
              blocked={state.blockedUsers.some((user) => user.id === message.senderId)}
              currentUserId={currentUser.id}
              onVote={(optionId) => votePoll(meetup.id, message.id, optionId)}
            />
          ))}
        </ScrollView>

        <View style={styles.composer}>
          <Pressable accessibilityRole="button" accessibilityLabel="Tạo bình chọn" onPress={() => setSheet('poll')} style={({ pressed }) => [styles.attach, pressed && styles.pressed]}><FontAwesome name="plus" size={16} color={AppColors.textSecondary} /></Pressable>
          <View style={styles.inputWrap}>
            <TextInput
              value={text}
              accessibilityLabel="Tin nhắn cho cả nhóm"
              onChangeText={setText}
              placeholder="Nhắn cho cả nhóm..."
              placeholderTextColor="#AA998A"
              style={styles.input}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={send}
            />
            <Pressable accessibilityRole="button" accessibilityLabel="Thêm emoji" onPress={() => setText((current) => `${current}${current ? ' ' : ''}😊`)} hitSlop={8}><FontAwesome name="smile-o" size={19} color={AppColors.textSecondary} /></Pressable>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Gửi tin nhắn" disabled={!text.trim()} onPress={send} style={({ pressed }) => [styles.send, !text.trim() && styles.sendDisabled, pressed && !!text.trim() && styles.pressed]}><FontAwesome name="send" size={15} color={AppColors.surface} /></Pressable>
        </View>
      </KeyboardAvoidingView>

      <BottomSheet visible={sheet === 'poll'} title="Vote món nhậu" onClose={() => { setSheet(null); setPollError(''); }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.sheetForm}>
            <View style={styles.templateRow}>{POLL_TEMPLATES.map((t) => <Pressable key={t.q} onPress={() => { setPollQuestion(t.q); setPollOptionA(t.a); setPollOptionB(t.b); setPollError(''); }} style={styles.templateChip}><Text style={styles.templateText}>{t.q}</Text></Pressable>)}</View>
            <AppInput label="Câu hỏi" value={pollQuestion} onChangeText={(value) => { setPollQuestion(value); setPollError(''); }} placeholder="Ví dụ: Tối nay uống gì?" maxLength={120} />
            <AppInput label="Lựa chọn 1" value={pollOptionA} onChangeText={(value) => { setPollOptionA(value); setPollError(''); }} placeholder="Bia hơi" maxLength={60} />
            <AppInput label="Lựa chọn 2" value={pollOptionB} onChangeText={(value) => { setPollOptionB(value); setPollError(''); }} placeholder="Không cồn" maxLength={60} />
            {pollError ? <Text accessibilityRole="alert" style={styles.error}>{pollError}</Text> : null}
            <AppButton label="Gửi bình chọn" icon="beer" onPress={submitPoll} />
          </View>
        </KeyboardAvoidingView>
      </BottomSheet>

      <BottomSheet visible={sheet === 'bill'} title="Chốt bill nhậu" onClose={() => { setSheet(null); setBillError(''); }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.sheetForm}>
            {meetup.hostId === currentUser?.id ? <AppInput label="Tổng bill (VND) — host nhập" value={billTotal} onChangeText={(v) => { setBillTotalInput(v); setBillError(''); }} keyboardType="number-pad" placeholder="850000" maxLength={10} /> : <Text style={styles.safetyText}>Chỉ host nhập tổng bill. Bạn ghi note bên dưới.</Text>}
            <AppInput label="Ghi chú chia tiền" value={billText} onChangeText={(value) => { setBillText(value); setBillError(''); }} placeholder="Tổng 850k / 5 người = 170k/người, chuyển cho host" multiline maxLength={200} />
            {billError ? <Text accessibilityRole="alert" style={styles.error}>{billError}</Text> : null}
            <AppButton label="Gửi chốt bill" icon="money" onPress={submitBill} />
          </View>
        </KeyboardAvoidingView>
      </BottomSheet>

      <BottomSheet visible={sheet === 'location'} title="Gửi một vị trí" onClose={() => setSheet(null)}>
        <View style={styles.sheetOptions}>{locations.map((location, index) => <SheetOption key={`${location.name}-${index}`} icon="map-marker" title={location.name} subtitle={location.address} onPress={() => chooseLocation(location)} />)}</View>
      </BottomSheet>

      <BottomSheet visible={sheet === 'eta'} title="Bạn sẽ tới sau bao lâu?" onClose={() => setSheet(null)}>
        <View style={styles.etaOptions}>{ETA_OPTIONS.map((minutes) => <Pressable key={minutes} accessibilityRole="button" onPress={() => chooseEta(minutes)} style={({ pressed }) => [styles.etaOption, pressed && styles.pressed]}><FontAwesome name="clock-o" size={18} color={AppColors.accent} /><Text style={styles.etaValue}>{minutes}</Text><Text style={styles.etaUnit}>phút</Text></Pressable>)}</View>
      </BottomSheet>
    </SafeAreaView>
  );
}

function MessageBubble({ message, mine, blocked, currentUserId, onVote }: { message: ChatMessage; mine: boolean; blocked: boolean; currentUserId: string; onVote: (optionId: string) => void }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <View style={[styles.messageRow, mine && styles.messageRowMine]}>
      {!mine ? <View style={[styles.miniAvatar, blocked && styles.blockedAvatar]}>{blocked ? <FontAwesome name="ban" size={11} color={AppColors.textSecondary} /> : <Text style={styles.miniAvatarText}>{message.senderName.charAt(0)}</Text>}</View> : null}
      <View style={[styles.bubbleBlock, mine && styles.bubbleBlockMine]}>
        {!mine && !blocked ? <Text style={styles.sender}>{message.senderName}</Text> : null}
        <View style={[styles.bubble, mine ? styles.sentBubble : styles.receivedBubble]}>
          {blocked && !revealed ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Hiện tin nhắn từ người dùng đã chặn" onPress={() => setRevealed(true)} style={({ pressed }) => [styles.blockedMessage, pressed && styles.pressed]}><FontAwesome name="eye-slash" size={14} color={AppColors.textSecondary} /><View style={{ flex: 1 }}><Text style={styles.blockedMessageTitle}>Tin nhắn từ người dùng đã chặn</Text><Text style={styles.blockedMessageAction}>Nhấn để hiện nội dung</Text></View></Pressable>
          ) : message.type === 'poll' && message.poll ? (
            <View style={styles.pollCard}>
              <View style={styles.messageKind}><FontAwesome name="bar-chart" size={12} color={AppColors.accent} /><Text style={styles.messageKindText}>BÌNH CHỌN</Text></View>
              <Text style={styles.pollQuestion}>{message.poll.question}</Text>
              <View style={styles.pollOptions}>{message.poll.options.map((option) => {
                const selected = option.voterIds.includes(currentUserId);
                return <Pressable key={option.id} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => onVote(option.id)} style={({ pressed }) => [styles.pollOption, selected && styles.pollOptionSelected, pressed && styles.pressed]}><View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <FontAwesome name="check" size={9} color={AppColors.surface} /> : null}</View><Text style={styles.pollLabel}>{option.label}</Text><Text style={styles.voteCount}>{option.voterIds.length} phiếu</Text></Pressable>;
              })}</View>
            </View>
          ) : message.type === 'location' && message.location ? (
            <View style={styles.locationCard}>
              <View style={styles.locationIcon}><FontAwesome name="map-marker" size={18} color={AppColors.accent} /></View>
              <View style={{ flex: 1 }}><Text style={styles.locationTitle}>{message.location.name}</Text><Text style={styles.locationAddress}>{message.location.address}</Text></View>
            </View>
          ) : message.type === 'eta' ? (
            <View style={styles.etaMessage}><FontAwesome name="clock-o" size={17} color={AppColors.accent} /><Text style={styles.bubbleText}>{message.text}</Text></View>
          ) : <Text style={styles.bubbleText}>{message.text}</Text>}
        </View>
        <Text style={styles.time}>{timeLabel(message.createdAt)}{mine ? '  ✓✓' : ''}</Text>
      </View>
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: React.ComponentProps<typeof FontAwesome>['name']; label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}><FontAwesome name={icon} size={13} color={AppColors.accent} /><Text style={styles.quickLabel}>{label}</Text></Pressable>;
}

function SheetOption({ icon, title, subtitle, onPress }: { icon: React.ComponentProps<typeof FontAwesome>['name']; title: string; subtitle: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.sheetOption, pressed && styles.pressed]}><View style={styles.sheetOptionIcon}><FontAwesome name={icon} size={16} color={AppColors.accent} /></View><View style={{ flex: 1 }}><Text style={styles.sheetOptionTitle}>{title}</Text><Text style={styles.sheetOptionSub}>{subtitle}</Text></View><FontAwesome name="send-o" size={15} color={AppColors.textSecondary} /></Pressable>;
}

function RoomState({ icon, title, description, loading = false, onPress }: { icon: React.ComponentProps<typeof FontAwesome>['name']; title: string; description: string; loading?: boolean; onPress: () => void }) {
  return <SafeAreaView style={styles.stateSafe} edges={['top', 'bottom']}><View style={styles.stateCard}><View style={styles.stateIcon}>{loading ? <ActivityIndicator color={AppColors.accent} /> : <FontAwesome name={icon} size={28} color={AppColors.accent} />}</View><Text style={styles.stateTitle}>{title}</Text><Text style={styles.stateDescription}>{description}</Text>{!loading ? <AppButton label="Quay lại danh sách chat" icon="arrow-left" onPress={onPress} /> : null}</View></SafeAreaView>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: AppColors.background },
  header: { minHeight: 72, backgroundColor: AppColors.surface, borderBottomWidth: 1, borderBottomColor: AppColors.border, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  groupCopy: { flex: 1, minWidth: 0 },
  groupTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  groupTitle: { ...TypeScale.h3, fontFamily: FontFamily.headingBold, color: AppColors.text, flexShrink: 1 },
  groupSub: { fontFamily: FontFamily.body, fontSize: 10, lineHeight: 15, color: AppColors.textSecondary },
  pressed: { opacity: 0.7 },
  quickBar: { backgroundColor: AppColors.surface, borderBottomWidth: 1, borderBottomColor: AppColors.border },
  quickContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  quickAction: { height: 36, borderRadius: Radius.pill, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: AppColors.section, borderWidth: 1, borderColor: AppColors.border },
  quickLabel: { ...TypeScale.caption, fontFamily: FontFamily.bodyMedium, color: AppColors.text },
  messages: { flex: 1 },
  messageContent: { padding: 16, paddingBottom: 24, flexGrow: 1, justifyContent: 'flex-end' },
  datePill: { alignSelf: 'center', backgroundColor: '#F4EFE9', borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  dateText: { fontFamily: FontFamily.bodySemiBold, fontSize: 9, color: AppColors.textSecondary, letterSpacing: 0.8 },
  safetyNote: { alignSelf: 'center', flexDirection: 'row', gap: 6, alignItems: 'center', paddingVertical: 14 },
  safetyText: { fontFamily: FontFamily.body, fontSize: 10, color: AppColors.textSecondary, flexShrink: 1 },
  systemMessage: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F4EFE9', borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 7, marginTop: 12, maxWidth: '90%' },
  systemText: { ...TypeScale.caption, color: AppColors.textSecondary, textAlign: 'center', flexShrink: 1 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 13 },
  messageRowMine: { justifyContent: 'flex-end' },
  miniAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: AppColors.primary, alignItems: 'center', justifyContent: 'center' },
  blockedAvatar: { backgroundColor: '#E9E2DB' },
  miniAvatarText: { fontFamily: FontFamily.headingBold, fontSize: 11, color: AppColors.text },
  bubbleBlock: { maxWidth: '82%', alignItems: 'flex-start' },
  bubbleBlockMine: { alignItems: 'flex-end' },
  sender: { fontFamily: FontFamily.bodySemiBold, fontSize: 10, color: AppColors.textSecondary, marginBottom: 4, marginLeft: 3 },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  receivedBubble: { backgroundColor: AppColors.surface, borderBottomLeftRadius: 5, borderWidth: 1, borderColor: AppColors.border },
  sentBubble: { backgroundColor: AppColors.primarySoft, borderBottomRightRadius: 5, borderWidth: 1, borderColor: '#F2D66E' },
  bubbleText: { ...TypeScale.body, color: AppColors.text, flexShrink: 1 },
  blockedMessage: { minWidth: 220, flexDirection: 'row', alignItems: 'center', gap: 9 },
  blockedMessageTitle: { ...TypeScale.caption, fontFamily: FontFamily.bodySemiBold, color: AppColors.textSecondary },
  blockedMessageAction: { fontFamily: FontFamily.body, fontSize: 9, color: AppColors.accent, marginTop: 2 },
  time: { fontFamily: FontFamily.body, fontSize: 9, color: '#A39282', marginTop: 4, marginHorizontal: 3 },
  messageKind: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  messageKindText: { fontFamily: FontFamily.bodySemiBold, fontSize: 9, color: AppColors.accent, letterSpacing: 0.6 },
  pollCard: { minWidth: 230 },
  pollQuestion: { ...TypeScale.label, color: AppColors.text, marginTop: 7 },
  pollOptions: { gap: 7, marginTop: 11 },
  pollOption: { minHeight: 42, borderRadius: 12, borderWidth: 1, borderColor: AppColors.border, backgroundColor: 'rgba(255,255,255,0.72)', paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  pollOptionSelected: { borderColor: AppColors.primary, backgroundColor: AppColors.surface },
  radio: { width: 17, height: 17, borderRadius: 9, borderWidth: 1, borderColor: AppColors.border, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: AppColors.accent, backgroundColor: AppColors.accent },
  pollLabel: { ...TypeScale.caption, color: AppColors.text, flex: 1 },
  voteCount: { fontFamily: FontFamily.bodyMedium, fontSize: 9, color: AppColors.textSecondary },
  locationCard: { minWidth: 210, flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  locationTitle: { ...TypeScale.label, color: AppColors.text },
  locationAddress: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 1 },
  etaMessage: { flexDirection: 'row', alignItems: 'center', gap: 9, maxWidth: 260 },
  composer: { minHeight: 72, backgroundColor: AppColors.surface, borderTopWidth: 1, borderTopColor: AppColors.border, paddingHorizontal: 12, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 8 },
  attach: { width: 38, height: 38, borderRadius: 19, backgroundColor: AppColors.section, alignItems: 'center', justifyContent: 'center' },
  inputWrap: { flex: 1, minHeight: 44, borderRadius: 22, backgroundColor: AppColors.section, borderWidth: 1, borderColor: AppColors.border, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { ...TypeScale.body, color: AppColors.text, flex: 1, paddingVertical: 10 },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: AppColors.accent, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { backgroundColor: AppColors.disabled },
  sheetForm: { gap: 14 },
  error: { ...TypeScale.caption, color: AppColors.danger },
  templateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  templateChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: Radius.pill, backgroundColor: AppColors.section, borderWidth: 1, borderColor: AppColors.border },
  templateText: { ...TypeScale.caption, color: AppColors.accentText },
  sheetOptions: { gap: 9 },
  sheetOption: { minHeight: 66, borderRadius: Radius.md, borderWidth: 1, borderColor: AppColors.border, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  sheetOptionIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  sheetOptionTitle: { ...TypeScale.label, color: AppColors.text },
  sheetOptionSub: { ...TypeScale.caption, color: AppColors.textSecondary, marginTop: 1 },
  etaOptions: { flexDirection: 'row', gap: 9 },
  etaOption: { flex: 1, minHeight: 86, borderRadius: Radius.md, borderWidth: 1, borderColor: AppColors.border, backgroundColor: AppColors.section, alignItems: 'center', justifyContent: 'center' },
  etaValue: { fontFamily: FontFamily.headingBold, fontSize: 20, color: AppColors.text, marginTop: 4 },
  etaUnit: { ...TypeScale.caption, color: AppColors.textSecondary },
  stateSafe: { flex: 1, backgroundColor: AppColors.background, alignItems: 'center', justifyContent: 'center', padding: 20 },
  stateCard: { width: '100%', maxWidth: 420, alignItems: 'center', backgroundColor: AppColors.surface, borderWidth: 1, borderColor: AppColors.border, borderRadius: Radius.lg, padding: 26 },
  stateIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: AppColors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  stateTitle: { ...TypeScale.h2, color: AppColors.text, marginTop: 17, textAlign: 'center' },
  stateDescription: { ...TypeScale.body, color: AppColors.textSecondary, marginTop: 7, marginBottom: 20, textAlign: 'center' },
});
