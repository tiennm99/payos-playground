<script>
	import { page } from '$app/state';

	const params = $derived(page.url.searchParams);
	const orderCode = $derived(params.get('orderCode') ?? params.get('id') ?? 'N/A');
	const status = $derived(params.get('status') ?? 'PAID');
	const code = $derived(params.get('code') ?? '00');
</script>

<svelte:head>
	<title>Payment Successful — PayOS Playground</title>
</svelte:head>

<div class="result success">
	<div class="icon">&#10003;</div>
	<h1>Payment Successful</h1>
	<p>Your payment has been processed.</p>

	<dl class="details">
		<dt>Order Code</dt>
		<dd>{orderCode}</dd>
		<dt>Status</dt>
		<dd>{status}</dd>
		<dt>Code</dt>
		<dd>{code}</dd>
	</dl>

	<a href="/" class="btn">Create Another Payment</a>
	<a href="/payments" class="btn btn-outline">View Payment History</a>
</div>

<style>
	.result {
		background: white;
		border-radius: 8px;
		padding: 2.5rem 2rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
		text-align: center;
		max-width: 480px;
		margin: 0 auto;
	}

	.icon {
		font-size: 3rem;
		color: #198754;
		margin-bottom: 0.5rem;
		line-height: 1;
	}

	h1 {
		margin: 0 0 0.5rem;
		font-size: 1.5rem;
		color: #198754;
	}

	p {
		color: #6c757d;
		margin: 0 0 1.5rem;
	}

	dl {
		text-align: left;
		background: #f8f9fa;
		border-radius: 4px;
		padding: 1rem;
		margin-bottom: 1.5rem;
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.35rem 1rem;
	}

	dt {
		font-weight: 600;
		font-size: 0.85rem;
		color: #495057;
	}

	dd {
		margin: 0;
		font-size: 0.85rem;
		word-break: break-all;
	}

	.btn {
		display: inline-block;
		padding: 0.55rem 1.1rem;
		background: #0d6efd;
		color: white;
		border-radius: 4px;
		text-decoration: none;
		font-weight: 600;
		font-size: 0.9rem;
		margin: 0.25rem;
		transition: background 0.15s;
	}

	.btn:hover {
		background: #0b5ed7;
	}

	.btn-outline {
		background: transparent;
		border: 1px solid #0d6efd;
		color: #0d6efd;
	}

	.btn-outline:hover {
		background: #e7f1ff;
	}
</style>
