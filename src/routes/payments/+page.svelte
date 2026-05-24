<script>
	/** @type {{ data: { payments: import('$lib/server/store.js').PaymentRecord[], warning: string | null } }} */
	let { data } = $props();
</script>

<svelte:head>
	<title>Payment History — PayOS Playground</title>
</svelte:head>

<h1>Payment History</h1>

{#if data.warning}
	<div class="alert alert-warning">{data.warning}</div>
{/if}

{#if data.payments.length === 0}
	<div class="empty">
		<p>No payments yet. <a href="/">Create one now.</a></p>
	</div>
{:else}
	<div class="table-wrapper">
		<table>
			<thead>
				<tr>
					<th>Order Code</th>
					<th>Amount (VND)</th>
					<th>Description</th>
					<th>Status</th>
					<th>Created At</th>
					<th>Link</th>
				</tr>
			</thead>
			<tbody>
				{#each data.payments as payment (payment.orderCode)}
					<tr>
						<td class="mono">{payment.orderCode}</td>
						<td class="amount">{Number(payment.amount).toLocaleString('vi-VN')}</td>
						<td>{payment.description}</td>
						<td>
							<span class="badge badge-{(payment.status ?? '').toLowerCase()}">
								{payment.status}
							</span>
						</td>
						<td>{new Date(payment.createdAt).toLocaleString('vi-VN')}</td>
						<td>
							{#if payment.status === 'PENDING' && payment.checkoutUrl}
								<a href={payment.checkoutUrl} target="_blank" rel="noopener noreferrer" class="link">
									Pay
								</a>
							{:else}
								—
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
	h1 {
		margin: 0 0 1.5rem;
		font-size: 1.6rem;
	}

	.alert {
		padding: 0.875rem 1rem;
		border-radius: 4px;
		margin-bottom: 1rem;
	}

	.alert-warning {
		background: #fff8e1;
		border: 1px solid #ffe082;
		color: #7c5e00;
	}

	.empty {
		background: white;
		border-radius: 8px;
		padding: 2.5rem;
		text-align: center;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
		color: #6c757d;
	}

	.empty a {
		color: #0d6efd;
	}

	.table-wrapper {
		background: white;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
	}

	th {
		background: #f8f9fa;
		padding: 0.75rem 1rem;
		text-align: left;
		font-weight: 600;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #6c757d;
		border-bottom: 1px solid #dee2e6;
		white-space: nowrap;
	}

	td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #f1f3f5;
		vertical-align: middle;
	}

	tr:last-child td {
		border-bottom: none;
	}

	tr:hover td {
		background: #f8f9fa;
	}

	.mono {
		font-family: ui-monospace, monospace;
		font-size: 0.85rem;
	}

	.amount {
		font-variant-numeric: tabular-nums;
		text-align: right;
	}

	.badge {
		display: inline-block;
		padding: 0.2em 0.6em;
		border-radius: 99px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.badge-pending {
		background: #fff3cd;
		color: #856404;
	}

	.badge-paid {
		background: #d1e7dd;
		color: #0a3622;
	}

	.badge-cancelled {
		background: #f8d7da;
		color: #58151c;
	}

	.link {
		color: #0d6efd;
		font-weight: 600;
		text-decoration: none;
	}

	.link:hover {
		text-decoration: underline;
	}
</style>
