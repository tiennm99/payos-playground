import { PayOS } from '@payos/node';
import { env } from '$env/dynamic/private';

/**
 * Creates a new PayOS client instance using runtime environment variables.
 * Called lazily — never at module import time — so build succeeds without env vars.
 * @returns {PayOS}
 */
export function createPayOS() {
	return new PayOS({
		clientId: env.PAYOS_CLIENT_ID,
		apiKey: env.PAYOS_API_KEY,
		checksumKey: env.PAYOS_CHECKSUM_KEY
	});
}
