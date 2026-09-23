import { createId } from '@/src/shared/utils/ids';
import type { ChatMessage } from '@/src/features/chat/types';
import type { UserProfile } from '@/src/features/profile/types';

export function buildSystemMessage(text: string): ChatMessage {
  return {
    id: createId('msg'),
    type: 'system',
    senderId: 'system',
    senderName: 'ChillWithHomies',
    text,
    createdAt: new Date().toISOString(),
  };
}

export function buildTextMessage(user: UserProfile, text: string): ChatMessage {
  return {
    id: createId('msg'),
    type: 'text',
    senderId: user.id,
    senderName: user.name,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
}

export function buildLocationMessage(
  user: UserProfile,
  location: { name: string; address: string },
): ChatMessage {
  return {
    id: createId('msg'),
    type: 'location',
    senderId: user.id,
    senderName: user.name,
    text: `Đã gửi vị trí: ${location.name}`,
    location,
    createdAt: new Date().toISOString(),
  };
}

export function buildEtaMessage(user: UserProfile, minutes: number): ChatMessage {
  return {
    id: createId('msg'),
    type: 'eta',
    senderId: user.id,
    senderName: user.name,
    text: `${user.name} sẽ tới sau khoảng ${minutes} phút.`,
    createdAt: new Date().toISOString(),
  };
}

export function buildPollMessage(user: UserProfile, question: string, options: string[]): ChatMessage | null {
  const validOptions = options.map((option) => option.trim()).filter(Boolean);
  if (!question.trim() || validOptions.length < 2) return null;
  return {
    id: createId('msg'),
    type: 'poll',
    senderId: user.id,
    senderName: user.name,
    text: question.trim(),
    createdAt: new Date().toISOString(),
    poll: {
      question: question.trim(),
      options: validOptions.map((label) => ({ id: createId('option'), label, voterIds: [] })),
    },
  };
}
