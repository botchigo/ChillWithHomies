import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import type { ActionResult } from '@/src/shared/types/result';

export type ApiResult<T> = ActionResult & {
  data?: T;
  status?: number;
  code?: string;
};

type ApiErrorBody = {
  code?: string;
  error?: string;
  message?: string;
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';
const explicitApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ?? '';

let client: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;
  if (!isSupabaseConfigured()) {
    throw new Error('Thiếu EXPO_PUBLIC_SUPABASE_URL hoặc EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
  }

  client = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}

export function registerSupabaseAuthAutoRefresh() {
  if (Platform.OS === 'web' || !isSupabaseConfigured()) return () => undefined;

  const supabase = getSupabaseClient();
  const syncRefresh = (state: string) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  };
  syncRefresh(AppState.currentState);
  const subscription = AppState.addEventListener('change', syncRefresh);
  return () => {
    subscription.remove();
    supabase.auth.stopAutoRefresh();
  };
}

export function mapApiError(error: unknown, fallback = 'Không thể kết nối máy chủ. Vui lòng thử lại.'): ActionResult {
  if (typeof error === 'string' && error.trim()) return { ok: false, error: error.trim() };
  if (error instanceof Error && error.message.trim()) return { ok: false, error: error.message.trim() };
  return { ok: false, error: fallback };
}

function apiBaseUrl() {
  const value = explicitApiBaseUrl || (supabaseUrl ? `${supabaseUrl.replace(/\/$/, '')}/functions/v1/api` : '');
  if (!value) throw new Error('Thiếu EXPO_PUBLIC_API_BASE_URL.');
  return value.replace(/\/$/, '');
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) return response.json();
  const text = await response.text();
  return text || undefined;
}

function errorFromBody(body: unknown, fallback: string) {
  if (typeof body === 'string' && body.trim()) return body.trim();
  if (body && typeof body === 'object') {
    const value = body as ApiErrorBody;
    return value.error?.trim() || value.message?.trim() || fallback;
  }
  return fallback;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const supabase = getSupabaseClient();
    const sessionResult = await supabase.auth.getSession();
    if (sessionResult.error) return mapApiError(sessionResult.error) as ApiResult<T>;

    const request = async (accessToken?: string) => {
      const headers = new Headers(init.headers);
      headers.set('Accept', 'application/json');
      headers.set('apikey', supabasePublishableKey);
      headers.set('Authorization', `Bearer ${accessToken || supabasePublishableKey}`);
      if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      return fetch(`${apiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`, { ...init, headers });
    };

    let response = await request(sessionResult.data.session?.access_token);
    if (response.status === 401 && sessionResult.data.session) {
      const refreshed = await supabase.auth.refreshSession();
      if (!refreshed.error && refreshed.data.session?.access_token) {
        response = await request(refreshed.data.session.access_token);
      }
    }

    const body = await parseResponseBody(response);
    if (!response.ok) {
      const errorBody = body && typeof body === 'object' ? body as ApiErrorBody : undefined;
      return {
        ok: false,
        error: errorFromBody(body, `Yêu cầu thất bại (${response.status}).`),
        status: response.status,
        code: errorBody?.code,
      };
    }
    return { ok: true, data: body as T, status: response.status };
  } catch (error) {
    return mapApiError(error) as ApiResult<T>;
  }
}
