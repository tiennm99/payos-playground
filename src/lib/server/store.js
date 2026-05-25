/** @import { RedisHandle } from './redis.js' */
import { pkey } from './redis.js';

const RECENT_KEY = 'payments:recent';
const PAYMENT_PREFIX = 'payment:';

/**
 * @typedef {Object} PaymentRecord
 * @property {string|number} orderCode
 * @property {'PENDING'|'PAID'|'CANCELLED'|'FAILED'|string} status
 * @property {number} amount
 * @property {string} description
 * @property {string} [checkoutUrl]
 * @property {string} [qrCode]
 * @property {number} createdAt
 * @property {string} [payosCode]
 * @property {string} [payosDesc]
 */

/**
 * Persists a payment record in Redis.
 * - Hash key: `payment:{orderCode}` → JSON string
 * - Sorted set `payments:recent` scored by timestamp for ordered listing
 *
 * @param {RedisHandle} handle
 * @param {string|number} orderCode
 * @param {Omit<PaymentRecord, 'orderCode'>} payment
 * @returns {Promise<void>}
 */
export async function savePayment(handle, orderCode, payment) {
	const record = { orderCode, ...payment };
	await handle.client.set(pkey(handle, `${PAYMENT_PREFIX}${orderCode}`), JSON.stringify(record));
	await handle.client.zadd(pkey(handle, RECENT_KEY), {
		score: payment.createdAt ?? Date.now(),
		member: String(orderCode)
	});
}

/**
 * Retrieves a single payment record by orderCode.
 * @param {RedisHandle} handle
 * @param {string|number} orderCode
 * @returns {Promise<PaymentRecord|null>}
 */
export async function getPayment(handle, orderCode) {
	const raw = await handle.client.get(pkey(handle, `${PAYMENT_PREFIX}${orderCode}`));
	if (!raw) return null;
	return /** @type {PaymentRecord} */ (typeof raw === 'string' ? JSON.parse(raw) : raw);
}

/**
 * Returns the most recent payments, newest first.
 * @param {RedisHandle} handle
 * @param {number} [limit]
 * @returns {Promise<PaymentRecord[]>}
 */
export async function listPayments(handle, limit = 20) {
	// zrange with REV returns highest scores first (newest timestamps first)
	const orderCodes = await handle.client.zrange(pkey(handle, RECENT_KEY), 0, limit - 1, {
		rev: true
	});
	if (!orderCodes || orderCodes.length === 0) return [];

	const records = await Promise.all(
		orderCodes.map((code) => getPayment(handle, /** @type {string} */ (code)))
	);

	return /** @type {PaymentRecord[]} */ (records.filter(Boolean));
}
