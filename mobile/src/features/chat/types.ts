export type PollOption = { id: string; label: string; voterIds: string[] };
export type MessageType = 'text' | 'location' | 'eta' | 'poll' | 'system';

export type ChatMessage = {
  id: string;
  type: MessageType;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  location?: { name: string; address: string };
  poll?: { question: string; options: PollOption[] };
};

export type ChatRoom = {
  meetupId: string;
  unread: number;
  onlineCount: number;
  messages: ChatMessage[];
};
