import AsyncStorage from '@react-native-async-storage/async-storage';

import { createSeedState } from '@/data/demo-data';
import { normalizeStoredDateOfBirth } from '@/src/features/auth/services/auth-validation';
import type { DemoAppState } from '@/src/shared/types/demo-app-state';

const STORAGE_KEY = '@chillwithhomies/demo-state-v3';
const SUPPORTED_VERSIONS = new Set([1, 2, 3]);

function isPersistedState(value: unknown): value is Partial<DemoAppState> & Pick<DemoAppState, 'meetups' | 'chats'> {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { version?: unknown; meetups?: unknown; chats?: unknown };
  return typeof candidate.version === 'number'
    && SUPPORTED_VERSIONS.has(candidate.version)
    && Array.isArray(candidate.meetups)
    && Array.isArray(candidate.chats);
}

export function migrateDemoState(parsed: Partial<DemoAppState> & Pick<DemoAppState, 'meetups' | 'chats'>): DemoAppState {
  const seed = createSeedState();
  const storedProfile = parsed.profile ?? seed.profile;
  const profile = {
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

  return {
    ...seed,
    ...parsed,
    version: 3,
    profile,
    currentUser: parsed.currentUser ? profile : null,
    meetups: parsed.meetups.map((meetup) => ({
      ...meetup,
      isPublic: meetup.isPublic !== false,
      age18Plus: meetup.age18Plus ?? false,
      tableBooked: meetup.tableBooked ?? false,
      menuItems: Array.isArray(meetup.menuItems) ? meetup.menuItems : [],
      depositAmount: meetup.depositAmount ?? 0,
      billShares: Array.isArray(meetup.billShares) ? meetup.billShares : [],
      checkedInIds: Array.isArray(meetup.checkedInIds) ? meetup.checkedInIds : [],
    })),
    chats: parsed.chats,
    users: mergedUsers,
    friendIds: Array.isArray(parsed.friendIds) ? parsed.friendIds : seed.friendIds,
    sentFriendRequestIds: Array.isArray(parsed.sentFriendRequestIds) ? parsed.sentFriendRequestIds : seed.sentFriendRequestIds,
    receivedFriendRequestIds: Array.isArray(parsed.receivedFriendRequestIds) ? parsed.receivedFriendRequestIds : seed.receivedFriendRequestIds,
    blockedUsers: Array.isArray(parsed.blockedUsers)
      ? parsed.blockedUsers.map((blocked) => mergedUsers.find((user) => user.id === blocked.id) ?? blocked)
      : seed.blockedUsers,
    notifications: Array.isArray(parsed.notifications) ? parsed.notifications : seed.notifications,
  };
}

export async function loadDemoState() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const parsed: unknown = JSON.parse(raw);
  if (!isPersistedState(parsed)) throw new Error('Unsupported or malformed persisted state');
  return migrateDemoState(parsed);
}

export function saveDemoState(state: DemoAppState) {
  return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
