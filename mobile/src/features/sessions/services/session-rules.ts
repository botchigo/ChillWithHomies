import type { BillShare, Meetup, MeetupSort } from '@/src/features/sessions/types';

function normalizeSearchTerm(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function localIsoDate(daysFromNow: number) {
  const value = new Date();
  value.setHours(12, 0, 0, 0);
  value.setDate(value.getDate() + daysFromNow);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateMeetupPreferenceScore(meetup: Meetup, interests: string[], preferredVibes: string[]) {
  const preferences = new Set([...interests, ...preferredVibes].map(normalizeSearchTerm));
  return [meetup.category, meetup.alcoholType ?? '', ...meetup.vibe]
    .reduce((score, value) => score + (value && preferences.has(normalizeSearchTerm(value)) ? 1 : 0), 0);
}

export function filterAndSortMeetups(meetups: Meetup[], query: string, filters: string[], sort: MeetupSort = 'Gần nhất') {
  const needle = normalizeSearchTerm(query);
  const filtered = meetups.filter((meetup) => {
    const menu = (meetup.menuItems ?? []).map((item) => item.name).join(' ');
    const haystack = normalizeSearchTerm(`${meetup.title} ${meetup.category} ${meetup.alcoholType ?? ''} ${meetup.location} ${meetup.district} ${meetup.vibe.join(' ')} ${menu}`);
    if (needle && !haystack.includes(needle)) return false;
    return filters.every((filter) => {
      if (filter === 'Tất cả') return true;
      if (filter === 'Tối nay') return meetup.dateLabel === 'Tối nay';
      if (filter === 'Gần đây') return meetup.distanceKm <= 3;
      if (filter === '2–4 người') return meetup.maxParticipants <= 4;
      const normalizedFilter = normalizeSearchTerm(filter);
      if (normalizedFilter === 'nhau') {
        return normalizeSearchTerm(meetup.category).includes('nhau')
          || meetup.vibe.some((value) => normalizeSearchTerm(value).includes('nhau'))
          || Boolean(meetup.alcoholType);
      }
      return normalizeSearchTerm(meetup.category) === normalizedFilter
        || normalizeSearchTerm(meetup.alcoholType ?? '') === normalizedFilter
        || meetup.vibe.some((value) => normalizeSearchTerm(value) === normalizedFilter);
    });
  });

  return [...filtered].sort((left, right) => {
    if (sort === 'Sắp diễn ra') return `${left.date}T${left.time}`.localeCompare(`${right.date}T${right.time}`);
    if (sort === 'Còn nhiều chỗ') return (right.maxParticipants - right.participants.length) - (left.maxParticipants - left.participants.length);
    return left.distanceKm - right.distanceKm;
  });
}

export function visibleMeetupsForUser(meetups: Meetup[], userId?: string) {
  return meetups.filter((meetup) => meetup.isPublic !== false
    || meetup.hostId === userId
    || meetup.participants.some((participant) => participant.id === userId));
}

export function meetupDateLabel(date: string) {
  if (date === localIsoDate(0)) return 'Tối nay';
  if (date === localIsoDate(1)) return 'Ngày mai';
  const value = new Date(`${date}T12:00:00`);
  return Number.isNaN(value.getTime()) ? 'Sắp tới' : value.toLocaleDateString('vi-VN', { weekday: 'long' });
}

export function formatDistance(distanceKm: number) {
  return `${distanceKm.toFixed(1).replace('.', ',')} km`;
}

export function formatVND(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

export function buildMapUrl(query?: string) {
  if (!query) return undefined;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${query}, TP. Hồ Chí Minh`)}`;
}

export function estimateBillPerPerson(meetup: Pick<Meetup, 'menuItems' | 'participants' | 'maxParticipants'>) {
  const total = (meetup.menuItems ?? []).reduce((sum, item) => sum + item.price, 0);
  if (!total) return null;
  const participantCount = Math.max(1, meetup.participants.length);
  return Math.round(total * (meetup.maxParticipants > 4 ? 1.5 : 1) / participantCount);
}

export function splitBillEqually(total: number, userIds: string[]): BillShare[] {
  if (!userIds.length || total <= 0) return [];
  const baseAmount = Math.floor(total / userIds.length);
  const remainder = total - baseAmount * userIds.length;
  return userIds.map((userId, index) => ({
    userId,
    amount: baseAmount + (index < remainder ? 1 : 0),
    paid: false,
    checkedIn: false,
  }));
}

export function getUnpaidShares(meetup: Pick<Meetup, 'billShares'>) {
  return (meetup.billShares ?? []).filter((share) => !share.paid);
}
