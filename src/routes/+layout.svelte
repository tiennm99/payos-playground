<script>
	/** @type {{ children: import('svelte').Snippet }} */
	let { children } = $props();
</script>

<header>
	<div class="header-inner">
		<span class="title">PayOS Playground</span>
		<nav>
			<a href="/">Create Payment</a>
			<a href="/payments">Payment History</a>
		</nav>
	</div>
</header>

<main>
	{@render children()}
</main>

<style>
	:global(*, *::before, *::after) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		font-family: system-ui, -apple-system, sans-serif;
		background: #f8f9fa;
		color: #212529;
	}

	header {
		background: #0d6efd;
		color: white;
		padding: 0 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
	}

	.header-inner {
		max-width: 900px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 56px;
	}

	.title {
		font-size: 1.2rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	nav {
		display: flex;
		gap: 1.5rem;
	}

	nav a {
		color: rgba(255, 255, 255, 0.88);
		text-decoration: none;
		font-size: 0.95rem;
		transition: color 0.15s;
	}

	nav a:hover {
		color: white;
	}

	main {
		max-width: 900px;
		margin: 2rem auto;
		padding: 0 1.5rem;
	}
</style>
