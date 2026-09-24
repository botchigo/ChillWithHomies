# ChillWithHomies backend

Supabase backend workspace for Postgres, Auth, Realtime, Storage, and Edge Functions. The API contract is
[`openapi.yaml`](./openapi.yaml); database changes are versioned under `supabase/migrations/`.

## Prerequisites

- Node.js 22.13+ or 24.3+
- Docker Desktop (or another Docker-compatible runtime)
- A Supabase account with two isolated Cloud projects for staging and production

## Local setup

```powershell
cd backend
npm.cmd ci
Copy-Item .env.example .env
npx.cmd supabase start
```

`supabase start` applies migrations and `supabase/seed.sql`. It prints the local API URL, Studio URL, and local
publishable key. Copy the public values into `mobile/.env` using `mobile/.env.example`; never put a service-role
key in the Expo app.

Local Phone Auth uses OTP `123456` for `0901234567` (existing smoke-test profile) and `0987654321` (fresh signup).
These test numbers are local-only and do not configure SMS delivery for Cloud projects.

Useful commands:

```powershell
npm.cmd run lint:openapi
npx.cmd supabase status
npx.cmd supabase db reset
npx.cmd supabase gen types typescript --local
```

## Cloud environments

The Free-plan layout uses the local Supabase stack for development and two separate Cloud projects for staging
and production. Store only their references in local/CI configuration. No Cloud credential is committed to this
repository.

| Environment | Suggested project name | Project ref variable | Purpose |
| --- | --- | --- | --- |
| Development | Local Supabase | Leave `SUPABASE_DEV_PROJECT_REF` empty | Development and disposable test data |
| Staging | `chillwithhomies-staging` | `SUPABASE_STAGING_PROJECT_REF` | End-to-end release candidate testing |
| Production | `chillwithhomies-prod` | `SUPABASE_PROD_PROJECT_REF` | Live user data |

Provision staging and production from the Supabase dashboard, then authenticate and link one target at a time:

```powershell
npx.cmd supabase login
npx.cmd supabase link --project-ref $env:SUPABASE_STAGING_PROJECT_REF
npx.cmd supabase db push --dry-run
npx.cmd supabase db push
```

Repeat with the staging ref after dev verification. Production migrations should be deployed by an approved CI
job, never by resetting a linked database. Do not run `db reset --linked` against production.

Deploy the API and run the staging contract checks after linking staging:

```powershell
npx.cmd supabase functions deploy api --no-verify-jwt
npm.cmd run test:api
```

Phone OTP also requires an SMS provider configured under **Authentication → Providers → Phone** in each Cloud
project. The static OTP in `supabase/config.toml` is only for the local Supabase stack and must not be used in
staging or production.

For each environment, configure these Expo public values in the matching build profile:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_API_BASE_URL` (`<SUPABASE_URL>/functions/v1/api`)

Server-only secrets belong in Supabase Edge Function secrets or CI secret storage:

- `SUPABASE_SERVICE_ROLE_KEY`
- SMS provider credentials
- Expo push access token

## Current phase status

Phase 0 establishes the local layout, initial extensions, OpenAPI contract, and mobile client. Staging and
production are separate Cloud projects; development runs locally to stay within the Free-plan project limit.
Phase 1 adds OTP/profile schema, RLS, private avatar storage, Edge Functions, username availability checks, and
idempotent legacy-state import. Its staging deployment is ready for end-to-end OTP verification after an SMS
provider is configured in the Supabase dashboard.
