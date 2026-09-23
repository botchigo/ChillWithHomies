import { createInitialSignupDraft } from '@/src/features/auth/constants';
import type { CompleteSignUpInput, SignupDraft, SignupStep } from '@/src/features/auth/types';
import type { ActionResult } from '@/src/shared/types/result';

const RESTORABLE_STEPS: SignupStep[] = ['account', 'verify', 'profile', 'interests', 'safety'];

export function normalizePhone(value: string) {
  return value.replace(/[\s.-]/g, '');
}

export function isVietnamPhoneValid(value: string) {
  return /^(?:\+84|84|0)(?:3|5|7|8|9)\d{8}$/.test(normalizePhone(value));
}

export function formatPhone(value: string) {
  let digits = normalizePhone(value).replace(/^\+84/, '0').replace(/^84/, '0');
  if (digits.length === 10) digits = `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  return digits;
}

export function normalizeUsername(value: string) {
  return value.trim().replace(/^@/, '');
}

export function isUsernameValid(value: string) {
  return /^[a-zA-Z0-9_.]{3,20}$/.test(value);
}

export function parseDateOfBirth(value: string) {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(value)) return null;
  const [month, day, year] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

export function isAdultDateOfBirth(value: string) {
  const date = parseDateOfBirth(value);
  if (!date) return false;
  const today = new Date();
  const adultCutoff = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return date <= adultCutoff;
}

export function normalizeStoredDateOfBirth(value?: string) {
  if (!value) return '';
  const legacy = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return legacy ? `${legacy[2]}-${legacy[3]}-${legacy[1]}` : value;
}

export function formatDateOfBirthInput(value: string, previous: string) {
  const deletingSeparator = value.length < previous.length && previous.endsWith('-') && value === previous.slice(0, -1);
  if (deletingSeparator) return value.slice(0, -1);
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length < 2) return digits;
  if (digits.length === 2) return `${digits}-`;
  if (digits.length < 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  if (digits.length === 4) return `${digits.slice(0, 2)}-${digits.slice(2)}-`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

export function validateSignupAccount(phone: string) {
  const errors: Record<string, string> = {};
  if (!phone.trim()) errors.phone = 'Vui lòng nhập số điện thoại.';
  else if (!isVietnamPhoneValid(phone)) errors.phone = 'Số điện thoại không hợp lệ.';
  return errors;
}

export function validateBasicProfile(draft: SignupDraft, usernames: string[]) {
  const errors: Record<string, string> = {};
  const username = normalizeUsername(draft.username);
  if (draft.name.trim().length < 2) errors.name = 'Vui lòng nhập họ và tên.';
  if (!isUsernameValid(username)) errors.username = 'Username cần 3–20 chữ, số, dấu chấm hoặc gạch dưới.';
  else if (usernames.some((value) => value.toLowerCase() === username.toLowerCase())) errors.username = 'Username này đã được sử dụng.';
  const birthDate = parseDateOfBirth(draft.dateOfBirth);
  if (!draft.dateOfBirth.trim()) errors.dateOfBirth = 'Vui lòng nhập ngày sinh.';
  else if (!birthDate) errors.dateOfBirth = 'Ngày sinh không hợp lệ. Dùng định dạng MM-DD-YYYY.';
  else {
    const today = new Date();
    const adultCutoff = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    if (birthDate > today) errors.dateOfBirth = 'Ngày sinh không được ở tương lai.';
    else if (birthDate > adultCutoff) errors.dateOfBirth = 'Bạn phải đủ 18 tuổi để tham gia.';
  }
  if (!draft.city.trim()) errors.city = 'Vui lòng nhập thành phố.';
  if (draft.bio.length > 160) errors.bio = 'Giới thiệu không được quá 160 ký tự.';
  return errors;
}

export function validateCompleteSignUp(input: CompleteSignUpInput, usernames: string[]): ActionResult {
  const username = normalizeUsername(input.username).toLowerCase();
  if (!isVietnamPhoneValid(input.phone)) return { ok: false, error: 'Số điện thoại Việt Nam không hợp lệ.' };
  if (input.name.trim().length < 2) return { ok: false, error: 'Vui lòng nhập họ và tên.' };
  if (!isUsernameValid(username)) return { ok: false, error: 'Username cần 3–20 chữ, số, dấu chấm hoặc gạch dưới.' };
  if (usernames.some((value) => value.toLowerCase() === username)) return { ok: false, error: 'Username đã được sử dụng.' };
  if (!isAdultDateOfBirth(input.dateOfBirth)) return { ok: false, error: 'Ngày sinh không hợp lệ hoặc bạn chưa đủ 18 tuổi.' };
  if (!input.city.trim()) return { ok: false, error: 'Vui lòng nhập thành phố.' };
  if (input.interests.length < 3) return { ok: false, error: 'Vui lòng chọn ít nhất 3 sở thích.' };
  return { ok: true };
}

export function restoreSignupDraft(stored: Partial<SignupDraft>): SignupDraft {
  const initial = createInitialSignupDraft();
  const requestedStep = RESTORABLE_STEPS.includes(stored.step ?? 'account') ? stored.step as SignupStep : 'account';
  const step = !stored.phoneVerified && !['account', 'verify'].includes(requestedStep) ? 'verify' : requestedStep;
  return {
    ...initial,
    ...stored,
    step,
    dateOfBirth: normalizeStoredDateOfBirth(stored.dateOfBirth),
    interests: Array.isArray(stored.interests) ? stored.interests : [],
    preferredVibes: Array.isArray(stored.preferredVibes) ? stored.preferredVibes : [],
  };
}
