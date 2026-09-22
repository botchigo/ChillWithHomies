import type { ChatRoom } from '@/src/features/chat/types';
import type { DemoNotification } from '@/src/features/notifications/types';
import type { DemoUser, Review, UserProfile } from '@/src/features/profile/types';
import type { BlockedUser } from '@/src/features/safety/types';
import type { Meetup } from '@/src/features/sessions/types';

export type DemoAppState = {
  version: 3;
  currentUser: UserProfile | null;
  profile: UserProfile;
  meetups: Meetup[];
  chats: ChatRoom[];
  reviews: Review[];
  users: DemoUser[];
  friendIds: string[];
  sentFriendRequestIds: string[];
  receivedFriendRequestIds: string[];
  blockedUsers: BlockedUser[];
  notifications: DemoNotification[];
  notificationsEnabled: boolean;
};
