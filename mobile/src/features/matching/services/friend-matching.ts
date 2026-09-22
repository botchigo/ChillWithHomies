import type { DemoUser, UserProfile } from '@/src/features/profile/types';
import type { Meetup } from '@/src/features/sessions/types';

export type FriendMatchingContext = {
  profile: Pick<UserProfile, 'id' | 'interests'>;
  meetups: Meetup[];
  friendIds: string[];
};

export function countCommonMeetups(userId: string, context: FriendMatchingContext) {
  return context.meetups.filter((meetup) => meetup.participants.some((person) => person.id === context.profile.id)
    && meetup.participants.some((person) => person.id === userId)).length;
}

export function countMutualFriends(user: DemoUser, friendIds: string[]) {
  return user.friendIds.filter((friendId) => friendIds.includes(friendId)).length;
}

export function countSharedInterests(user: DemoUser, context: FriendMatchingContext) {
  return user.interests.filter((interest) => context.profile.interests.includes(interest)).length;
}

export function calculateFriendSuggestionScore(user: DemoUser, context: FriendMatchingContext) {
  return countCommonMeetups(user.id, context) * 3
    + countMutualFriends(user, context.friendIds) * 2
    + countSharedInterests(user, context);
}

export function describeFriendRelationship(user: DemoUser, friendIds: string[]) {
  const mutual = countMutualFriends(user, friendIds);
  return mutual ? `${mutual} bạn chung` : `@${user.username}`;
}

export function describeFriendRequest(user: DemoUser, context: FriendMatchingContext) {
  const meetups = countCommonMeetups(user.id, context);
  return meetups ? `${meetups} meetup chung` : `${countSharedInterests(user, context)} sở thích chung`;
}

export function describeFriendSuggestion(user: DemoUser, context: FriendMatchingContext) {
  const mutual = countMutualFriends(user, context.friendIds);
  const meetups = countCommonMeetups(user.id, context);
  if (mutual) return `${mutual} bạn chung · ${meetups} meetup chung`;
  if (meetups) return `${meetups} meetup chung`;
  const interests = countSharedInterests(user, context);
  return interests ? `${interests} sở thích chung` : `Cùng ở ${user.city}`;
}
