import { useDemoApp } from '@/context/demo-app-context';

export function useSafety() {
  const { blockUser, unblockUser, emergencyLeave, sendSafetySignal, notify } = useDemoApp();
  return { blockUser, unblockUser, emergencyLeave, sendSafetySignal, notify };
}
