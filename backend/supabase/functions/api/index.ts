import { createClient, type SupabaseClient, type User } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
const authClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });

type JsonRecord = Record<string, unknown>;

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { ...corsHeaders, 'Cache-Control': 'no-store' } });
}

function fail(error: string, status = 400, code?: string) {
  return json({ ok: false, error, ...(code ? { code } : {}) }, status);
}

function normalizePhone(value: unknown) {
  if (typeof value !== 'string') return null;
  const compact = value.replace(/[\s.-]/g, '');
  if (/^0[35789]\d{8}$/.test(compact)) return `+84${compact.slice(1)}`;
  if (/^84[35789]\d{8}$/.test(compact)) return `+${compact}`;
  if (/^\+84[35789]\d{8}$/.test(compact)) return compact;
  return null;
}

function normalizeUsername(value: unknown) {
  return typeof value === 'string' ? value.trim().replace(/^@/, '').toLowerCase() : '';
}

function parseBirthDate(value: unknown) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  if (!match) return null;
  const [, month, day, year] = match;
  const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.getUTCFullYear() !== Number(year) || date.getUTCMonth() + 1 !== Number(month) || date.getUTCDate() !== Number(day)) return null;
  return `${year}-${month}-${day}`;
}

function isAdult(dateValue: string) {
  const birthDate = new Date(`${dateValue}T00:00:00.000Z`);
  const today = new Date();
  const cutoff = new Date(Date.UTC(today.getUTCFullYear() - 18, today.getUTCMonth(), today.getUTCDate()));
  return birthDate <= cutoff;
}

