import { describe, expect, it } from 'vitest';
import { splitBillEqually, filterAndSortMeetups, formatVND } from '@/src/features/sessions/services/session-rules';
import type { Meetup } from '@/src/features/sessions/types';

function makeMeetup(overrides: Partial<Meetup> = {}): Meetup {
  return {
    id: 'test',
    title: 'Rooftop bia',
    category: 'Rooftop bia',
    date: '2026-09-23',
    dateLabel: 'Tối nay',
    time: '19:30',
    location: 'Quán demo',
    district: 'Quận 1',
    distanceKm: 1,
    hostId: 'host-1',
    hostName: 'Host',
    participants: [],
    maxParticipants: 6,
    vibe: ['Chill'],
    paymentType: 'Chia đều (Campuchia)',
    description: 'demo',
    status: 'upcoming',
    isPublic: true,
    image: 'rooftop',
    color: '#F28C28',
    ...overrides,
  } as Meetup;
}

describe('splitBillEqually', () => {
  it('chia đều và phân bổ phần dư cho người đầu', () => {
    const shares = splitBillEqually(100000, ['a', 'b', 'c']);
    expect(shares.map((s) => s.amount).reduce((sum, v) => sum + v, 0)).toBe(100000);
    expect(shares[0].amount - shares[2].amount).toBeLessThanOrEqual(1);
  });

  it('trả rỗng khi total không hợp lệ', () => {
    expect(splitBillEqually(0, ['a'])).toEqual([]);
    expect(splitBillEqually(100, [])).toEqual([]);
  });
});

describe('filterAndSortMeetups', () => {
  it('lọc theo từ khóa không dấu', () => {
    const meetups = [makeMeetup({ title: 'Rooftop bia' }), makeMeetup({ title: 'Quán ốc', category: 'Quán ốc' })];
    expect(filterAndSortMeetups(meetups, 'rooftop', ['Tất cả'])).toHaveLength(1);
    expect(filterAndSortMeetups(meetups, 'quan oc', ['Tất cả'])).toHaveLength(1);
  });
});

describe('formatVND', () => {
  it('định dạng tiền Việt', () => {
    expect(formatVND(50000)).toContain('50.000');
  });
});
