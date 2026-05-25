# Shared-Resources Audit — payos-playground

**VERDICT: NEEDS-REFACTOR**

Reason: Upstash client uses single env-var convention only, no `KEY_PREFIX` namespacing, and raw unprefixed key literals (`payments:recent`, `payment:{orderCode}`) are written directly to the shared Redis DB. Sharing this Upstash instance with vngeoguessr / store-scraper-bot / any other portfolio app will collide on the generic `payment:*` and `payments:recent` keyspace.

Supabase: not used in this repo. Out of scope.

---

## Findings vs Reference Pattern (`vngeoguessr/src/lib/upstash.js`)

### 1. Single env-var convention (BLOCKER for Vercel Marketplace KV)
`src/lib/server/redis.js:11-12` reads only `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`. Reference uses `??` fallback to `KV_REST_API_URL` / `KV_REST_API_TOKEN` (vngeoguessr/src/lib/upstash.js:29-30). When this project is provisioned via Vercel Marketplace integration, only the `KV_*` aliases exist — app will crash at first Redis call.

Fix: `env.UPSTASH_REDIS_REST_URL ?? env.KV_REST_API_URL` (same for token). Add the two `KV_*` names to `.env.example:4-5`.

### 2. No KEY_PREFIX namespacing (BLOCKER for shared DB)
`src/lib/server/redis.js` constructs a bare `Redis` client. No prefix wrapper, no `physicalKey()` helper. Reference design returns `{ client, prefix }` and applies prefix in every helper.

Result: keys land in the global Redis keyspace as `payment:1234` / `payments:recent`. The string `payment:` is generic enough that any other commerce-ish project will collide.

Fix: introduce `KEY_PREFIX` env (default `'payos-playground:'`), return `{ client, prefix }` from `createRedis`, propagate through `event.locals.redis` (likely as the handle object, not bare client).

### 3. Unprefixed raw key literals in store
`src/lib/server/store.js:3-4` hardcodes `RECENT_KEY = 'payments:recent'` and `PAYMENT_PREFIX = 'payment:'`. Lines 32-33, 44, 57 call `redis.set/get/zadd/zrange` directly with these — bypassing any future prefix layer.

Fix: rewrite store to take the prefixed handle (`{ client, prefix }`) and route every call through a `pkey(h, logicalKey)` helper, matching vngeoguessr's `getJson` / `putJson` / `zAdd` / `zRangeWithScores` shape.

### 4. `hooks.server.js` injects bare client
`src/hooks.server.js:32` sets `event.locals.redis = getRedis()` — a raw `Redis` instance. After refactor this must be the `{ client, prefix }` handle so route code cannot accidentally make raw unprefixed calls.

Update `src/app.d.ts` Locals typing accordingly.

### 5. Webhook handler inherits the leak
`src/routes/api/webhook/+server.js:43,45` call `getPayment(locals.redis, ...)` / `savePayment(...)` — fine in shape, but until store.js is refactored these go to unprefixed keys. No standalone fix needed; resolved by #3.

---

## Security observations (passing)

- `src/routes/api/webhook/+server.js:28-35`: signature verification via `payos.webhooks.verify` is correctly gated before any state mutation. Good.
- Verification-ping bypass at `:19-21` returns 200 without signature check. PayOS spec allows this; acceptable. Worth noting it gives an unauth oracle for "is this a payos webhook endpoint" — low risk.
- `src/lib/server/payos.js:15`: `baseURL` pinned in code, blocking `PAYOS_BASE_URL` env override. Good (comment is accurate).
- No PII / secret logging spotted. `[webhook] redis update failed` logs error message only — fine.
- Webhook updates only when `existing.status === 'PENDING'` (`:44`) — prevents replay overwrite of terminal states. Good.
- Race: two concurrent webhooks for same orderCode could both pass the PENDING check then both write. Low impact (idempotent terminal write) but worth noting.

## .env.example gaps

`.env.example:4-5` lists only `UPSTASH_REDIS_REST_*`. After refactor, add:
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` (commented as Vercel Marketplace alias)
- `KEY_PREFIX=payos-playground:` (commented as optional, defaults to project slug)

---

## Required Actions (priority order)

1. Refactor `src/lib/server/redis.js` to dual env-var + KEY_PREFIX handle pattern (mirror vngeoguessr).
2. Refactor `src/lib/server/store.js` to take handle and route every call through `pkey()`.
3. Update `src/hooks.server.js` + `src/app.d.ts` Locals type for handle shape.
4. Update `.env.example` and README env table.
5. Optional: tighten webhook idempotency with atomic Lua / `SET NX` on terminal state.

## Unresolved Questions

- Confirm `KEY_PREFIX` default — `'payos-playground:'` matches the directory slug; user may prefer a shorter tag (e.g., `'payos:'`).
- Are both env-name conventions actually needed here, or is this project always provisioned via vanilla Upstash (not Vercel Marketplace KV)? If always vanilla, dual-alias support is still cheap insurance.
