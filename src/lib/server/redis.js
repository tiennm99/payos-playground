import { Redis } from '@upstash/redis';
import { env } from '$env/dynamic/private';

// Upstash Redis handle factory.
//
// Returns a `{ client, prefix }` handle so this project can safely share an
// Upstash DB with other portfolio projects (vngeoguessr, store-scraper-bot,
// sepay-playground…) without key collisions.
//
// Accepts both env var conventions:
//   UPSTASH_REDIS_REST_URL / _TOKEN  (vanilla Upstash signup)
//   KV_REST_API_URL / _TOKEN         (Vercel Marketplace integration alias)
//
// KEY_PREFIX env (default 'payos-playground:') is prepended to every physical
// key inside the helpers in store.js. Callers pass logical keys only.

const DEFAULT_KEY_PREFIX = 'payos-playground:';

/**
 * @typedef {{ client: Redis, prefix: string }} RedisHandle
 */

/**
 * Creates a new Upstash Redis handle using runtime environment variables.
 * Called lazily — never at module import time — so build succeeds without env.
 * @returns {RedisHandle}
 */
export function createRedis() {
	const url = env.UPSTASH_REDIS_REST_URL ?? env.KV_REST_API_URL;
	const token = env.UPSTASH_REDIS_REST_TOKEN ?? env.KV_REST_API_TOKEN;
	if (!url) throw new Error('UPSTASH_REDIS_REST_URL or KV_REST_API_URL is required');
	if (!token) throw new Error('UPSTASH_REDIS_REST_TOKEN or KV_REST_API_TOKEN is required');
	const client = new Redis({ url, token });
	const prefix = env.KEY_PREFIX ?? DEFAULT_KEY_PREFIX;
	return { client, prefix };
}

/**
 * Build the physical Upstash key from a logical key by prepending the prefix.
 * @param {RedisHandle} handle
 * @param {string} logicalKey
 * @returns {string}
 */
export function pkey(handle, logicalKey) {
	return `${handle.prefix}${logicalKey}`;
}
