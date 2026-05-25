// See https://svelte.dev/docs/kit/types#app.d.ts
import type { PayOS } from '@payos/node';
import type { RedisHandle } from '$lib/server/redis.js';

declare global {
	namespace App {
		interface Locals {
			redis: RedisHandle;
			payos: PayOS;
		}
	}
}

export {};
