import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { createSeedState, meetupDateLabel, type ChatMessage, type DemoAppState, type MeetupDraft, type UserProfile } from '@/data/demo-data';

const STORAGE_KEY = '@chillwithhomies/demo-state-v1';
type Result = { ok: boolean; error?: string };
type CompleteSignUpInput = {
  phone: string;
  name: string;
  username: string;
  dateOfBirth: string;
  city: string;
  bio: string;
  avatarColor: string;
  avatarUri?: string;
  interests: string[];
  preferredVibes: string[];
  notificationsEnabled: boolean;
};

type DemoAppContextValue = {
  state: DemoAppState;
  hydrated: boolean;
  toast: string;
  dismissToast: () => void;
  notify: (message: string) => void;
  signIn: (phone: string, password: string) => Result;
  completeSignUp: (input: CompleteSignUpInput) => Result;
  signOut: () => void;
  updateProfile: (input: Pick<UserProfile, 'name' | 'username' | 'bio' | 'city'>) => void;
  updateInterests: (interests: string[]) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  unblockUser: (userId: string) => void;
  sendFriendRequest: (userId: string) => Result;
  cancelFriendRequest: (userId: string) => Result;
  acceptFriendRequest: (userId: string) => Result;
  rejectFriendRequest: (userId: string) => Result;
  unfriendUser: (userId: string) => Result;
  blockUser: (userId: string) => Result;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
  joinMeetup: (meetupId: string) => Result;
  leaveMeetup: (meetupId: string) => Result;
  createMeetup: (draft: MeetupDraft) => string | null;
  sendMessage: (meetupId: string, text: string) => Result;
  sendLocation: (meetupId: string, location: { name: string; address: string }) => Result;
  sendEta: (meetupId: string, minutes: number) => Result;
  createPoll: (meetupId: string, question: string, options: string[]) => Result;
  votePoll: (meetupId: string, messageId: string, optionId: string) => void;
  markRoomRead: (meetupId: string) => void;
  ensureChatRoom: (meetupId: string) => Result;
};

const DemoAppContext = createContext<DemoAppContextValue | null>(null);

const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const phoneValid = (value: string) => /^[0-9]{9,11}$/.test(value.replace(/\s/g, ''));
const vietnamPhoneValid = (value: string) => /^(?:\+84|84|0)(?:3|5|7|8|9)\d{8}$/.test(value.replace(/[\s.-]/g, ''));
const normalizeStoredDateOfBirth = (value: string) => {
  const legacy = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return legacy ? `${legacy[2]}-${legacy[3]}-${legacy[1]}` : value;
};
const adultDateOfBirthValid = (value: string) => {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(value)) return false;
  const [month, day, year] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return false;
  const today = new Date();
  const adultCutoff = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return date <= adultCutoff;
};

