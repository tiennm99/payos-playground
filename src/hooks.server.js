import { createRedis } from '$lib/server/redis.js';
import { createPayOS } from '$lib/server/payos.js';

/** @type {import('$lib/server/redis.js').RedisHandle | null} */
let _redis = null;

/** @type {import('@payos/node').PayOS | null} */
let _payos = null;

/**
 * Lazy singleton for the Upstash Redis handle (client + key prefix).
 * Not instantiated at module level so `pnpm build` works without env vars.
 * @returns {import('$lib/server/redis.js').RedisHandle}
 */
function getRedis() {
	if (!_redis) _redis = createRedis();
	return _redis;
}

/**
 * Lazy singleton for PayOS client.
 * Not instantiated at module level so `pnpm build` works without env vars.
 * @returns {import('@payos/node').PayOS}
 */
function getPayOS() {
	if (!_payos) _payos = createPayOS();
	return _payos;
}

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	event.locals.redis = getRedis();
	event.locals.payos = getPayOS();
	return resolve(event);
}
