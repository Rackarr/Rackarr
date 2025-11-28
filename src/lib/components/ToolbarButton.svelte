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
		width: 36px;
		height: 36px;
		border-radius: 6px;
		background: transparent;
		color: var(--colour-text);
		transition:
			background-color var(--transition-fast),
			color var(--transition-fast);
	}

	.toolbar-button:hover:not(:disabled) {
		background: var(--colour-surface-hover);
	}

	.toolbar-button:focus-visible {
		outline: 2px solid var(--colour-selection);
		outline-offset: 2px;
	}

	.toolbar-button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.toolbar-button.active {
		background: var(--colour-selection);
		color: #ffffff;
	}

	.toolbar-button.active:hover:not(:disabled) {
		background: var(--colour-selection);
		filter: brightness(1.1);
	}
</style>
