import { meetupDateLabel } from '@/src/features/sessions/services/session-rules';
import type { Meetup, MeetupDraft } from '@/src/features/sessions/types';
import type { UserProfile } from '@/src/features/profile/types';

function slugifyTitle(title: string) {
  return (
    title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 32) || 'meetup'
  );
}

function menuItemsFromNote(menuNote?: string) {
  if (!menuNote?.trim()) return [];
  return menuNote
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8)
    .map((line) => {
      const match = line.match(/^(.+?)\s+(\d+)\s*k?$/i);
      return match ? { name: match[1].trim(), price: Number(match[2]) * 1000 } : { name: line.slice(0, 40), price: 0 };
    });
}

function coverForCategory(category: string): Meetup['image'] {
  if (category.includes('Bia') || category.includes('Nhậu') || category.includes('Rooftop')) return 'rooftop';
  if (category.includes('ốc') || category.includes('Lẩu') || category.includes('Ăn')) return 'dinner';
  if (category.includes('Café')) return 'coffee';
  if (category.includes('Board')) return 'games';
  if (category.includes('Karaoke')) return 'karaoke';
  return 'rooftop';
}

export function buildMeetupId(title: string) {
  return `${slugifyTitle(title)}-${Date.now().toString(36)}`;
}

export function buildMeetupFromDraft(draft: MeetupDraft, user: UserProfile, meetupId: string): Meetup {
  const size = Math.min(12, Math.max(2, draft.maxParticipants));
  return {
    id: meetupId,
    title: draft.title.trim(),
    category: draft.category,
    date: draft.date,
    dateLabel: meetupDateLabel(draft.date),
    time: draft.time,
    location: draft.location.trim(),
    district: draft.district?.trim() || 'TP. Hồ Chí Minh',
    distanceKm: 0,
    hostId: user.id,
    hostName: user.name,
    hostAvatar: user.id === 'user-minh-anh' ? 'profile-minh-anh' : user.username,
    hostAvatarColor: user.avatarColor,
    hostAvatarUri: user.avatarUri,
    hostVerified: !!user.verified,
    participants: [user],
    maxParticipants: size,
    vibe: draft.vibe,
    paymentType: draft.paymentType,
    description: draft.description.trim() || 'Host sẽ cập nhật thêm thông tin trước khi kèo nhậu bắt đầu.',
    status: 'upcoming',
    isPublic: draft.isPublic,
    image: coverForCategory(draft.category),
    color: '#F28C28',
    alcoholType: draft.alcoholType || 'Bia hơi',
    menuItems: menuItemsFromNote(draft.menuNote),
    billNote: draft.billNote?.trim() || undefined,
    drinkLimit: draft.drinkLimit || 'Tự lượng sức',
    age18Plus: true,
    mapQuery: `${draft.location.trim()} ${draft.district?.trim() || ''}`.trim(),
    tableBooked: false,
    depositAmount: draft.depositAmount ?? 0,
    billShares: [],
    checkedInIds: [user.id],
  };
}
