import { useDemoApp } from '@/context/demo-app-context';

export function useNotifications() {
  const { state, hydrated, markNotificationRead, markAllNotificationsRead } = useDemoApp();
  return {
    hydrated,
    currentUser: state.currentUser,
    notifications: state.notifications,
    markNotificationRead,
    markAllNotificationsRead,
  };
}
