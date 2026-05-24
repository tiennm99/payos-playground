<script>
	import { enhance } from '$app/forms';

	/** @type {{ form?: { checkoutUrl?: string, qrCode?: string, error?: string } }} */
	let { form } = $props();
</script>

<svelte:head>
	<title>Create Payment — PayOS Playground</title>
</svelte:head>

<h1>Create a Payment</h1>

<div class="card">
	<form method="POST" use:enhance>
		<div class="field">
			<label for="amount">Amount (VND)</label>
			<input id="amount" name="amount" type="number" min="1000" value="10000" required />
		</div>

		<div class="field">
			<label for="description">Description</label>
			<input
				id="description"
				name="description"
				type="text"
				value="PayOS demo"
				maxlength="25"
				required
			/>
			<span class="hint">Max 25 characters (PayOS limit)</span>
		</div>

		<div class="field">
			<label for="buyerName">Buyer Name <span class="optional">(optional)</span></label>
			<input id="buyerName" name="buyerName" type="text" />
		</div>

		<div class="field">
			<label for="buyerEmail">Buyer Email <span class="optional">(optional)</span></label>
			<input id="buyerEmail" name="buyerEmail" type="email" />
		</div>

		<div class="field">
			<label for="buyerPhone">Buyer Phone <span class="optional">(optional)</span></label>
			<input id="buyerPhone" name="buyerPhone" type="tel" />
		</div>

		<button type="submit" class="btn-primary">Create Payment Link</button>
	</form>
</div>

{#if form?.error}
	<div class="alert alert-error">
		<strong>Error:</strong>
		{form.error}
	</div>
{/if}

{#if form?.checkoutUrl}
	<div class="card result">
		<h2>Payment Created</h2>

		{#if form.qrCode}
			<div class="qr-wrapper">
				<img src={form.qrCode} alt="Payment QR Code" class="qr-image" />
			</div>
		{/if}

		<a href={form.checkoutUrl} target="_blank" rel="noopener noreferrer" class="btn-primary">
			Open Checkout Page
		</a>

		<p class="checkout-url">
			<code>{form.checkoutUrl}</code>
		</p>
	</div>
{/if}

<style>
	h1 {
		margin: 0 0 1.5rem;
		font-size: 1.6rem;
	}

	.card {
		background: white;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
		margin-bottom: 1.5rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		margin-bottom: 1rem;
	}

	label {
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: 0.35rem;
		color: #495057;
	}

	.optional {
		font-weight: 400;
		color: #adb5bd;
	}

	.hint {
		font-size: 0.775rem;
		color: #868e96;
		margin-top: 0.25rem;
	}

	input {
		padding: 0.5rem 0.75rem;
		border: 1px solid #ced4da;
		border-radius: 4px;
		font-size: 1rem;
		transition: border-color 0.15s;
	}

	input:focus {
		outline: none;
		border-color: #0d6efd;
		box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15);
	}

	.btn-primary {
		display: inline-block;
		padding: 0.6rem 1.25rem;
		background: #0d6efd;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		text-decoration: none;
		transition: background 0.15s;
		margin-top: 0.5rem;
	}

	.btn-primary:hover {
		background: #0b5ed7;
	}

	.alert {
		padding: 0.875rem 1rem;
		border-radius: 4px;
		margin-bottom: 1rem;
	}

	.alert-error {
		background: #fff5f5;
		border: 1px solid #f5c6cb;
		color: #842029;
	}

	.result h2 {
		margin: 0 0 1rem;
		font-size: 1.2rem;
	}

	.qr-wrapper {
		margin-bottom: 1rem;
	}

	.qr-image {
		max-width: 240px;
		display: block;
		border: 1px solid #dee2e6;
		border-radius: 4px;
	}

	.checkout-url {
		margin-top: 1rem;
		word-break: break-all;
		font-size: 0.85rem;
		color: #6c757d;
	}

	code {
		background: #f8f9fa;
		padding: 0.1em 0.3em;
		border-radius: 3px;
	}
</style>
