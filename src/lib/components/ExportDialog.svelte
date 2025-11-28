<!--
  Export Dialog Component
  Allows user to configure export options for rack layouts
-->
<script lang="ts">
	import type {
		Rack,
		ExportFormat,
		ExportScope,
		ExportBackground,
		ExportOptions
	} from '$lib/types';
	import Dialog from './Dialog.svelte';

	interface Props {
		open: boolean;
		racks: Rack[];
		selectedRackId: string | null;
		onexport?: (event: CustomEvent<ExportOptions>) => void;
		oncancel?: () => void;
	}

	let { open, racks, selectedRackId, onexport, oncancel }: Props = $props();

	// Form state
	let format = $state<ExportFormat>('png');
	let scope = $state<ExportScope>('all');
	let includeNames = $state(true);
	let includeLegend = $state(false);
	let background = $state<ExportBackground>('dark');

	// Computed: Can select "selected rack" scope
	const canSelectRack = $derived(selectedRackId !== null);

	// Computed: Can select transparent background (only for SVG)
	const canSelectTransparent = $derived(format === 'svg');

	// Computed: Can export (has racks)
	const canExport = $derived(racks.length > 0);

	// Reset transparent background when switching away from SVG
	$effect(() => {
		if (!canSelectTransparent && background === 'transparent') {
			background = 'dark';
		}
	});

	// Reset scope to "all" if selected rack becomes unavailable
	$effect(() => {
		if (!canSelectRack && scope === 'selected') {
			scope = 'all';
		}
	});

	function handleExport() {
		const options: ExportOptions = {
			format,
			scope,
			includeNames,
			includeLegend,
			background
		};
		onexport?.(new CustomEvent('export', { detail: options }));
	}

	function handleCancel() {
		oncancel?.();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleCancel();
		}
	}

	// Add/remove event listener based on open state
	$effect(() => {
		if (open) {
			window.addEventListener('keydown', handleKeyDown);
			return () => {
				window.removeEventListener('keydown', handleKeyDown);
			};
		}
	});
</script>

<Dialog {open} title="Export" width="380px" onclose={handleCancel}>
	<div class="export-form">
		<div class="form-group">
			<label for="export-format">Format</label>
			<select id="export-format" bind:value={format}>
				<option value="png">PNG</option>
				<option value="jpeg">JPEG</option>
				<option value="svg">SVG</option>
				<option value="pdf">PDF</option>
			</select>
		</div>

		<div class="form-group">
			<label for="export-scope">Scope</label>
			<select id="export-scope" bind:value={scope}>
				<option value="all">All racks</option>
				<option value="selected" disabled={!canSelectRack}>Selected rack</option>
			</select>
		</div>

		<div class="form-group checkbox-group">
			<label>
				<input type="checkbox" bind:checked={includeNames} />
				Include rack names
			</label>
		</div>

		<div class="form-group checkbox-group">
			<label>
				<input type="checkbox" bind:checked={includeLegend} />
				Include legend
			</label>
		</div>

		<div class="form-group">
			<label for="export-background">Background</label>
			<select id="export-background" bind:value={background}>
				<option value="dark">Dark</option>
				<option value="light">Light</option>
				<option value="transparent" disabled={!canSelectTransparent}>Transparent</option>
			</select>
		</div>
	</div>

	<div class="dialog-actions">
		<button type="button" class="btn-secondary" onclick={handleCancel}>Cancel</button>
		<button type="button" class="btn-primary" onclick={handleExport} disabled={!canExport}>
			Export
		</button>
	</div>
</Dialog>

<style>
	.export-form {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 8px 0;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.form-group label {
		font-size: 14px;
		font-weight: 500;
		color: var(--colour-text, #ffffff);
	}

	.form-group select {
		padding: 8px 12px;
		border: 1px solid var(--colour-border, #404040);
		border-radius: 4px;
		background: var(--colour-panel, #2d2d2d);
		color: var(--colour-text, #ffffff);
		font-size: 14px;
		cursor: pointer;
	}

	.form-group select:focus {
		outline: 2px solid var(--colour-selection, #0066ff);
		outline-offset: 1px;
	}

	.form-group select option:disabled {
		color: var(--colour-text-muted, #808080);
	}

	.checkbox-group {
		flex-direction: row;
		align-items: center;
	}

	.checkbox-group label {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		font-weight: 400;
	}

	.checkbox-group input[type='checkbox'] {
		width: 16px;
		height: 16px;
		accent-color: var(--colour-selection, #0066ff);
		cursor: pointer;
	}

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		margin-top: 24px;
		padding-top: 16px;
		border-top: 1px solid var(--colour-border, #404040);
	}

	.btn-secondary,
	.btn-primary {
		padding: 8px 16px;
		border-radius: 4px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			opacity 0.15s ease;
	}

	.btn-secondary {
		background: transparent;
		border: 1px solid var(--colour-border, #404040);
		color: var(--colour-text, #ffffff);
	}

	.btn-secondary:hover {
		background: var(--colour-hover, #3d3d3d);
	}

	.btn-primary {
		background: var(--colour-selection, #0066ff);
		border: none;
		color: #ffffff;
	}

	.btn-primary:hover:not(:disabled) {
		background: #0055dd;
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
