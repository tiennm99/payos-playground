import { fail } from '@sveltejs/kit';
import { savePayment } from '$lib/server/store.js';
import { env } from '$env/dynamic/public';

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();

		const amount = Number(data.get('amount'));
		const description = String(data.get('description') ?? '').slice(0, 25);
		const buyerName = String(data.get('buyerName') ?? '') || undefined;
		const buyerEmail = String(data.get('buyerEmail') ?? '') || undefined;
		const buyerPhone = String(data.get('buyerPhone') ?? '') || undefined;

		if (!amount || amount < 1000) {
			return fail(400, { error: 'Amount must be at least 1,000 VND.' });
		}
		if (!description) {
			return fail(400, { error: 'Description is required.' });
		}

		// Generate a unique order code — PayOS requires a positive integer
		// Date.now() returns a 13-digit ms timestamp; *1000+rand fits in 2^53 (≤9.007e15)
		const orderCode = Date.now() * 1000 + Math.floor(Math.random() * 1000);

		const baseUrl = env.PUBLIC_BASE_URL ?? `${new URL(request.url).origin}`;
		const returnUrl = `${baseUrl}/payment/return`;
		const cancelUrl = `${baseUrl}/payment/cancel`;

		try {
			const paymentLink = await locals.payos.paymentRequests.create({
				orderCode,
				amount,
				description,
				buyerName,
				buyerEmail,
				buyerPhone,
				returnUrl,
				cancelUrl
			});

			await savePayment(locals.redis, orderCode, {
				status: 'PENDING',
				amount,
				description,
				checkoutUrl: paymentLink.checkoutUrl,
				qrCode: paymentLink.qrCode,
				createdAt: Date.now()
			});

			return {
				checkoutUrl: paymentLink.checkoutUrl,
				qrCode: paymentLink.qrCode ?? null
			};
		} catch (/** @type {unknown} */ err) {
			const message = err instanceof Error ? err.message : String(err);
			return fail(500, { error: message });
		}
	}
};
