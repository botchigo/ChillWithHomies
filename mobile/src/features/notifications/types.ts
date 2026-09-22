export type NotificationType = 'friend_request' | 'friend_accepted' | 'meetup' | 'chat';

export type DemoNotification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  userId?: string;
  meetupId?: string;
};
