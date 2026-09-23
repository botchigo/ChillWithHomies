import type { CompleteSignUpInput } from '@/src/features/auth/types';
import type { UserProfile } from '@/src/features/profile/types';
import { apiRequest, getSupabaseClient, type ApiResult } from '@/src/shared/api/client';
import type { DemoAppState } from '@/src/shared/types/demo-app-state';
import type { ActionResult } from '@/src/shared/types/result';

export type OtpSessionResult = ActionResult & {
  profileComplete?: boolean;
};

type AuthSessionDto = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
  profileComplete: boolean;
};

type MigrationImportResponse = {
  ok: true;
  alreadyImported: boolean;
  idMap: Record<string, string>;
};

export async function requestPhoneOtp(phone: string): Promise<ActionResult> {
  const result = await apiRequest<ActionResult>('/auth/otp/request', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function verifyPhoneOtp(phone: string, token: string): Promise<OtpSessionResult> {
  const result = await apiRequest<AuthSessionDto>('/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, token }),
  });
  if (!result.ok || !result.data) return { ok: false, error: result.error };

  const { error } = await getSupabaseClient().auth.setSession({
    access_token: result.data.accessToken,
    refresh_token: result.data.refreshToken,
  });
  if (error) return { ok: false, error: 'Không thể lưu phiên đăng nhập. Vui lòng thử lại.' };
  return { ok: true, profileComplete: result.data.profileComplete };
}

export async function fetchCurrentProfile(): Promise<ApiResult<UserProfile>> {
  return apiRequest<UserProfile>('/me');
}

export async function completeRemoteSignUp(input: CompleteSignUpInput): Promise<ApiResult<UserProfile>> {
  return apiRequest<UserProfile>('/auth/signup/complete', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function checkUsernameAvailability(username: string): Promise<ApiResult<{ available: boolean }>> {
  return apiRequest<{ available: boolean }>(`/profiles/username-availability?username=${encodeURIComponent(username)}`);
}

export async function uploadProfileAvatar(uri: string): Promise<ApiResult<string>> {
  try {
    const supabase = getSupabaseClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return { ok: false, error: 'Bạn chưa đăng nhập.' };

    const response = await fetch(uri);
    if (!response.ok) return { ok: false, error: 'Không thể đọc ảnh đại diện đã chọn.' };
    const bytes = await response.arrayBuffer();
    if (!bytes.byteLength || bytes.byteLength > 5 * 1024 * 1024) {
      return { ok: false, error: 'Ảnh đại diện phải nhỏ hơn 5 MB.' };
    }

    const contentType = response.headers.get('content-type')?.split(';')[0] || 'image/jpeg';
    if (!contentType.startsWith('image/')) return { ok: false, error: 'Tệp đã chọn không phải hình ảnh.' };
    const extension = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
    const path = `${userData.user.id}/avatar-${Date.now()}.${extension}`;
    const { error } = await supabase.storage.from('avatars').upload(path, bytes, {
      cacheControl: '3600',
      contentType,
      upsert: false,
    });
    return error ? { ok: false, error: 'Không thể tải ảnh đại diện lên.' } : { ok: true, data: path };
  } catch {
    return { ok: false, error: 'Không thể tải ảnh đại diện lên.' };
  }
}

export async function updateRemoteProfile(input: Partial<UserProfile> & { notificationsEnabled?: boolean }): Promise<ApiResult<UserProfile>> {
  return apiRequest<UserProfile>('/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function importLegacyState(state: DemoAppState): Promise<ApiResult<MigrationImportResponse>> {
  return apiRequest<MigrationImportResponse>('/migration/import', {
    method: 'POST',
    body: JSON.stringify({ storageKey: '@chillwithhomies/demo-state-v3', state }),
  });
}

export async function signOutRemote() {
  return getSupabaseClient().auth.signOut();
}
