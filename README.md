# PayOS Playground

A SvelteKit demo that lets you create PayOS payment links, scan a QR code, and receive webhook status updates — all persisted in Upstash Redis.

## Tech Stack

| Layer | Package | Version |
|---|---|---|
| Framework | SvelteKit | ^2.x |
| UI | Svelte (runes API) | ^5.x |
| Adapter | @sveltejs/adapter-vercel | ^6.x |
| Build | Vite | ^6.x |
| Payment | @payos/node | ^2.x |
| Storage | @upstash/redis | ^1.38.x |
| Runtime | Node.js | 24.x |
| Package manager | pnpm | 11.x |

## Prerequisites

- **Node.js 24** (`node --version` should print `v24.x.x`)
- **pnpm 11** (`pnpm --version` should print `11.x.x`)
- A **PayOS merchant account** — sign up at [payos.vn](https://payos.vn) and obtain your Client ID, API Key, and Checksum Key from the dashboard
- An **Upstash Redis** database — create a free one at [console.upstash.com](https://console.upstash.com) and copy the REST URL and token

## Setup

```bash
# 1. Clone
git clone https://github.com/your-username/payos-playground.git
cd payos-playground

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
```

Edit `.env` and fill in all six values:

```
PAYOS_CLIENT_ID=...
PAYOS_API_KEY=...
PAYOS_CHECKSUM_KEY=...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
PUBLIC_BASE_URL=http://localhost:5173   # change to your Vercel URL after deploy
```

## Development

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173). Create a payment — the checkout URL and QR code are returned immediately.

## PayOS Webhook Setup

PayOS requires a publicly reachable URL to send payment status updates.

1. Deploy to Vercel first (see below)
2. Go to the [PayOS dashboard](https://payos.vn) → Developer → Webhook
3. Set the webhook URL to:
   ```
   https://<your-deploy>.vercel.app/api/webhook
   ```
4. Save — PayOS will send a verification ping, which the app handles automatically

## Deploy to Vercel

1. Push this repository to GitHub
2. Import the repo in [Vercel](https://vercel.com/new)
3. Add these **Environment Variables** in the Vercel project settings:
   - `PAYOS_CLIENT_ID`
   - `PAYOS_API_KEY`
   - `PAYOS_CHECKSUM_KEY`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `PUBLIC_BASE_URL` (set to your `https://<deploy>.vercel.app`)
4. Deploy — Vercel detects SvelteKit automatically via `@sveltejs/adapter-vercel`

## CI

GitHub Actions runs on every push and pull request:

- `pnpm install --frozen-lockfile`
- `pnpm run lint` (ESLint flat config)
- `pnpm run check` (svelte-check + JSDoc types)
- `pnpm run build` (no env vars required — lazy singletons)

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Notes

- **No sandbox**: PayOS does not provide a public sandbox environment. Use small real VND amounts (minimum 1,000 VND) for testing.
- **Order codes**: Generated from `Date.now()` (millisecond timestamp) — unique per payment within a session.
- **Payment descriptions**: Limited to 25 characters by PayOS.
- **Redis is optional for browsing**: The `/payments` page degrades gracefully if Upstash env vars are not set.
