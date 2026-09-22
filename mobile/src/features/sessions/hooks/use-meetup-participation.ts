import { useDemoApp } from '@/context/demo-app-context';

export function useMeetupParticipation() {
  const { state, joinMeetup, leaveMeetup, notify } = useDemoApp();
  return {
    currentUserId: state.currentUser?.id,
    joinMeetup,
    leaveMeetup,
    notify,
  };
}
