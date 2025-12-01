<!--
  Toolbar Component
  Main application toolbar with actions, zoom controls, and theme toggle
-->
<script lang="ts">
	import ToolbarButton from './ToolbarButton.svelte';
	import {
		IconPlus,
		IconPalette,
		IconSave,
		IconLoad,
		IconExport,
		IconTrash,
		IconZoomIn,
		IconZoomOut,
		IconFitAll,
		IconSun,
		IconMoon,
		IconHelp
	} from './icons';
	import { getCanvasStore } from '$lib/stores/canvas.svelte';

	interface Props {
		hasSelection?: boolean;
		paletteOpen?: boolean;
		theme?: 'dark' | 'light';
		onnewrack?: () => void;
		ontogglepalette?: () => void;
		onsave?: () => void;
		onload?: () => void;
		onexport?: () => void;
		ondelete?: () => void;
		onzoomin?: () => void;
		onzoomout?: () => void;
		onfitall?: () => void;
		ontoggletheme?: () => void;
		onhelp?: () => void;
	}

	let {
		hasSelection = false,
		paletteOpen = false,
		theme = 'dark',
		onnewrack,
		ontogglepalette,
		onsave,
		onload,
		onexport,
		ondelete,
		onzoomin,
		onzoomout,
		onfitall,
		ontoggletheme,
		onhelp
	}: Props = $props();

	const canvasStore = getCanvasStore();
</script>

<header class="toolbar">
	<!-- Left section: Device Library toggle -->
	<div class="toolbar-section toolbar-left">
		<button
			type="button"
			class="library-toggle"
			class:active={paletteOpen}
			onclick={ontogglepalette}
			aria-label="Device Library"
			aria-expanded={paletteOpen}
			aria-controls="device-library-drawer"
		>
			<IconPalette />
			<span class="library-text">Device Library</span>
		</button>
	</div>

	<!-- Center section: Main actions -->
	<div class="toolbar-section toolbar-center">
		<ToolbarButton label="New Rack" onclick={onnewrack}>
			<IconPlus />
		</ToolbarButton>

		<div class="separator" aria-hidden="true"></div>

		<ToolbarButton label="Save" onclick={onsave}>
			<IconSave />
		</ToolbarButton>

		<ToolbarButton label="Load" onclick={onload}>
			<IconLoad />
		</ToolbarButton>

		<ToolbarButton label="Export" onclick={onexport}>
			<IconExport />
		</ToolbarButton>

		<div class="separator" aria-hidden="true"></div>

		<ToolbarButton label="Delete" disabled={!hasSelection} onclick={ondelete}>
			<IconTrash />
		</ToolbarButton>
	</div>

	<!-- Right section: Zoom, theme, help -->
	<div class="toolbar-section toolbar-right">
		<ToolbarButton label="Zoom Out" disabled={!canvasStore.canZoomOut} onclick={onzoomout}>
			<IconZoomOut />
		</ToolbarButton>

		<span class="zoom-display">{canvasStore.zoomPercentage}%</span>

		<ToolbarButton label="Zoom In" disabled={!canvasStore.canZoomIn} onclick={onzoomin}>
			<IconZoomIn />
		</ToolbarButton>

		<ToolbarButton label="Fit All" onclick={onfitall}>
			<IconFitAll />
		</ToolbarButton>

		<div class="separator" aria-hidden="true"></div>

		<ToolbarButton label="Toggle Theme" onclick={ontoggletheme}>
			{#if theme === 'dark'}
				<IconSun />
			{:else}
				<IconMoon />
			{/if}
		</ToolbarButton>

		<ToolbarButton label="Help" onclick={onhelp}>
			<IconHelp />
		</ToolbarButton>
	</div>
</header>

<style>
	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: var(--toolbar-height);
		padding: 0 var(--space-4);
		background: var(--colour-toolbar-bg, var(--toolbar-bg));
		border-bottom: 1px solid var(--colour-toolbar-border, var(--toolbar-border));
		flex-shrink: 0;
	}

	.toolbar-section {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.toolbar-left {
		flex: 0 0 auto;
	}

	.toolbar-center {
		flex: 1;
		justify-content: center;
	}

	.toolbar-right {
		flex: 0 0 auto;
	}

	.library-toggle {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		border: 1px solid var(--colour-border);
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--colour-text);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
	}

	.library-toggle:hover {
		background: var(--colour-surface-hover);
		border-color: var(--colour-selection);
	}

	.library-toggle:focus {
		outline: 2px solid var(--colour-focus-ring);
		outline-offset: var(--space-1);
	}

	.library-toggle.active {
		background: var(--colour-selection);
		border-color: var(--colour-selection);
		color: var(--neutral-50);
	}

	.library-text {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
	}

	.separator {
		width: 1px;
		height: var(--space-6);
		background: var(--colour-border);
		margin: 0 var(--space-2);
	}

	.zoom-display {
		min-width: var(--space-12);
		text-align: center;
		font-size: var(--font-size-sm);
		color: var(--colour-text-muted);
		font-variant-numeric: tabular-nums;
	}
</style>
