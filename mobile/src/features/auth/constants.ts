import type { SignupDraft, SignupStep } from '@/src/features/auth/types';

export const DEMO_OTP = '123456';
export const SIGNUP_INTERESTS = ['Nhậu', 'Bia', 'Quán ốc', 'Rooftop', 'Lẩu nướng', 'Café', 'Board game', 'Karaoke', 'Nhóm nhỏ', 'Networking', 'Chạy bộ', 'Workshop'] as const;
export const SIGNUP_VIBES = ['Chill', 'Vui vẻ', 'Nhậu', 'Nhóm nhỏ', 'Làm quen người mới', 'Uống có trách nhiệm'] as const;
export const AVATAR_COLORS = ['#F28C28', '#E88F9C', '#7C9A65', '#668CB8', '#B583A7', '#D07A72'] as const;
export const SIGNUP_STEP_NUMBER: Record<Exclude<SignupStep, 'complete'>, number> = { account: 1, verify: 2, profile: 3, interests: 4, safety: 5 };

export function createInitialSignupDraft(): SignupDraft {
  return {
    step: 'account',
    phone: '',
    phoneVerified: false,
    name: '',
    username: '',
    dateOfBirth: '',
    city: 'TP. Hồ Chí Minh',
    bio: '',
    avatarColor: AVATAR_COLORS[0],
    interests: [],
    preferredVibes: ['Chill'],
    acceptedTerms: false,
    acceptedPrivacy: false,
    notificationsEnabled: true,
  };
}
