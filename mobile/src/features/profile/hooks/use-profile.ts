import { useDemoApp } from '@/context/demo-app-context';

export function useProfile() {
  const {
    state, updateProfile, updateInterests, setNotificationsEnabled,
    resetDemoData, signOut, notify,
  } = useDemoApp();

  return {
    state: {
      profile: state.profile,
      users: state.users,
      meetups: state.meetups,
      reviews: state.reviews,
      friendIds: state.friendIds,
      receivedFriendRequestIds: state.receivedFriendRequestIds,
      blockedUsers: state.blockedUsers,
      notificationsEnabled: state.notificationsEnabled,
    },
    updateProfile, updateInterests, setNotificationsEnabled,
    resetDemoData, signOut, notify,
  };
}
