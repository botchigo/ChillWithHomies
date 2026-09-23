import assert from 'node:assert/strict';
import test from 'node:test';

const baseUrl = process.env.API_BASE_URL?.replace(/\/$/, '');

async function request(path, init) {
  assert.ok(baseUrl, 'API_BASE_URL must be configured for API contract tests');
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init?.headers },
  });
}

test('OTP request rejects an invalid Vietnamese phone number', async () => {
  const response = await request('/auth/otp/request', {
    method: 'POST',
    body: JSON.stringify({ phone: '123' }),
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.ok, false);
  assert.match(body.error, /điện thoại/i);
});

test('profile endpoint rejects an unauthenticated request', async () => {
  const response = await request('/me');
  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.code, 'UNAUTHORIZED');
});

test('username availability requires authentication', async () => {
  const response = await request('/profiles/username-availability?username=homie_test');
  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.code, 'UNAUTHORIZED');
});
