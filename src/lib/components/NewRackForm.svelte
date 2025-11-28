<!--
  NewRackForm Component
  Form dialog for creating a new rack
-->
<script lang="ts">
	import Dialog from './Dialog.svelte';
	import { COMMON_RACK_HEIGHTS, MIN_RACK_HEIGHT, MAX_RACK_HEIGHT } from '$lib/types/constants';

	interface Props {
		open: boolean;
		rackCount?: number;
		oncreate?: (data: { name: string; height: number }) => void;
		oncancel?: () => void;
	}

	let { open, rackCount = 0, oncreate, oncancel }: Props = $props();

	// Form state
	let name = $state('');
	let selectedHeight = $state(42);
	let isCustomHeight = $state(false);
	let customHeight = $state(42);

	// Validation errors
	let nameError = $state('');
	let heightError = $state('');

	// Reset form when dialog opens
	$effect(() => {
		if (open) {
			name = `Rack ${rackCount + 1}`;
			selectedHeight = 42;
			isCustomHeight = false;
			customHeight = 42;
			nameError = '';
			heightError = '';
		}
	});

	function selectPresetHeight(height: number) {
		isCustomHeight = false;
		selectedHeight = height;
		heightError = '';
	}

	function selectCustomHeight() {
		isCustomHeight = true;
		heightError = '';
	}

	function getCurrentHeight(): number {
		return isCustomHeight ? customHeight : selectedHeight;
	}

	function validate(): boolean {
		let valid = true;
		nameError = '';
		heightError = '';

		if (!name.trim()) {
			nameError = 'Name is required';
			valid = false;
		}

		const height = getCurrentHeight();
		if (height < MIN_RACK_HEIGHT || height > MAX_RACK_HEIGHT) {
			heightError = `Height must be between ${MIN_RACK_HEIGHT} and ${MAX_RACK_HEIGHT}`;
			valid = false;
		}

		return valid;
	}

	function handleSubmit() {
		if (validate()) {
			oncreate?.({ name: name.trim(), height: getCurrentHeight() });
		}
	}

	function handleCancel() {
		oncancel?.();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleSubmit();
		}
	}
</script>

<Dialog {open} title="New Rack" onclose={handleCancel}>
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<form class="new-rack-form" onsubmit={(e) => e.preventDefault()} onkeydown={handleKeyDown}>
		<div class="form-group">
			<label for="rack-name">Rack Name</label>
			<input
				type="text"
				id="rack-name"
				bind:value={name}
				placeholder="e.g., Main Server Rack"
				class:error={nameError}
			/>
			{#if nameError}
				<span class="error-message">{nameError}</span>
			{/if}
		</div>

		<div class="form-group">
			<span class="form-label">Height</span>
			<div class="height-buttons" role="group" aria-label="Rack height">
				{#each COMMON_RACK_HEIGHTS as height (height)}
					<button
						type="button"
						class="height-btn"
						class:selected={!isCustomHeight && selectedHeight === height}
						onclick={() => selectPresetHeight(height)}
					>
						{height}U
					</button>
				{/each}
				<button
					type="button"
					class="height-btn"
					class:selected={isCustomHeight}
					onclick={selectCustomHeight}
				>
					Custom
				</button>
			</div>
			{#if isCustomHeight}
				<div class="custom-height-input">
					<label for="custom-height" class="sr-only">Custom Height</label>
					<input
						type="number"
						id="custom-height"
						aria-label="Custom height"
						bind:value={customHeight}
						min={MIN_RACK_HEIGHT}
						max={MAX_RACK_HEIGHT}
						class:error={heightError}
					/>
					<span class="unit">U</span>
				</div>
			{/if}
			{#if heightError}
				<span class="error-message">{heightError}</span>
			{/if}
		</div>

		<div class="form-actions">
			<button type="button" class="btn btn-secondary" onclick={handleCancel}> Cancel </button>
			<button type="submit" class="btn btn-primary" onclick={handleSubmit}> Create </button>
		</div>
	</form>
</Dialog>

<style>
	.new-rack-form {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-group label,
	.form-group .form-label {
		font-weight: 500;
		color: var(--colour-text);
	}

	.form-group input[type='text'],
	.form-group input[type='number'] {
		padding: 10px 12px;
		background: var(--colour-input-bg, var(--colour-bg));
		border: 1px solid var(--colour-border);
		border-radius: 6px;
		color: var(--colour-text);
		font-size: 14px;
	}

	.form-group input:focus {
		outline: none;
		border-color: var(--colour-selection);
		box-shadow: 0 0 0 2px var(--colour-selection-bg, rgba(74, 144, 217, 0.2));
	}

	.form-group input.error {
		border-color: var(--colour-error, #e74c3c);
	}

	.error-message {
		font-size: 13px;
		color: var(--colour-error, #e74c3c);
	}

	.height-buttons {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.height-btn {
		padding: 8px 16px;
		background: var(--colour-button-bg, #3a3a3a);
		border: 1px solid var(--colour-border);
		border-radius: 6px;
		color: var(--colour-text);
		font-size: 14px;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.height-btn:hover {
		background: var(--colour-button-hover);
	}

	.height-btn.selected {
		background: var(--colour-selection);
		border-color: var(--colour-selection);
		color: white;
	}

	.custom-height-input {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 8px;
	}

	.custom-height-input input {
		width: 80px;
		padding: 8px 12px;
		background: var(--colour-input-bg, var(--colour-bg));
		border: 1px solid var(--colour-border);
		border-radius: 6px;
		color: var(--colour-text);
		font-size: 14px;
	}

	.custom-height-input .unit {
		color: var(--colour-text-muted);
		font-size: 14px;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		margin-top: 8px;
	}

	.btn {
		padding: 10px 20px;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.btn-secondary {
		background: var(--colour-button-bg, #3a3a3a);
		color: var(--colour-text);
	}

	.btn-secondary:hover {
		background: var(--colour-button-hover);
	}

	.btn-primary {
		background: var(--colour-selection);
		color: white;
	}

	.btn-primary:hover {
		background: var(--colour-selection-hover, #3a7bbf);
	}
</style>
