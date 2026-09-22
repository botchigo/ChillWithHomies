import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { createSeedState } from '@/data/demo-data';
import { loadDemoState, saveDemoState } from '@/src/shared/persistence/demo-state-storage';
import { normalizePhone, normalizeUsername, validateCompleteSignUp, validateSignInCredentials } from '@/src/features/auth/services/auth-validation';
import type { CompleteSignUpInput } from '@/src/features/auth/types';
import type { ChatMessage } from '@/src/features/chat/types';
import type { UserProfile } from '@/src/features/profile/types';
import { meetupDateLabel, splitBillEqually } from '@/src/features/sessions/services/session-rules';
import type { MeetupDraft } from '@/src/features/sessions/types';
import { applyCompletedMeetupReward, applyNoShowPenalty } from '@/src/features/trust/services/trust-score';
import type { DemoAppState } from '@/src/shared/types/demo-app-state';
import type { ActionResult } from '@/src/shared/types/result';

type DemoAppContextValue = {
  state: DemoAppState;
  hydrated: boolean;
  toast: string;
  dismissToast: () => void;
  notify: (message: string) => void;
  signIn: (phone: string, password: string) => ActionResult;
  completeSignUp: (input: CompleteSignUpInput) => ActionResult;
  signOut: () => void;
  updateProfile: (input: Pick<UserProfile, 'name' | 'username' | 'bio' | 'city'>) => void;
  updateInterests: (interests: string[]) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  unblockUser: (userId: string) => void;
  sendFriendRequest: (userId: string) => ActionResult;
  cancelFriendRequest: (userId: string) => ActionResult;
  acceptFriendRequest: (userId: string) => ActionResult;
  rejectFriendRequest: (userId: string) => ActionResult;
  unfriendUser: (userId: string) => ActionResult;
  blockUser: (userId: string) => ActionResult;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
  joinMeetup: (meetupId: string) => ActionResult;
  leaveMeetup: (meetupId: string) => ActionResult;
  emergencyLeave: (meetupId: string) => ActionResult;
  createMeetup: (draft: MeetupDraft) => string | null;
  toggleTableBooked: (meetupId: string) => void;
  sendBillNote: (meetupId: string, text: string) => ActionResult;
  checkIn: (meetupId: string) => ActionResult;
  setBillTotal: (meetupId: string, total: number) => ActionResult;
  markMyPayment: (meetupId: string) => ActionResult;
  confirmPayment: (meetupId: string, userId: string) => ActionResult;
  sendSafetySignal: (meetupId: string, kind: 'grab' | 'sos') => ActionResult;
  sendMessage: (meetupId: string, text: string) => ActionResult;
  sendLocation: (meetupId: string, location: { name: string; address: string }) => ActionResult;
  sendEta: (meetupId: string, minutes: number) => ActionResult;
  createPoll: (meetupId: string, question: string, options: string[]) => ActionResult;
  votePoll: (meetupId: string, messageId: string, optionId: string) => void;
  markRoomRead: (meetupId: string) => void;
  ensureChatRoom: (meetupId: string) => ActionResult;
};

const DemoAppContext = createContext<DemoAppContextValue | null>(null);