function toClientBirthDate(value: string | null) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${month}-${day}-${year}`;
}

async function requestBody(req: Request): Promise<JsonRecord> {
  try {
    const body: unknown = await req.json();
    return body && typeof body === 'object' && !Array.isArray(body) ? body as JsonRecord : {};
  } catch {
    return {};
  }
}

async function currentUser(req: Request): Promise<User | null> {
  const authorization = req.headers.get('Authorization') ?? '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token || token === anonKey) return null;
  const { data, error } = await admin.auth.getUser(token);
  return error ? null : data.user;
}

async function profileResponse(userId: string) {
  const { data, error } = await admin.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  let avatarUri: string | undefined;
  if (data.avatar_path) {
    const signed = await admin.storage.from('avatars').createSignedUrl(data.avatar_path, 3600);
    avatarUri = signed.data?.signedUrl;
  }
  return {
    id: data.id,
    name: data.name,
    username: data.username ?? '',
    phone: data.phone,
    bio: data.bio,
    city: data.city,
    interests: data.interests,
    dateOfBirth: toClientBirthDate(data.date_of_birth),
    verifiedPhone: data.verified_phone,
    preferredVibes: data.preferred_vibes,
    avatarColor: data.avatar_color,
    ...(avatarUri ? { avatarUri } : {}),
    verified: data.verified,
  };
}

async function requestOtp(body: JsonRecord) {
  const phone = normalizePhone(body.phone);
  if (!phone) return fail('Số điện thoại Việt Nam không hợp lệ.');
  const now = new Date();
  const { data: rate } = await admin.from('otp_rate_limits').select('*').eq('phone', phone).maybeSingle();
  if (rate?.locked_until && new Date(rate.locked_until) > now) return fail('Số điện thoại đang tạm khóa. Vui lòng thử lại sau.', 429, 'OTP_LOCKED');

  const windowStarted = rate?.request_window_started_at ? new Date(rate.request_window_started_at) : now;
  const inWindow = now.getTime() - windowStarted.getTime() < 10 * 60 * 1000;
  const requestCount = inWindow ? Number(rate?.request_count ?? 0) : 0;
  if (requestCount >= 5) return fail('Bạn đã yêu cầu quá nhiều mã OTP. Vui lòng thử lại sau 10 phút.', 429, 'OTP_RATE_LIMITED');

  const { error } = await authClient.auth.signInWithOtp({ phone, options: { shouldCreateUser: true } });
  if (error) return fail('Không thể gửi mã xác thực. Vui lòng kiểm tra cấu hình SMS.', 502, 'OTP_PROVIDER_ERROR');

  await admin.from('otp_rate_limits').upsert({
    phone,
    request_window_started_at: inWindow ? windowStarted.toISOString() : now.toISOString(),
    request_count: requestCount + 1,
    failed_attempt_count: rate?.failed_attempt_count ?? 0,
    locked_until: null,
    updated_at: now.toISOString(),
  });
  return json({ ok: true }, 202);
}

async function verifyOtp(body: JsonRecord) {
  const phone = normalizePhone(body.phone);
  const token = typeof body.token === 'string' ? body.token.trim() : '';
  if (!phone || !/^\d{6}$/.test(token)) return fail('Mã xác thực cần đủ 6 chữ số.');
  const now = new Date();
  const { data: rate } = await admin.from('otp_rate_limits').select('*').eq('phone', phone).maybeSingle();
  if (rate?.locked_until && new Date(rate.locked_until) > now) return fail('Số điện thoại đang tạm khóa. Vui lòng thử lại sau.', 429, 'OTP_LOCKED');

  const { data, error } = await authClient.auth.verifyOtp({ phone, token, type: 'sms' });
  if (error || !data.session || !data.user) {
    const failures = Number(rate?.failed_attempt_count ?? 0) + 1;
    const lockedUntil = failures >= 5 ? new Date(now.getTime() + 15 * 60 * 1000).toISOString() : null;
    await admin.from('otp_rate_limits').upsert({
      phone,
      request_window_started_at: rate?.request_window_started_at ?? now.toISOString(),
      request_count: rate?.request_count ?? 0,
      failed_attempt_count: failures,
      locked_until: lockedUntil,
      updated_at: now.toISOString(),
    });
    return fail(failures >= 5 ? 'Bạn đã nhập sai quá 5 lần. Vui lòng thử lại sau 15 phút.' : 'Mã xác thực không đúng hoặc đã hết hạn.', failures >= 5 ? 429 : 400, failures >= 5 ? 'OTP_LOCKED' : 'OTP_INVALID');
  }

  await admin.from('otp_rate_limits').upsert({
    phone,
    request_window_started_at: rate?.request_window_started_at ?? now.toISOString(),
    request_count: rate?.request_count ?? 0,
    failed_attempt_count: 0,
    locked_until: null,
    updated_at: now.toISOString(),
  });
  const profile = await profileResponse(data.user.id);
  return json({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at ?? 0,
    userId: data.user.id,
    profileComplete: Boolean(profile?.username),
  });
}

async function completeSignup(req: Request, body: JsonRecord) {
  const user = await currentUser(req);
  if (!user) return fail('Bạn chưa đăng nhập.', 401, 'UNAUTHORIZED');
  const phone = normalizePhone(body.phone);
  const authPhone = normalizePhone(user.phone);
  const username = normalizeUsername(body.username);
  const dateOfBirth = parseBirthDate(body.dateOfBirth);
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const city = typeof body.city === 'string' ? body.city.trim() : '';
  const bio = typeof body.bio === 'string' ? body.bio.trim() : '';
  const interests = Array.isArray(body.interests) ? body.interests.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean) : [];
  const preferredVibes = Array.isArray(body.preferredVibes) ? body.preferredVibes.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean) : [];
  if (!phone || phone !== authPhone) return fail('Số điện thoại không khớp phiên đã xác thực.');
  if (name.length < 2) return fail('Vui lòng nhập họ và tên.');
  if (!/^[a-zA-Z0-9_.]{3,20}$/.test(username)) return fail('Username cần 3–20 chữ, số, dấu chấm hoặc gạch dưới.');
  if (!dateOfBirth || !isAdult(dateOfBirth)) return fail('Ngày sinh không hợp lệ hoặc bạn chưa đủ 18 tuổi.');
  if (!city) return fail('Vui lòng nhập thành phố.');
  if (bio.length > 160) return fail('Giới thiệu không được quá 160 ký tự.');
  if (interests.length < 3) return fail('Vui lòng chọn ít nhất 3 sở thích.');

  const avatarPath = typeof body.avatarUri === 'string' && body.avatarUri.startsWith(`${user.id}/`) ? body.avatarUri : null;
  const { error } = await admin.from('profiles').upsert({
    id: user.id,
    phone,
    username,
    name,
    city,
    bio,
    date_of_birth: dateOfBirth,
    avatar_color: typeof body.avatarColor === 'string' ? body.avatarColor : '#F28C28',
    avatar_path: avatarPath,
    interests,
    preferred_vibes: preferredVibes,
    verified_phone: true,
    notifications_enabled: body.notificationsEnabled !== false,
    profile_completed_at: new Date().toISOString(),
  });
  if (error?.code === '23505') return fail('Username đã được sử dụng.', 409, 'USERNAME_TAKEN');
  if (error) return fail('Không thể hoàn tất tài khoản.', 400, error.code);
  return json(await profileResponse(user.id), 201);
}

async function usernameAvailability(req: Request, url: URL) {
  const user = await currentUser(req);
  if (!user) return fail('Bạn chưa đăng nhập.', 401, 'UNAUTHORIZED');
  const username = normalizeUsername(url.searchParams.get('username'));
  if (!/^[a-zA-Z0-9_.]{3,20}$/.test(username)) return fail('Username cần 3–20 chữ, số, dấu chấm hoặc gạch dưới.');
  const { data, error } = await admin.from('profiles').select('id').eq('username', username).neq('id', user.id).maybeSingle();
  if (error) return fail('Không thể kiểm tra username.', 400, error.code);
  return json({ available: !data });
}

async function updateProfile(req: Request, body: JsonRecord) {
  const user = await currentUser(req);
  if (!user) return fail('Bạn chưa đăng nhập.', 401, 'UNAUTHORIZED');
  const changes: JsonRecord = {};
  if (typeof body.name === 'string') {
    const name = body.name.trim();
    if (name.length < 2) return fail('Vui lòng nhập họ và tên.');
    changes.name = name;
  }
  if (typeof body.username === 'string') {
    const username = normalizeUsername(body.username);
    if (!/^[a-zA-Z0-9_.]{3,20}$/.test(username)) return fail('Username cần 3–20 chữ, số, dấu chấm hoặc gạch dưới.');
    changes.username = username;
  }
  if (typeof body.bio === 'string') {
    const bio = body.bio.trim();
    if (bio.length > 160) return fail('Giới thiệu không được quá 160 ký tự.');
    changes.bio = bio;
  }
  if (typeof body.city === 'string') {
    const city = body.city.trim();
    if (!city) return fail('Vui lòng nhập thành phố.');
    changes.city = city;
  }
  if (Array.isArray(body.interests)) changes.interests = body.interests.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
  if (Array.isArray(body.preferredVibes)) changes.preferred_vibes = body.preferredVibes.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
  if (typeof body.notificationsEnabled === 'boolean') changes.notifications_enabled = body.notificationsEnabled;
  if (!Object.keys(changes).length) return fail('Không có thay đổi hợp lệ.');
  const { error } = await admin.from('profiles').update(changes).eq('id', user.id);
  if (error?.code === '23505') return fail('Username đã được sử dụng.', 409, 'USERNAME_TAKEN');
  if (error) return fail('Không thể cập nhật hồ sơ.', 400, error.code);
  return json(await profileResponse(user.id));
}

async function importMigration(req: Request, body: JsonRecord) {
  const user = await currentUser(req);
  if (!user) return fail('Bạn chưa đăng nhập.', 401, 'UNAUTHORIZED');
  if (body.storageKey !== '@chillwithhomies/demo-state-v3' || !body.state || typeof body.state !== 'object') return fail('Dữ liệu migration không hợp lệ.');
  const state = body.state as JsonRecord;
  if (state.version !== 3) return fail('Phiên bản dữ liệu migration không được hỗ trợ.');
  const existing = await admin.from('migration_imports').select('id_map').eq('user_id', user.id).maybeSingle();
  if (existing.data) return json({ ok: true, alreadyImported: true, idMap: existing.data.id_map });
  const legacyProfile = state.profile && typeof state.profile === 'object' ? state.profile as JsonRecord : {};
  const legacyId = typeof legacyProfile.id === 'string' ? legacyProfile.id : user.id;
  const idMap = { [legacyId]: user.id };
  const { error } = await admin.from('migration_imports').insert({
    user_id: user.id,
    source_storage_key: body.storageKey,
    source_version: 3,
    raw_state: state,
    id_map: idMap,
  });
  if (error) return fail('Không thể lưu dữ liệu migration.', 400, error.code);
  return json({ ok: true, alreadyImported: false, idMap });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, '').replace(/^\/functions\/v1\/api/, '') || '/';
  const body = ['POST', 'PATCH', 'PUT'].includes(req.method) ? await requestBody(req) : {};
  try {
    if (req.method === 'POST' && path === '/auth/otp/request') return await requestOtp(body);
    if (req.method === 'POST' && path === '/auth/otp/verify') return await verifyOtp(body);
    if (req.method === 'POST' && path === '/auth/signup/complete') return await completeSignup(req, body);
    if (req.method === 'POST' && path === '/migration/import') return await importMigration(req, body);
    if (req.method === 'GET' && path === '/profiles/username-availability') return await usernameAvailability(req, url);
    if (path === '/me' && req.method === 'GET') {
      const user = await currentUser(req);
      if (!user) return fail('Bạn chưa đăng nhập.', 401, 'UNAUTHORIZED');
      const profile = await profileResponse(user.id);
      return profile ? json(profile) : fail('Không tìm thấy hồ sơ.', 404, 'PROFILE_NOT_FOUND');
    }
    if (path === '/me' && req.method === 'PATCH') return await updateProfile(req, body);
    return fail('Endpoint chưa được triển khai.', 404, 'NOT_FOUND');
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Unhandled API error');
    return fail('Máy chủ gặp lỗi. Vui lòng thử lại.', 500, 'INTERNAL_ERROR');
  }
});