export function DemoAppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoAppState>(() => createSeedState());
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!alive || !raw) return;
        const parsed = JSON.parse(raw) as Partial<DemoAppState>;
        if (parsed.version === 1 && Array.isArray(parsed.meetups) && Array.isArray(parsed.chats)) {
          const seed = createSeedState();
          const storedProfile = parsed.profile ?? seed.profile;
          const profile: UserProfile = {
            ...seed.profile,
            ...storedProfile,
            dateOfBirth: normalizeStoredDateOfBirth(storedProfile.dateOfBirth || seed.profile.dateOfBirth),
            verifiedPhone: storedProfile.verifiedPhone ?? seed.profile.verifiedPhone,
            preferredVibes: Array.isArray(storedProfile.preferredVibes) ? storedProfile.preferredVibes : seed.profile.preferredVibes,
          };
          const users = Array.isArray(parsed.users) ? parsed.users : seed.users;
          const mergedUsers = users.map((user) => user.id === profile.id ? {
            ...user,
            name: profile.name,
            username: profile.username,
            bio: profile.bio,
            city: profile.city,
            interests: profile.interests,
          } : user);
          setState({
            ...seed,
            ...parsed,
            profile,
            currentUser: parsed.currentUser ? profile : null,
            meetups: parsed.meetups.map((meetup) => ({ ...meetup, isPublic: meetup.isPublic !== false })),
            chats: parsed.chats,
            users: mergedUsers,
            friendIds: Array.isArray(parsed.friendIds) ? parsed.friendIds : seed.friendIds,
            sentFriendRequestIds: Array.isArray(parsed.sentFriendRequestIds) ? parsed.sentFriendRequestIds : seed.sentFriendRequestIds,
            receivedFriendRequestIds: Array.isArray(parsed.receivedFriendRequestIds) ? parsed.receivedFriendRequestIds : seed.receivedFriendRequestIds,
            blockedUsers: Array.isArray(parsed.blockedUsers)
              ? parsed.blockedUsers.map((blocked) => mergedUsers.find((user) => user.id === blocked.id) ?? blocked)
              : seed.blockedUsers,
            notifications: Array.isArray(parsed.notifications) ? parsed.notifications : seed.notifications,
          });
        }
      })
      .catch(() => undefined)
      .finally(() => { if (alive) setHydrated(true); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => setToast('Không thể lưu dữ liệu demo trên thiết bị này.'));
  }, [hydrated, state]);

  const notify = useCallback((message: string) => setToast(message), []);
  const dismissToast = useCallback(() => setToast(''), []);

  const signIn = useCallback((phone: string, password: string): Result => {
    if (!phoneValid(phone)) return { ok: false, error: 'Số điện thoại cần có 9–11 chữ số.' };
    if (password.trim().length < 6) return { ok: false, error: 'Mật khẩu cần ít nhất 6 ký tự.' };
    setState((current) => {
      const profile = { ...current.profile, phone: phone.replace(/\s/g, '') };
      return { ...current, profile, currentUser: profile };
    });
    return { ok: true };
  }, []);

  const completeSignUp = useCallback((input: CompleteSignUpInput): Result => {
    const username = input.username.trim().replace(/^@/, '').toLowerCase();
    if (!vietnamPhoneValid(input.phone)) return { ok: false, error: 'Số điện thoại Việt Nam không hợp lệ.' };
    if (input.name.trim().length < 2) return { ok: false, error: 'Vui lòng nhập họ và tên.' };
    if (!/^[a-zA-Z0-9_.]{3,20}$/.test(username)) return { ok: false, error: 'Username cần 3–20 chữ, số, dấu chấm hoặc gạch dưới.' };
    if (state.users.some((user) => user.username.toLowerCase() === username)) return { ok: false, error: 'Username đã được sử dụng.' };
    if (!adultDateOfBirthValid(input.dateOfBirth)) return { ok: false, error: 'Ngày sinh không hợp lệ hoặc bạn chưa đủ 18 tuổi.' };
    if (!input.city.trim()) return { ok: false, error: 'Vui lòng nhập thành phố.' };
    if (input.interests.length < 3) return { ok: false, error: 'Vui lòng chọn ít nhất 3 sở thích.' };
    const userId = `user-${username}-${Date.now().toString(36)}`;
    const profile: UserProfile = {
      id: userId,
      name: input.name.trim(),
      username,
      phone: input.phone.replace(/[\s.-]/g, ''),
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

  const sendFriendRequest = useCallback((userId: string): Result => {
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

  const cancelFriendRequest = useCallback((userId: string): Result => {
    if (!state.sentFriendRequestIds.includes(userId)) return { ok: false, error: 'Lời mời này không còn ở trạng thái chờ.' };
    setState((current) => ({ ...current, sentFriendRequestIds: current.sentFriendRequestIds.filter((idValue) => idValue !== userId) }));
    notify('Đã hủy lời mời kết bạn.');
    return { ok: true };
  }, [notify, state.sentFriendRequestIds]);

  const acceptFriendRequest = useCallback((userId: string): Result => {
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

  const rejectFriendRequest = useCallback((userId: string): Result => {
    if (!state.receivedFriendRequestIds.includes(userId)) return { ok: false, error: 'Lời mời này không còn tồn tại.' };
    setState((current) => ({ ...current, receivedFriendRequestIds: current.receivedFriendRequestIds.filter((idValue) => idValue !== userId) }));
    notify('Đã từ chối lời mời kết bạn.');
    return { ok: true };
  }, [notify, state.receivedFriendRequestIds]);

  const unfriendUser = useCallback((userId: string): Result => {
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

  const blockUser = useCallback((userId: string): Result => {
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

  const joinMeetup = useCallback((meetupId: string): Result => {
    if (!state.currentUser) return { ok: false, error: 'Vui lòng đăng nhập để tham gia.' };
    const meetup = state.meetups.find((item) => item.id === meetupId);
    if (!meetup) return { ok: false, error: 'Không tìm thấy meetup.' };
    if (meetup.participants.some((user) => user.id === state.currentUser?.id)) return { ok: true };
    if (meetup.participants.length >= meetup.maxParticipants) return { ok: false, error: 'Meetup đã đủ người.' };
    setState((current) => {
      const user = current.currentUser!;
      const meetups = current.meetups.map((item) => item.id === meetupId ? { ...item, participants: [...item.participants, user] } : item);
      const hasRoom = current.chats.some((room) => room.meetupId === meetupId);
      const chats = hasRoom ? current.chats : [...current.chats, {
        meetupId, unread: 0, onlineCount: 1,
        messages: [{ id: id('msg'), type: 'system' as const, senderId: 'system', senderName: 'ChillWithHomies', text: `${user.name} đã tham gia nhóm.`, createdAt: new Date().toISOString() }],
      }];
      const notifications = current.notificationsEnabled ? [{
        id: id('notification'), type: 'meetup' as const, title: `Bạn đã được thêm vào kèo ${meetup.title}`,
        description: `${meetup.dateLabel}, ${meetup.time} tại ${meetup.location}.`, createdAt: new Date().toISOString(), read: false, meetupId,
      }, ...current.notifications] : current.notifications;
      return { ...current, meetups, chats, notifications };
    });
    notify('Bạn đã tham gia meetup. Phòng chat đã sẵn sàng!');
    return { ok: true };
  }, [notify, state.currentUser, state.meetups]);

  const leaveMeetup = useCallback((meetupId: string): Result => {
    if (!state.currentUser) return { ok: false, error: 'Bạn chưa đăng nhập.' };
    const meetup = state.meetups.find((item) => item.id === meetupId);
    if (!meetup) return { ok: false, error: 'Không tìm thấy meetup.' };
    if (meetup.hostId === state.currentUser.id) return { ok: false, error: 'Host không thể rời meetup của mình.' };
    setState((current) => ({
      ...current,
      meetups: current.meetups.map((item) => item.id === meetupId ? { ...item, participants: item.participants.filter((user) => user.id !== current.currentUser?.id) } : item),
    }));
    notify('Bạn đã rời meetup.');
    return { ok: true };
  }, [notify, state.currentUser, state.meetups]);

  const createMeetup = useCallback((draft: MeetupDraft) => {
    if (!state.currentUser) return null;
    const meetupId = `${draft.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 32) || 'meetup'}-${Date.now().toString(36)}`;
    const user = state.currentUser;
    setState((current) => ({
      ...current,
      meetups: [{
        id: meetupId, title: draft.title.trim(), category: draft.category, date: draft.date, dateLabel: meetupDateLabel(draft.date), time: draft.time,
        location: draft.location.trim(), district: 'TP. Hồ Chí Minh', distanceKm: 0, hostId: user.id, hostName: user.name,
        hostAvatar: user.id === 'user-minh-anh' ? 'profile-minh-anh' : user.username, hostAvatarColor: user.avatarColor, hostAvatarUri: user.avatarUri, hostVerified: !!user.verified,
        participants: [user], maxParticipants: draft.maxParticipants, vibe: draft.vibe, paymentType: draft.paymentType,
        description: draft.description.trim() || 'Host sẽ cập nhật thêm thông tin trước khi meetup bắt đầu.', status: 'upcoming', isPublic: draft.isPublic, image: 'rooftop', color: '#F28C28',
      }, ...current.meetups],
      chats: [{
        meetupId, unread: 0, onlineCount: 1,
        messages: [{ id: id('msg'), type: 'system', senderId: 'system', senderName: 'ChillWithHomies', text: `${user.name} đã tạo meetup. Hãy gửi lời chào đầu tiên!`, createdAt: new Date().toISOString() }],
      }, ...current.chats],
    }));
    notify('Tạo kèo thành công 🎉');
    return meetupId;
  }, [notify, state.currentUser]);

  const appendMessage = useCallback((meetupId: string, create: (user: UserProfile) => ChatMessage): Result => {
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

  const markRoomRead = useCallback((meetupId: string) => setState((current) => ({ ...current, chats: current.chats.map((room) => room.meetupId === meetupId ? { ...room, unread: 0 } : room) })), []);

  const ensureChatRoom = useCallback((meetupId: string): Result => {
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
    resetDemoData, joinMeetup, leaveMeetup, createMeetup,
    sendMessage, sendLocation, sendEta, createPoll, votePoll, markRoomRead, ensureChatRoom,
  }), [state, hydrated, toast, dismissToast, notify, signIn, completeSignUp, signOut, updateProfile, updateInterests,
    setNotificationsEnabled, unblockUser, sendFriendRequest, cancelFriendRequest, acceptFriendRequest,
    rejectFriendRequest, unfriendUser, blockUser, markNotificationRead, markAllNotificationsRead,
    resetDemoData, joinMeetup, leaveMeetup, createMeetup, sendMessage, sendLocation, sendEta, createPoll,
    votePoll, markRoomRead, ensureChatRoom]);

  return <DemoAppContext.Provider value={value}>{children}</DemoAppContext.Provider>;
}

export function useDemoApp() {
  const value = useContext(DemoAppContext);
  if (!value) throw new Error('useDemoApp must be used inside DemoAppProvider');
  return value;
}