const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
export function DemoAppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoAppState>(() => createSeedState());
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    let alive = true;
    loadDemoState()
      .then((storedState) => { if (alive && storedState) setState(storedState); })
      .catch(() => { if (alive) setToast('Không thể khôi phục dữ liệu demo. Ứng dụng đang dùng dữ liệu mặc định.'); })
      .finally(() => { if (alive) setHydrated(true); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveDemoState(state).catch(() => setToast('Không thể lưu dữ liệu demo trên thiết bị này.'));
  }, [hydrated, state]);

  const notify = useCallback((message: string) => setToast(message), []);
  const dismissToast = useCallback(() => setToast(''), []);

  const signIn = useCallback((phone: string, password: string): ActionResult => {
    const validation = validateSignInCredentials(phone, password);
    if (!validation.ok) return validation;
    setState((current) => {
      const profile = { ...current.profile, phone: phone.replace(/\s/g, '') };
      return { ...current, profile, currentUser: profile };
    });
    return { ok: true };
  }, []);

  const completeSignUp = useCallback((input: CompleteSignUpInput): ActionResult => {
    const validation = validateCompleteSignUp(input, state.users.map((user) => user.username));
    if (!validation.ok) return validation;
    const username = normalizeUsername(input.username).toLowerCase();
    const userId = `user-${username}-${Date.now().toString(36)}`;
    const profile: UserProfile = {
      id: userId,
      name: input.name.trim(),
      username,
      phone: normalizePhone(input.phone),
      bio: input.bio.trim(),
      city: input.city.trim(),
      interests: input.interests,
      dateOfBirth: input.dateOfBirth,
      verifiedPhone: true,
      preferredVibes: input.preferredVibes,
      avatarColor: input.avatarColor,
      avatarUri: input.avatarUri,
      verified: false,
    };
    setState((current) => ({
      ...current,
      currentUser: profile,
      profile,
      users: [...current.users, { ...profile, friendIds: [] }],
      friendIds: [],
      sentFriendRequestIds: [],
      receivedFriendRequestIds: [],
      blockedUsers: [],
      reviews: [],
      notifications: [],
      notificationsEnabled: input.notificationsEnabled,
    }));
    return { ok: true };
  }, [state.users]);

  const signOut = useCallback(() => setState((current) => ({ ...current, currentUser: null })), []);

  const updateProfile = useCallback((input: Pick<UserProfile, 'name' | 'username' | 'bio' | 'city'>) => {
    setState((current) => {
      const profile = { ...current.profile, ...input };
      const syncUser = (user: { id: string; name: string; username: string; avatarColor: string; verified?: boolean }) => user.id === profile.id
        ? { ...user, name: profile.name, username: profile.username }
        : user;
      return {
        ...current,
        profile,
        currentUser: current.currentUser ? profile : null,
        meetups: current.meetups.map((meetup) => ({
          ...meetup,
          hostName: meetup.hostId === profile.id ? profile.name : meetup.hostName,
          participants: meetup.participants.map(syncUser),
        })),
        users: current.users.map((user) => user.id === profile.id ? {
          ...user,
          name: profile.name,
          username: profile.username,
          bio: profile.bio,
          city: profile.city,
        } : user),
      };
    });
    notify('Đã lưu thay đổi hồ sơ.');
  }, [notify]);

  const updateInterests = useCallback((interests: string[]) => {
    setState((current) => ({
      ...current,
      profile: { ...current.profile, interests },
      currentUser: current.currentUser ? { ...current.currentUser, interests } : null,
      users: current.users.map((user) => user.id === current.profile.id ? { ...user, interests } : user),
    }));
    notify('Đã cập nhật sở thích.');
  }, [notify]);

  const setNotificationsEnabled = useCallback((enabled: boolean) => setState((current) => ({ ...current, notificationsEnabled: enabled })), []);
  const unblockUser = useCallback((userId: string) => {
    setState((current) => ({ ...current, blockedUsers: current.blockedUsers.filter((user) => user.id !== userId) }));
    notify('Đã bỏ chặn tài khoản.');
  }, [notify]);

  const sendFriendRequest = useCallback((userId: string): ActionResult => {
    if (!state.currentUser) return { ok: false, error: 'Bạn chưa đăng nhập.' };
    if (userId === state.currentUser.id) return { ok: false, error: 'Bạn không thể tự kết bạn với chính mình.' };
    if (state.blockedUsers.some((user) => user.id === userId)) return { ok: false, error: 'Hãy bỏ chặn người dùng trước khi kết bạn.' };
    if (state.friendIds.includes(userId)) return { ok: false, error: 'Hai bạn đã là bạn bè.' };
    if (state.receivedFriendRequestIds.includes(userId)) return { ok: false, error: 'Người này đã gửi lời mời cho bạn. Hãy chấp nhận hoặc từ chối.' };
    if (state.sentFriendRequestIds.includes(userId)) return { ok: true };
    setState((current) => current.sentFriendRequestIds.includes(userId) ? current : { ...current, sentFriendRequestIds: [...current.sentFriendRequestIds, userId] });
    notify('Đã gửi lời mời kết bạn.');
    return { ok: true };
  }, [notify, state.blockedUsers, state.currentUser, state.friendIds, state.receivedFriendRequestIds, state.sentFriendRequestIds]);

  const cancelFriendRequest = useCallback((userId: string): ActionResult => {
    if (!state.sentFriendRequestIds.includes(userId)) return { ok: false, error: 'Lời mời này không còn ở trạng thái chờ.' };
    setState((current) => ({ ...current, sentFriendRequestIds: current.sentFriendRequestIds.filter((idValue) => idValue !== userId) }));
    notify('Đã hủy lời mời kết bạn.');
    return { ok: true };
  }, [notify, state.sentFriendRequestIds]);

  const acceptFriendRequest = useCallback((userId: string): ActionResult => {
    if (!state.currentUser) return { ok: false, error: 'Bạn chưa đăng nhập.' };
    if (state.blockedUsers.some((user) => user.id === userId)) return { ok: false, error: 'Người dùng này đang bị chặn.' };
    if (!state.receivedFriendRequestIds.includes(userId)) return { ok: false, error: 'Lời mời này không còn tồn tại.' };
    const user = state.users.find((item) => item.id === userId);
    setState((current) => current.receivedFriendRequestIds.includes(userId) ? ({
      ...current,
      friendIds: current.friendIds.includes(userId) ? current.friendIds : [...current.friendIds, userId],
      sentFriendRequestIds: current.sentFriendRequestIds.filter((idValue) => idValue !== userId),
      receivedFriendRequestIds: current.receivedFriendRequestIds.filter((idValue) => idValue !== userId),
      users: current.users.map((item) => item.id === userId
        ? { ...item, friendIds: item.friendIds.includes(current.profile.id) ? item.friendIds : [...item.friendIds, current.profile.id] }
        : item.id === current.profile.id
          ? { ...item, friendIds: item.friendIds.includes(userId) ? item.friendIds : [...item.friendIds, userId] }
          : item),
      notifications: user && current.notificationsEnabled ? [{
        id: id('notification'), type: 'friend_accepted', title: `Bạn và ${user.name} đã trở thành bạn bè`,
        description: 'Hai bạn có thể tiếp tục gặp nhau trong các meetup chung.', createdAt: new Date().toISOString(), read: false, userId,
      }, ...current.notifications] : current.notifications,
    }) : current);
    notify(`Đã chấp nhận lời mời của ${user?.name ?? 'người dùng'}.`);
    return { ok: true };
  }, [notify, state.blockedUsers, state.currentUser, state.receivedFriendRequestIds, state.users]);

  const rejectFriendRequest = useCallback((userId: string): ActionResult => {
    if (!state.receivedFriendRequestIds.includes(userId)) return { ok: false, error: 'Lời mời này không còn tồn tại.' };
    setState((current) => ({ ...current, receivedFriendRequestIds: current.receivedFriendRequestIds.filter((idValue) => idValue !== userId) }));
    notify('Đã từ chối lời mời kết bạn.');
    return { ok: true };
  }, [notify, state.receivedFriendRequestIds]);

  const unfriendUser = useCallback((userId: string): ActionResult => {
    if (!state.friendIds.includes(userId)) return { ok: false, error: 'Hai bạn hiện không phải bạn bè.' };
    setState((current) => current.blockedUsers.some((item) => item.id === userId) ? current : ({
      ...current,
      friendIds: current.friendIds.filter((idValue) => idValue !== userId),
      users: current.users.map((user) => user.id === userId
        ? { ...user, friendIds: user.friendIds.filter((idValue) => idValue !== current.profile.id) }
        : user.id === current.profile.id
          ? { ...user, friendIds: user.friendIds.filter((idValue) => idValue !== userId) }
          : user),
    }));
    notify('Đã hủy kết bạn.');
    return { ok: true };
  }, [notify, state.friendIds]);

  const blockUser = useCallback((userId: string): ActionResult => {
    if (!state.currentUser) return { ok: false, error: 'Bạn chưa đăng nhập.' };
    if (userId === state.currentUser.id) return { ok: false, error: 'Bạn không thể chặn chính mình.' };
    const user = state.users.find((item) => item.id === userId);
    if (!user) return { ok: false, error: 'Không tìm thấy người dùng.' };
    if (state.blockedUsers.some((item) => item.id === userId)) return { ok: true };
    setState((current) => ({
      ...current,
      friendIds: current.friendIds.filter((idValue) => idValue !== userId),
      sentFriendRequestIds: current.sentFriendRequestIds.filter((idValue) => idValue !== userId),
      receivedFriendRequestIds: current.receivedFriendRequestIds.filter((idValue) => idValue !== userId),
      blockedUsers: [...current.blockedUsers, user],
      users: current.users.map((item) => item.id === userId
        ? { ...item, friendIds: item.friendIds.filter((idValue) => idValue !== current.profile.id) }
        : item.id === current.profile.id
          ? { ...item, friendIds: item.friendIds.filter((idValue) => idValue !== userId) }
          : item),
    }));
    notify(`Đã chặn ${user.name}.`);
    return { ok: true };
  }, [notify, state.blockedUsers, state.currentUser, state.users]);

  const markNotificationRead = useCallback((notificationId: string) => setState((current) => ({
    ...current,
    notifications: current.notifications.map((notification) => notification.id === notificationId ? { ...notification, read: true } : notification),
  })), []);

  const markAllNotificationsRead = useCallback(() => setState((current) => ({
    ...current,
    notifications: current.notifications.map((notification) => ({ ...notification, read: true })),
  })), []);

  const resetDemoData = useCallback(() => {
    setState((current) => {
      const seed = createSeedState();
      return current.currentUser ? { ...seed, currentUser: seed.profile } : seed;
    });
    notify('Đã khôi phục dữ liệu demo ban đầu.');
  }, [notify]);

  const joinMeetup = useCallback((meetupId: string): ActionResult => {
    if (!state.currentUser) return { ok: false, error: 'Vui lòng đăng nhập để tham gia.' };
    const meetup = state.meetups.find((item) => item.id === meetupId);
    if (!meetup) return { ok: false, error: 'Không tìm thấy meetup.' };
    if (meetup.participants.some((user) => user.id === state.currentUser?.id)) return { ok: true };
    if (meetup.participants.length >= meetup.maxParticipants) return { ok: false, error: 'Meetup đã đủ người.' };
    const deposit = meetup.depositAmount ?? 0;
    setState((current) => {
      const user = current.currentUser;
      if (!user) return current;
      const meetups = current.meetups.map((item) => {
        if (item.id !== meetupId) return item;
        const shares = [...(item.billShares ?? [])];
        if (item.billTotal && item.billTotal > 0) {
          const per = Math.round(item.billTotal / (item.participants.length + 1));
          shares.push({ userId: user.id, amount: per, paid: false, checkedIn: false });
        }
        return { ...item, participants: [...item.participants, user], billShares: shares };
      });
      const hasRoom = current.chats.some((room) => room.meetupId === meetupId);
      const chats = hasRoom ? current.chats.map((room) => room.meetupId === meetupId ? {
        ...room, messages: [...room.messages, { id: id('msg'), type: 'system' as const, senderId: 'system', senderName: 'ChillWithHomies', text: `${user.name} đã khóa cọc ${deposit > 0 ? `${deposit.toLocaleString('vi-VN')}đ` : '0đ'} và tham gia kèo.`, createdAt: new Date().toISOString() }],
      } : room) : [...current.chats, {
        meetupId, unread: 0, onlineCount: 1,
        messages: [{ id: id('msg'), type: 'system' as const, senderId: 'system', senderName: 'ChillWithHomies', text: `${user.name} đã tham gia nhóm.`, createdAt: new Date().toISOString() }],
      }];
      const notifications = current.notificationsEnabled ? [{
        id: id('notification'), type: 'meetup' as const, title: `Bạn đã được thêm vào kèo ${meetup.title}`,
        description: `${meetup.dateLabel}, ${meetup.time} tại ${meetup.location}. Cọc ${deposit.toLocaleString('vi-VN')}đ (demo).`, createdAt: new Date().toISOString(), read: false, meetupId,
      }, ...current.notifications] : current.notifications;
      return { ...current, meetups, chats, notifications };
    });
    notify(deposit > 0 ? `Đã khóa cọc demo ${deposit.toLocaleString('vi-VN')}đ. Hủy sát giờ sẽ mất cọc!` : 'Bạn đã tham gia meetup. Phòng chat đã sẵn sàng!');
    return { ok: true };
  }, [notify, state.currentUser, state.meetups]);

  const leaveMeetup = useCallback((meetupId: string): ActionResult => {
    if (!state.currentUser) return { ok: false, error: 'Bạn chưa đăng nhập.' };
    const meetup = state.meetups.find((item) => item.id === meetupId);
    if (!meetup) return { ok: false, error: 'Không tìm thấy meetup.' };
    if (meetup.hostId === state.currentUser.id) return { ok: false, error: 'Host không thể rời meetup của mình.' };
    const deposit = meetup.depositAmount ?? 0;
    setState((current) => ({
      ...current,
      meetups: current.meetups.map((item) => item.id === meetupId ? {
        ...item,
        participants: item.participants.filter((user) => user.id !== current.currentUser?.id),
        billShares: (item.billShares ?? []).filter((s) => s.userId !== current.currentUser?.id),
        checkedInIds: (item.checkedInIds ?? []).filter((v) => v !== current.currentUser?.id),
      } : item),
      chats: current.chats.map((room) => room.meetupId === meetupId ? {
        ...room, messages: [...room.messages, { id: id('msg'), type: 'system' as const, senderId: 'system', senderName: 'ChillWithHomies', text: `${current.currentUser?.name} đã rời kèo.${deposit > 0 ? ` Cọc ${deposit.toLocaleString('vi-VN')}đ được chia cho người ở lại (demo).` : ''}`, createdAt: new Date().toISOString() }],
      } : room),
      users: current.users.map((user) => user.id === current.currentUser?.id ? { ...user, ...applyNoShowPenalty(user) } : user),
    }));
    notify(deposit > 0 ? 'Bạn đã rời kèo và mất cọc demo cho quỹ chung.' : 'Bạn đã rời meetup.');
    return { ok: true };
  }, [notify, state.currentUser, state.meetups]);

  const emergencyLeave = useCallback((meetupId: string): ActionResult => {
    if (!state.currentUser) return { ok: false, error: 'Bạn chưa đăng nhập.' };
    const meetup = state.meetups.find((item) => item.id === meetupId);
    if (!meetup) return { ok: false, error: 'Không tìm thấy meetup.' };
    if (meetup.hostId === state.currentUser.id) return { ok: false, error: 'Host hãy chuyển host trước khi rời khẩn.' };
    setState((current) => ({
      ...current,
      meetups: current.meetups.map((item) => item.id === meetupId ? {
        ...item,
        participants: item.participants.filter((user) => user.id !== current.currentUser?.id),
        checkedInIds: (item.checkedInIds ?? []).filter((v) => v !== current.currentUser?.id),
      } : item),
      chats: current.chats.map((room) => room.meetupId === meetupId ? {
        ...room, messages: [...room.messages, { id: id('msg'), type: 'system' as const, senderId: 'system', senderName: 'ChillWithHomies', text: 'Một thành viên đã rời kèo vì lý do cá nhân. Cả nhóm tiếp tục vui vẻ nhé.', createdAt: new Date().toISOString() }],
      } : room),
    }));
    notify('Đã rời khẩn an toàn. Vị trí quán đã được gửi cho người thân (demo).');
    return { ok: true };
  }, [notify, state.currentUser, state.meetups]);

  const createMeetup = useCallback((draft: MeetupDraft) => {
    if (!state.currentUser) return null;
    if (!draft.ageConfirm) return null;
    const size = Math.min(12, Math.max(2, draft.maxParticipants));
    const depositAmount = draft.depositAmount ?? 0;
    const meetupId = `${draft.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 32) || 'meetup'}-${Date.now().toString(36)}`;
    const user = state.currentUser;
    const menuItems = draft.menuNote?.trim()
      ? draft.menuNote.split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 8).map((line) => {
        const match = line.match(/^(.+?)\s+(\d+)\s*k?$/i);
        return match ? { name: match[1].trim(), price: Number(match[2]) * 1000 } : { name: line.slice(0, 40), price: 0 };
      })
      : [];
    const image = draft.category.includes('Bia') || draft.category.includes('Nhậu') || draft.category.includes('Rooftop') ? 'rooftop' as const
      : draft.category.includes('ốc') || draft.category.includes('Lẩu') || draft.category.includes('Ăn') ? 'dinner' as const
      : draft.category.includes('Café') ? 'coffee' as const
      : draft.category.includes('Board') ? 'games' as const
      : draft.category.includes('Karaoke') ? 'karaoke' as const : 'rooftop' as const;
    setState((current) => ({
      ...current,
      meetups: [{
        id: meetupId, title: draft.title.trim(), category: draft.category, date: draft.date, dateLabel: meetupDateLabel(draft.date), time: draft.time,
        location: draft.location.trim(), district: draft.district?.trim() || 'TP. Hồ Chí Minh', distanceKm: 0, hostId: user.id, hostName: user.name,
        hostAvatar: user.id === 'user-minh-anh' ? 'profile-minh-anh' : user.username, hostAvatarColor: user.avatarColor, hostAvatarUri: user.avatarUri, hostVerified: !!user.verified,
        participants: [user], maxParticipants: size, vibe: draft.vibe, paymentType: draft.paymentType,
        description: draft.description.trim() || 'Host sẽ cập nhật thêm thông tin trước khi kèo nhậu bắt đầu.', status: 'upcoming', isPublic: draft.isPublic, image, color: '#F28C28',
        alcoholType: draft.alcoholType || 'Bia hơi', menuItems, billNote: draft.billNote?.trim() || undefined,
        drinkLimit: draft.drinkLimit || 'Tự lượng sức', age18Plus: true, mapQuery: `${draft.location.trim()} ${draft.district?.trim() || ''}`.trim(), tableBooked: false,
        depositAmount, billShares: [], checkedInIds: [user.id],
      }, ...current.meetups],
      chats: [{
        meetupId, unread: 0, onlineCount: 1,
        messages: [{ id: id('msg'), type: 'system', senderId: 'system', senderName: 'ChillWithHomies', text: `${user.name} đã tạo kèo nhậu. Nhớ 18+ và đã uống thì không lái xe nhé!`, createdAt: new Date().toISOString() }],
      }, ...current.chats],
    }));
    notify('Tạo kèo nhậu thành công 🎉');
    return meetupId;
  }, [notify, state.currentUser]);

  const appendMessage = useCallback((meetupId: string, create: (user: UserProfile) => ChatMessage): ActionResult => {
    if (!state.currentUser) return { ok: false, error: 'Bạn chưa đăng nhập.' };
    const meetup = state.meetups.find((item) => item.id === meetupId);
    const allowed = meetup && (meetup.hostId === state.currentUser.id || meetup.participants.some((user) => user.id === state.currentUser?.id));
    if (!allowed) return { ok: false, error: 'Bạn cần tham gia meetup trước khi nhắn tin.' };
    if (!state.chats.some((room) => room.meetupId === meetupId)) return { ok: false, error: 'Phòng chat chưa sẵn sàng.' };
    const next = create(state.currentUser);
    setState((current) => ({ ...current, chats: current.chats.map((room) => room.meetupId === meetupId ? { ...room, unread: 0, messages: [...room.messages, next] } : room) }));
    return { ok: true };
  }, [state.chats, state.currentUser, state.meetups]);

  const sendMessage = useCallback((meetupId: string, text: string) => {
    if (!text.trim()) return { ok: false, error: 'Tin nhắn không được để trống.' };
    return appendMessage(meetupId, (user) => ({
      id: id('msg'), type: 'text', senderId: user.id, senderName: user.name, text: text.trim(), createdAt: new Date().toISOString(),
    }));
  }, [appendMessage]);
  const sendLocation = useCallback((meetupId: string, location: { name: string; address: string }) => appendMessage(meetupId, (user) => ({
    id: id('msg'), type: 'location', senderId: user.id, senderName: user.name, text: `Đã gửi vị trí: ${location.name}`, location, createdAt: new Date().toISOString(),
  })), [appendMessage]);
  const sendEta = useCallback((meetupId: string, minutes: number) => appendMessage(meetupId, (user) => ({
    id: id('msg'), type: 'eta', senderId: user.id, senderName: user.name, text: `${user.name} sẽ tới sau khoảng ${minutes} phút.`, createdAt: new Date().toISOString(),
  })), [appendMessage]);
  const createPoll = useCallback((meetupId: string, question: string, options: string[]) => {
    const validOptions = options.map((option) => option.trim()).filter(Boolean);
    if (!question.trim() || validOptions.length < 2) return { ok: false, error: 'Bình chọn cần câu hỏi và ít nhất 2 lựa chọn.' };
    return appendMessage(meetupId, (user) => ({
      id: id('msg'), type: 'poll', senderId: user.id, senderName: user.name, text: question.trim(), createdAt: new Date().toISOString(),
      poll: { question: question.trim(), options: validOptions.map((label) => ({ id: id('option'), label, voterIds: [] })) },
    }));
  }, [appendMessage]);

  const votePoll = useCallback((meetupId: string, messageId: string, optionId: string) => {
    if (!state.currentUser) return;
    const userId = state.currentUser.id;
    setState((current) => ({ ...current, chats: current.chats.map((room) => room.meetupId !== meetupId ? room : {
      ...room,
      messages: room.messages.map((message) => message.id !== messageId || !message.poll ? message : {
        ...message,
        poll: { ...message.poll, options: message.poll.options.map((option) => ({
          ...option,
          voterIds: option.id === optionId
            ? option.voterIds.includes(userId) ? option.voterIds : [...option.voterIds, userId]
            : option.voterIds.filter((idValue) => idValue !== userId),
        })) },
      }),
    }) }));
  }, [state.currentUser]);

  const toggleTableBooked = useCallback((meetupId: string) => {
    setState((current) => ({
      ...current,
      meetups: current.meetups.map((item) => item.id === meetupId ? { ...item, tableBooked: !item.tableBooked } : item),
    }));
    notify('Đã cập nhật trạng thái đặt bàn.');
  }, [notify]);

  const sendBillNote = useCallback((meetupId: string, text: string) => {
    if (!text.trim()) return { ok: false, error: 'Nội dung chốt bill không được để trống.' };
    return appendMessage(meetupId, (user) => ({
      id: id('msg'), type: 'text', senderId: user.id, senderName: user.name, text: `🧾 Chốt bill: ${text.trim()}`, createdAt: new Date().toISOString(),
    }));
  }, [appendMessage]);

  const checkIn = useCallback((meetupId: string): ActionResult => {
    if (!state.currentUser) return { ok: false, error: 'Bạn chưa đăng nhập.' };
    const meetup = state.meetups.find((m) => m.id === meetupId);
    if (!meetup) return { ok: false, error: 'Không tìm thấy kèo.' };
    if (!(meetup.hostId === state.currentUser.id || meetup.participants.some((p) => p.id === state.currentUser?.id))) return { ok: false, error: 'Bạn cần tham gia kèo trước khi check-in.' };
    if ((meetup.checkedInIds ?? []).includes(state.currentUser.id)) return { ok: true };
    const user = state.currentUser;
    setState((current) => ({
      ...current,
      meetups: current.meetups.map((m) => m.id === meetupId ? { ...m, checkedInIds: [...(m.checkedInIds ?? []), user.id] } : m),
      chats: current.chats.map((room) => room.meetupId === meetupId ? {
        ...room, messages: [...room.messages, { id: id('msg'), type: 'system' as const, senderId: 'system', senderName: 'ChillWithHomies', text: `${user.name} đã check-in tại quán.`, createdAt: new Date().toISOString() }],
      } : room),
    }));
    notify('Check-in thành công. Bạn đã có mặt tại quán!');
    return { ok: true };
  }, [notify, state.currentUser, state.meetups]);

  const setBillTotal = useCallback((meetupId: string, total: number): ActionResult => {
    if (!state.currentUser) return { ok: false, error: 'Bạn chưa đăng nhập.' };
    const currentUser = state.currentUser;
    const meetup = state.meetups.find((m) => m.id === meetupId);
    if (!meetup) return { ok: false, error: 'Không tìm thấy kèo.' };
    if (meetup.hostId !== state.currentUser.id) return { ok: false, error: 'Chỉ host mới được chốt tổng bill.' };
    if (!Number.isFinite(total) || total <= 0) return { ok: false, error: 'Tổng bill phải lớn hơn 0.' };
    const rounded = Math.round(total);
    const shares = splitBillEqually(rounded, meetup.participants.map((participant) => participant.id));
    setState((current) => ({
      ...current,
      meetups: current.meetups.map((m) => m.id === meetupId ? {
        ...m, billTotal: rounded,
        billShares: shares.map((s) => {
          const old = (m.billShares ?? []).find((o) => o.userId === s.userId);
          return { ...s, paid: old?.paid ?? false, checkedIn: (m.checkedInIds ?? []).includes(s.userId) };
        }),
      } : m),
      chats: current.chats.map((room) => room.meetupId === meetupId ? {
        ...room, messages: [...room.messages, { id: id('msg'), type: 'text' as const, senderId: currentUser.id, senderName: currentUser.name, text: `🧾 Host đã chốt bill ${rounded.toLocaleString('vi-VN')}đ — mỗi người ~${Math.round(rounded / Math.max(1, meetup.participants.length)).toLocaleString('vi-VN')}đ (đã trừ cọc demo khi xác nhận).`, createdAt: new Date().toISOString() }],
      } : room),
    }));
    notify(`Đã chốt bill ${rounded.toLocaleString('vi-VN')}đ, chia đều cho cả bàn.`);
    return { ok: true };
  }, [notify, state.currentUser, state.meetups]);

  const markMyPayment = useCallback((meetupId: string): ActionResult => {
    if (!state.currentUser) return { ok: false, error: 'Bạn chưa đăng nhập.' };
    const currentUser = state.currentUser;
    const meetup = state.meetups.find((m) => m.id === meetupId);
    if (!meetup?.billTotal) return { ok: false, error: 'Host chưa chốt bill.' };
    const me = state.currentUser.id;
    setState((current) => ({
      ...current,
      chats: current.chats.map((room) => room.meetupId === meetupId ? {
        ...room, messages: [...room.messages, { id: id('msg'), type: 'text' as const, senderId: me, senderName: currentUser.name, text: '✅ Tôi đã chuyển tiền bill, host xác nhận giúp nhé!', createdAt: new Date().toISOString() }],
      } : room),
    }));
    notify('Đã báo đã trả. Chờ host xác nhận.');
    return { ok: true };
  }, [notify, state.currentUser, state.meetups]);

  const confirmPayment = useCallback((meetupId: string, userId: string): ActionResult => {
    if (!state.currentUser) return { ok: false, error: 'Bạn chưa đăng nhập.' };
    const meetup = state.meetups.find((m) => m.id === meetupId);
    if (!meetup) return { ok: false, error: 'Không tìm thấy kèo.' };
    if (meetup.hostId !== state.currentUser.id) return { ok: false, error: 'Chỉ host mới xác nhận thanh toán.' };
    setState((current) => ({
      ...current,
      meetups: current.meetups.map((m) => m.id === meetupId ? {
        ...m, billShares: (m.billShares ?? []).map((s) => s.userId === userId ? { ...s, paid: true } : s),
      } : m),
      chats: current.chats.map((room) => room.meetupId === meetupId ? {
        ...room, messages: [...room.messages, { id: id('msg'), type: 'system' as const, senderId: 'system', senderName: 'ChillWithHomies', text: `Host đã xác nhận thanh toán của thành viên.`, createdAt: new Date().toISOString() }],
      } : room),
      users: current.users.map((user) => user.id === userId ? { ...user, ...applyCompletedMeetupReward(user) } : user),
    }));
    notify('Đã xác nhận thanh toán.');
    return { ok: true };
  }, [notify, state.currentUser, state.meetups]);

  const sendSafetySignal = useCallback((meetupId: string, kind: 'grab' | 'sos'): ActionResult => {
    if (!state.currentUser) return { ok: false, error: 'Bạn chưa đăng nhập.' };
    const meetup = state.meetups.find((m) => m.id === meetupId);
    if (!meetup) return { ok: false, error: 'Không tìm thấy kèo.' };
    const text = kind === 'grab'
      ? `🚕 ${state.currentUser.name} cần về chung — ai tiện đường ghép Grab nhé! Đã uống không lái xe.`
      : `🆘 ${state.currentUser.name} cần hỗ trợ — vị trí: ${meetup.location}, ${meetup.district}. Người thân đã được báo (demo).`;
    const res = appendMessage(meetupId, (user) => ({
      id: id('msg'), type: 'text', senderId: user.id, senderName: user.name, text, createdAt: new Date().toISOString(),
    }));
    if (!res.ok) return res;
    notify(kind === 'grab' ? 'Demo: đã gửi yêu cầu Grab về chung cho cả bàn!' : 'Demo: đã gửi SOS + vị trí quán cho người thân!');
    return { ok: true };
  }, [appendMessage, notify, state.currentUser, state.meetups]);

  const markRoomRead = useCallback((meetupId: string) => setState((current) => ({ ...current, chats: current.chats.map((room) => room.meetupId === meetupId ? { ...room, unread: 0 } : room) })), []);

  const ensureChatRoom = useCallback((meetupId: string): ActionResult => {
    if (!state.currentUser) return { ok: false, error: 'Bạn chưa đăng nhập.' };
    const meetup = state.meetups.find((item) => item.id === meetupId);
    if (!meetup) return { ok: false, error: 'Không tìm thấy meetup.' };
    const allowed = meetup.hostId === state.currentUser.id || meetup.participants.some((user) => user.id === state.currentUser?.id);
    if (!allowed) return { ok: false, error: 'Bạn cần tham gia meetup trước khi mở chat.' };
    if (state.chats.some((room) => room.meetupId === meetupId)) return { ok: true };
    const user = state.currentUser;
    setState((current) => current.chats.some((room) => room.meetupId === meetupId) ? current : {
      ...current,
      chats: [...current.chats, {
        meetupId,
        unread: 0,
        onlineCount: 1,
        messages: [{ id: id('msg'), type: 'system', senderId: 'system', senderName: 'ChillWithHomies', text: `Phòng chat của ${user.name} đã sẵn sàng.`, createdAt: new Date().toISOString() }],
      }],
    });
    return { ok: true };
  }, [state.chats, state.currentUser, state.meetups]);

  const value = useMemo<DemoAppContextValue>(() => ({
    state, hydrated, toast, dismissToast, notify, signIn, completeSignUp, signOut, updateProfile, updateInterests,
    setNotificationsEnabled, unblockUser, sendFriendRequest, cancelFriendRequest, acceptFriendRequest,
    rejectFriendRequest, unfriendUser, blockUser, markNotificationRead, markAllNotificationsRead,
    resetDemoData, joinMeetup, leaveMeetup, emergencyLeave, createMeetup, toggleTableBooked, sendBillNote,
    checkIn, setBillTotal, markMyPayment, confirmPayment, sendSafetySignal,
    sendMessage, sendLocation, sendEta, createPoll, votePoll, markRoomRead, ensureChatRoom,
  }), [state, hydrated, toast, dismissToast, notify, signIn, completeSignUp, signOut, updateProfile, updateInterests,
    setNotificationsEnabled, unblockUser, sendFriendRequest, cancelFriendRequest, acceptFriendRequest,
    rejectFriendRequest, unfriendUser, blockUser, markNotificationRead, markAllNotificationsRead,
    resetDemoData, joinMeetup, leaveMeetup, emergencyLeave, createMeetup, toggleTableBooked, sendBillNote, checkIn, setBillTotal, markMyPayment, confirmPayment, sendSafetySignal, sendMessage, sendLocation, sendEta, createPoll,
    votePoll, markRoomRead, ensureChatRoom]);

  return <DemoAppContext.Provider value={value}>{children}</DemoAppContext.Provider>;
}

export function useDemoApp() {
  const value = useContext(DemoAppContext);
  if (!value) throw new Error('useDemoApp must be used inside DemoAppProvider');
  return value;
}
