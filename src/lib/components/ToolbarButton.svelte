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
		onclick?: () => void;
		children?: Snippet;
	}

	let { label, disabled = false, active = false, expanded, onclick, children }: Props = $props();

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
	{disabled}
	onclick={handleClick}
>
	{#if children}
		{@render children()}
	{/if}
</button>

<style>
	.toolbar-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--space-8);
		height: var(--space-8);
		padding: var(--space-2);
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--colour-text);
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.toolbar-button:hover:not(:disabled) {
		background: var(--colour-surface-hover);
	}

	.toolbar-button:focus-visible {
		outline: 2px solid var(--colour-focus-ring);
		outline-offset: var(--space-1);
	}

	.toolbar-button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.toolbar-button.active {
		background: var(--colour-selection);
		color: var(--neutral-50);
	}

	.toolbar-button.active:hover:not(:disabled) {
		background: var(--colour-selection-hover);
	}
</style>
