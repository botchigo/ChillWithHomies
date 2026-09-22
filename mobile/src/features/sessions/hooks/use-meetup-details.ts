import { useDemoApp } from '@/context/demo-app-context';

export function useMeetupDetails(meetupId?: string | string[]) {
  const {
    state,
    hydrated,
    joinMeetup,
    leaveMeetup,
    toggleTableBooked,
    checkIn,
    setBillTotal,
    markMyPayment,
    confirmPayment,
    notify,
  } = useDemoApp();
  const id = Array.isArray(meetupId) ? meetupId[0] : meetupId;
  const meetup = state.meetups.find((item) => item.id === id);
  const host = meetup ? state.users.find((user) => user.id === meetup.hostId) : undefined;

  return {
    hydrated,
    currentUser: state.currentUser,
    meetup,
    host,
    joinMeetup,
    leaveMeetup,
    toggleTableBooked,
    checkIn,
    setBillTotal,
    markMyPayment,
    confirmPayment,
    notify,
  };
}
