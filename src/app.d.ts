// See https://svelte.dev/docs/kit/types#app.d.ts
import type { Redis } from '@upstash/redis';
import type { PayOS } from '@payos/node';

declare global {
	namespace App {
		interface Locals {
			redis: Redis;
			payos: PayOS;
		}
	}
}

export {};
