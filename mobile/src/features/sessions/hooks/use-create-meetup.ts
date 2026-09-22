import { useDemoApp } from '@/context/demo-app-context';

export function useCreateMeetup() {
  const { createMeetup, notify } = useDemoApp();
  return { createMeetup, notify };
}
