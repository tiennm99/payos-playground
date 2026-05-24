import { json } from '@sveltejs/kit';
import { getPayment, savePayment } from '$lib/server/store.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }) {
	/** @type {unknown} */
	let body;

	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const payload = /** @type {Record<string, unknown>} */ (body ?? {});

	// PayOS sends a verification ping when you first save the webhook URL in the
	// dashboard. The ping body has no `data` field — just acknowledge it.
	if (!payload.data) {
		return json({ received: true });
	}

	/** @type {import('@payos/node').WebhookData} */
	let webhookData;

	try {
		// webhooks.verify() takes the full Webhook object and returns WebhookData
		webhookData = await locals.payos.webhooks.verify(
			/** @type {import('@payos/node').Webhook} */ (payload)
		);
	} catch (/** @type {unknown} */ err) {
		const message = err instanceof Error ? err.message : String(err);
		console.error('[webhook] verification failed:', message);
		return json({ error: 'Invalid signature' }, { status: 401 });
	}

	// webhookData.code: '00' = success/paid, anything else = failed/cancelled
	const orderCode = webhookData.orderCode;
	const status = webhookData.code === '00' ? 'PAID' : 'CANCELLED';

	if (orderCode) {
		try {
			const existing = await getPayment(locals.redis, orderCode);
			if (existing) {
				await savePayment(locals.redis, orderCode, { ...existing, status });
			}
		} catch (/** @type {unknown} */ err) {
			console.error('[webhook] redis update failed:', err instanceof Error ? err.message : err);
		}
	}

	return json({ received: true });
}
