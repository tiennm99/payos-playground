import { Redis } from '@upstash/redis';
import { env } from '$env/dynamic/private';

/**
 * Creates a new Upstash Redis client instance using runtime environment variables.
 * Called lazily — never at module import time — so build succeeds without env vars.
 * @returns {Redis}
 */
export function createRedis() {
	return new Redis({
		url: env.UPSTASH_REDIS_REST_URL,
		token: env.UPSTASH_REDIS_REST_TOKEN
	});
}
