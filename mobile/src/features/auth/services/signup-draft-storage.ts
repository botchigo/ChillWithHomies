import AsyncStorage from '@react-native-async-storage/async-storage';

import { restoreSignupDraft } from '@/src/features/auth/services/auth-validation';
import type { SignupDraft } from '@/src/features/auth/types';

const DRAFT_KEY = '@chillwithhomies/signup-draft-v1';

export async function loadSignupDraft() {
  const raw = await AsyncStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object') throw new Error('Malformed signup draft');
  return restoreSignupDraft(parsed as Partial<SignupDraft>);
}

export function saveSignupDraft(draft: SignupDraft) {
  return AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearSignupDraft() {
  return AsyncStorage.removeItem(DRAFT_KEY);
}
