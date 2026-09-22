import { useDemoApp } from '@/context/demo-app-context';

export function useChatList() {
  const { state, hydrated, markRoomRead } = useDemoApp();
  return {
    state: {
      currentUser: state.currentUser,
      chats: state.chats,
      meetups: state.meetups,
      blockedUsers: state.blockedUsers,
    },
    hydrated,
    markRoomRead,
  };
}
