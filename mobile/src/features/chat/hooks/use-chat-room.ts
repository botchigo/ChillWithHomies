import { useDemoApp } from '@/context/demo-app-context';

export function useChatRoom(meetupId?: string) {
  const {
    state,
    hydrated,
    sendMessage,
    sendLocation,
    sendEta,
    createPoll,
    votePoll,
    markRoomRead,
    ensureChatRoom,
    sendBillNote,
    checkIn,
    setBillTotal,
    sendSafetySignal,
    notify,
  } = useDemoApp();
  const meetup = state.meetups.find((item) => item.id === meetupId);
  const room = state.chats.find((item) => item.meetupId === meetupId);
  const currentUser = state.currentUser;
  const allowed = Boolean(meetup && currentUser && (meetup.hostId === currentUser.id || meetup.participants.some((participant) => participant.id === currentUser.id)));

  return {
    hydrated,
    meetup,
    room,
    currentUser,
    allowed,
    blockedUserIds: new Set(state.blockedUsers.map((user) => user.id)),
    sendMessage,
    sendLocation,
    sendEta,
    createPoll,
    votePoll,
    markRoomRead,
    ensureChatRoom,
    sendBillNote,
    checkIn,
    setBillTotal,
    sendSafetySignal,
    notify,
  };
}
