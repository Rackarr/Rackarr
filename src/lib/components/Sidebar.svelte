<!--
  Sidebar Component
  Fixed sidebar that's always visible (no toggle)
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		side: 'left' | 'right';
		title?: string;
		children?: Snippet;
	}

	let { side, title, children }: Props = $props();
</script>

<aside class="sidebar sidebar-{side}" aria-label={title ?? 'Sidebar'}>
	{#if title}
		<div class="sidebar-header">
			<h2 class="sidebar-title">{title}</h2>
		</div>
	{/if}
	<div class="sidebar-content">
		{#if children}
			{@render children()}
		{/if}
	</div>
</aside>

<style>
	.sidebar {
		position: fixed;
		top: var(--toolbar-height, 56px);
		bottom: 0;
		width: var(--sidebar-width, 300px);
		background: var(--colour-sidebar-bg, var(--colour-bg));
		border-right: 1px solid var(--colour-border);
		display: flex;
		flex-direction: column;
		z-index: var(--z-sidebar, 10);
	}

	.sidebar-left {
		left: 0;
		border-right: 1px solid var(--colour-border);
		border-left: none;
	}

	.sidebar-right {
		right: 0;
		border-left: 1px solid var(--colour-border);
		border-right: none;
	}

	.sidebar-header {
		padding: 16px;
		border-bottom: 1px solid var(--colour-border);
		flex-shrink: 0;
	}

	.sidebar-title {
		margin: 0;
		font-size: 16px;
		font-weight: 600;
		color: var(--colour-text);
	}

	.sidebar-content {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
	}
</style>
