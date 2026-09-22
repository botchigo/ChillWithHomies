import { useDemoApp } from '@/context/demo-app-context';

export function useAuth() {
  const { state, hydrated, signIn, completeSignUp, signOut, notify } = useDemoApp();
  return {
    hydrated,
    currentUser: state.currentUser,
    users: state.users,
    signIn,
    completeSignUp,
    signOut,
    notify,
  };
}
