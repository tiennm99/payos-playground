/** @import { Redis } from '@upstash/redis' */

const RECENT_KEY = 'payments:recent';
const PAYMENT_PREFIX = 'payment:';

/**
 * @typedef {Object} PaymentRecord
 * @property {string|number} orderCode
 * @property {'PENDING'|'PAID'|'CANCELLED'|string} status
 * @property {number} amount
 * @property {string} description
 * @property {string} [checkoutUrl]
 * @property {string} [qrCode]
 * @property {number} createdAt
 */

/**
 * Persists a payment record in Redis.
 * - Hash key: `payment:{orderCode}` → JSON string
 * - Sorted set `payments:recent` scored by timestamp for ordered listing
 *
 * @param {Redis} redis
 * @param {string|number} orderCode
 * @param {Omit<PaymentRecord, 'orderCode'>} payment
 * @returns {Promise<void>}
 */
export async function savePayment(redis, orderCode, payment) {
	const key = `${PAYMENT_PREFIX}${orderCode}`;
	const record = { orderCode, ...payment };
	await redis.set(key, JSON.stringify(record));
	await redis.zadd(RECENT_KEY, { score: payment.createdAt ?? Date.now(), member: String(orderCode) });
}

/**
 * Retrieves a single payment record by orderCode.
 * @param {Redis} redis
 * @param {string|number} orderCode
 * @returns {Promise<PaymentRecord|null>}
 */
export async function getPayment(redis, orderCode) {
	const key = `${PAYMENT_PREFIX}${orderCode}`;
	const raw = await redis.get(key);
	if (!raw) return null;
	return /** @type {PaymentRecord} */ (typeof raw === 'string' ? JSON.parse(raw) : raw);
}

/**
 * Returns the most recent payments, newest first.
 * @param {Redis} redis
 * @param {number} [limit]
 * @returns {Promise<PaymentRecord[]>}
 */
export async function listPayments(redis, limit = 20) {
	// zrange with REV returns highest scores first (newest timestamps first)
	const orderCodes = await redis.zrange(RECENT_KEY, 0, limit - 1, { rev: true });
	if (!orderCodes || orderCodes.length === 0) return [];

	const records = await Promise.all(
		orderCodes.map((code) => getPayment(redis, /** @type {string} */ (code)))
	);

	return /** @type {PaymentRecord[]} */ (records.filter(Boolean));
}
