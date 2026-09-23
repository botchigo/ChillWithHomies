import { useDemoApp } from '@/context/demo-app-context';

export function useAuth() {
  const { state, hydrated, requestOtp, verifyOtp, completeSignUp, signOut, notify } = useDemoApp();
  return {
    hydrated,
    currentUser: state.currentUser,
    users: state.users,
    requestOtp,
    verifyOtp,
    completeSignUp,
    signOut,
    notify,
  };
}
