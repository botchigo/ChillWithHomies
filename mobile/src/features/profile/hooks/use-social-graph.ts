import { useDemoApp } from '@/context/demo-app-context';

export function useSocialGraph() {
  const {
    state, hydrated, sendFriendRequest, cancelFriendRequest, acceptFriendRequest,
    rejectFriendRequest, unfriendUser, notify,
  } = useDemoApp();

  return {
    state: {
      currentUser: state.currentUser,
      profile: state.profile,
      users: state.users,
      meetups: state.meetups,
      friendIds: state.friendIds,
      sentFriendRequestIds: state.sentFriendRequestIds,
      receivedFriendRequestIds: state.receivedFriendRequestIds,
      blockedUsers: state.blockedUsers,
    },
    hydrated, sendFriendRequest, cancelFriendRequest, acceptFriendRequest,
    rejectFriendRequest, unfriendUser, notify,
  };
}
