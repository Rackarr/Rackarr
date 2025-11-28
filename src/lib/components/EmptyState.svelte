<!--
  EmptyState Component
  Displayed when no racks exist in the layout
-->
<script lang="ts">
	interface Props {
		onnewrack?: () => void;
	}

	let { onnewrack }: Props = $props();

	function handleNewRack() {
		onnewrack?.();
	}
</script>

<div class="empty-state">
	<div class="empty-state-content">
		<svg
			class="empty-state-icon"
			width="64"
			height="64"
			viewBox="0 0 64 64"
			fill="none"
			aria-hidden="true"
		>
			<!-- Simplified rack icon -->
			<rect
				x="16"
				y="8"
				width="32"
				height="48"
				rx="2"
				stroke="currentColor"
				stroke-width="2"
				fill="none"
			/>
			<!-- Horizontal lines representing U divisions -->
			<line x1="16" y1="20" x2="48" y2="20" stroke="currentColor" stroke-width="1" opacity="0.5" />
			<line x1="16" y1="32" x2="48" y2="32" stroke="currentColor" stroke-width="1" opacity="0.5" />
			<line x1="16" y1="44" x2="48" y2="44" stroke="currentColor" stroke-width="1" opacity="0.5" />
		</svg>

		<h2 class="empty-state-title">No racks yet</h2>
		<p class="empty-state-subtitle">Create your first rack to start designing your layout</p>

		<button class="empty-state-button" type="button" onclick={handleNewRack}>New Rack</button>
	</div>
</div>

<style>
	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		min-height: 300px;
	}

	.empty-state-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		text-align: center;
		padding: 32px;
	}

	.empty-state-icon {
		color: var(--colour-text-secondary, #a0a0a0);
		opacity: 0.6;
	}

	.empty-state-title {
		margin: 0;
		font-size: 24px;
		font-weight: 600;
		color: var(--colour-text, #ffffff);
	}

	.empty-state-subtitle {
		margin: 0;
		font-size: 14px;
		color: var(--colour-text-secondary, #a0a0a0);
		max-width: 280px;
	}

	.empty-state-button {
		margin-top: 8px;
		padding: 12px 24px;
		font-size: 14px;
		font-weight: 500;
		color: #ffffff;
		background-color: var(--colour-selection, #0066ff);
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			transform 0.1s ease;
	}

	.empty-state-button:hover {
		background-color: var(--colour-selection-hover, #0055dd);
	}

	.empty-state-button:active {
		transform: scale(0.98);
	}

	.empty-state-button:focus {
		outline: 2px solid var(--colour-selection, #0066ff);
		outline-offset: 2px;
	}
</style>
