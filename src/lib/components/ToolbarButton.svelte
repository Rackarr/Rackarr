<!--
  ToolbarButton Component
  Reusable button for the toolbar with icon, label, and state management
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		disabled?: boolean;
		active?: boolean;
		expanded?: boolean;
		tooltip?: string;
		onclick?: () => void;
		children?: Snippet;
	}

	let {
		label,
		disabled = false,
		active = false,
		expanded,
		tooltip,
		onclick,
		children
	}: Props = $props();

	// Use tooltip if provided, otherwise fall back to label for title
	const titleText = $derived(tooltip ?? label);

	function handleClick() {
		if (!disabled && onclick) {
			onclick();
		}
	}
</script>

<button
	type="button"
	class="toolbar-button"
	class:active
	aria-label={label}
	aria-pressed={active !== undefined && expanded === undefined ? active : undefined}
	aria-expanded={expanded !== undefined ? expanded : undefined}
	title={titleText}
	{disabled}
	onclick={handleClick}
>
	{#if children}
		{@render children()}
	{/if}
</button>

<style>
	.toolbar-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		width: 37px; /* 32px + 15% */
		height: 37px;
		padding: var(--space-2);
		border: none;
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--colour-text);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out);
	}

	/* Hover state */
	.toolbar-button:hover:not(:disabled) {
		background-color: var(--colour-surface-hover);
	}

	/* Focus state - CRITICAL for accessibility */
	.toolbar-button:focus-visible {
		outline: none;
		box-shadow:
			0 0 0 2px var(--colour-bg),
			0 0 0 4px var(--colour-focus-ring);
	}

	/* Active/pressed state */
	.toolbar-button:active:not(:disabled) {
		transform: scale(0.97);
		background-color: var(--colour-surface-active);
	}

	/* Toggle active state */
	.toolbar-button.active {
		background-color: color-mix(in srgb, var(--colour-selection) 20%, transparent);
		color: var(--colour-selection);
	}

	.toolbar-button.active:hover:not(:disabled) {
		background-color: color-mix(in srgb, var(--colour-selection) 30%, transparent);
	}

	/* Disabled state */
	.toolbar-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
