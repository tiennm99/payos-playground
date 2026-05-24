import { listPayments } from '$lib/server/store.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	try {
		const payments = await listPayments(locals.redis);
		return { payments, warning: null };
	} catch (/** @type {unknown} */ err) {
		const message = err instanceof Error ? err.message : String(err);
		// If Redis env vars are missing (local dev without creds), degrade gracefully
		if (
			message.includes('UPSTASH_REDIS_REST_URL') ||
			message.includes('UPSTASH_REDIS_REST_TOKEN') ||
			message.includes('undefined') ||
			message.includes('fetch')
		) {
			return { payments: [], warning: 'Upstash not configured — set env vars to persist payments.' };
		}
		return { payments: [], warning: `Redis error: ${message}` };
	}
}
