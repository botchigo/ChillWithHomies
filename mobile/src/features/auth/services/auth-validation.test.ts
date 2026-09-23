import { describe, expect, it } from 'vitest';
import {
  isAdultDateOfBirth,
  isUsernameValid,
  isVietnamPhoneValid,
  normalizeUsername,
  validateCompleteSignUp,
} from '@/src/features/auth/services/auth-validation';

describe('auth-validation', () => {
  it('chấp nhận SĐT Việt Nam hợp lệ', () => {
    expect(isVietnamPhoneValid('0901234567')).toBe(true);
    expect(isVietnamPhoneValid('+84901234567')).toBe(true);
    expect(isVietnamPhoneValid('123')).toBe(false);
  });

  it('validate username 3-20 ký tự', () => {
    expect(isUsernameValid('minhanh')).toBe(true);
    expect(isUsernameValid('ab')).toBe(false);
    expect(normalizeUsername('@minhanh')).toBe('minhanh');
  });

  it('chặn user chưa đủ 18 tuổi', () => {
    expect(isAdultDateOfBirth('01-01-2000')).toBe(true);
    expect(isAdultDateOfBirth('01-01-2020')).toBe(false);
    expect(isAdultDateOfBirth('invalid')).toBe(false);
  });

  it('completeSignUp yêu cầu đủ sở thích', () => {
    const base = {
      phone: '0901234567',
      name: 'Minh Anh',
      username: 'minhanh_new',
      dateOfBirth: '05-18-1997',
      city: 'TP. Hồ Chí Minh',
      bio: '',
      interests: ['Nhậu'],
      preferredVibes: ['Chill'],
      avatarColor: '#F28C28',
      notificationsEnabled: true,
    };
    expect(validateCompleteSignUp(base, [])).toEqual({ ok: false, error: 'Vui lòng chọn ít nhất 3 sở thích.' });
    expect(validateCompleteSignUp({ ...base, interests: ['a', 'b', 'c'] }, [])).toEqual({ ok: true });
  });
});
