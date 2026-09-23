import { describe, expect, it } from 'vitest';
import { buildMeetupFromDraft, buildMeetupId } from '@/src/features/sessions/services/meetup-factory';
import { buildPollMessage, buildSystemMessage, buildTextMessage } from '@/src/features/chat/services/chat-factory';
import type { MeetupDraft } from '@/src/features/sessions/types';
import type { UserProfile } from '@/src/features/profile/types';

const user = { id: 'user-1', name: 'Minh Anh', username: 'minhanh', avatarColor: '#F28C28' } as UserProfile;

function makeDraft(overrides: Partial<MeetupDraft> = {}): MeetupDraft {
  return {
    title: 'Rooftop bia sau giờ làm',
    category: 'Rooftop bia',
    date: '2026-09-23',
    time: '19:30',
    location: 'Chạng Vạng Rooftop',
    district: 'Bình Thạnh',
    maxParticipants: 6,
    vibe: ['Chill'],
    paymentType: 'Chia đều (Campuchia)',
    description: '',
    isPublic: true,
    ageConfirm: true,
    ...overrides,
  } as MeetupDraft;
}

describe('meetup-factory', () => {
  it('build id ổn định dạng slug', () => {
    expect(buildMeetupId('Rooftop bia sau giờ làm')).toMatch(/^rooftop-bia-sau-gio-lam-/);
  });

  it('giới hạn 2-12 người và host tự check-in', () => {
    const meetup = buildMeetupFromDraft(makeDraft({ maxParticipants: 99 }), user, 'm-1');
    expect(meetup.maxParticipants).toBe(12);
    expect(meetup.participants).toEqual([user]);
    expect(meetup.checkedInIds).toEqual(['user-1']);
    expect(meetup.age18Plus).toBe(true);
  });
});

describe('chat-factory', () => {
  it('tạo system và text message đúng shape', () => {
    expect(buildSystemMessage('hello').senderId).toBe('system');
    expect(buildTextMessage(user, '  hi  ').text).toBe('hi');
  });

  it('poll cần ít nhất 2 options', () => {
    expect(buildPollMessage(user, 'Uống gì?', ['Bia'])).toBeNull();
    expect(buildPollMessage(user, 'Uống gì?', ['Bia', 'Soda'])?.poll?.options).toHaveLength(2);
  });
});
