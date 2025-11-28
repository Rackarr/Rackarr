<!--
  DevicePaletteItem Component
  Displays a single device in the device palette
  Draggable for placement into racks
-->
<script lang="ts">
	import type { Device } from '$lib/types';
	import CategoryIcon from './CategoryIcon.svelte';
	import { createPaletteDragData, serializeDragData } from '$lib/utils/dragdrop';

	interface Props {
		device: Device;
		onselect?: (event: CustomEvent<{ device: Device }>) => void;
	}

	let { device, onselect }: Props = $props();

	// Track dragging state for visual feedback
	let isDragging = $state(false);

	function handleClick() {
		onselect?.(new CustomEvent('select', { detail: { device } }));
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onselect?.(new CustomEvent('select', { detail: { device } }));
		}
	}

	function handleDragStart(event: DragEvent) {
		if (!event.dataTransfer) return;

		const dragData = createPaletteDragData(device);
		event.dataTransfer.setData('application/json', serializeDragData(dragData));
		event.dataTransfer.effectAllowed = 'copy';

		isDragging = true;
	}

	function handleDragEnd() {
		isDragging = false;
	}
</script>

<div
	class="device-palette-item"
	class:dragging={isDragging}
	role="button"
	tabindex="0"
	draggable="true"
	onclick={handleClick}
	onkeydown={handleKeyDown}
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
	aria-label="{device.name}, {device.height}U {device.category}"
>
	<div class="item-content">
		<div class="colour-swatch" style="background-color: {device.colour}"></div>
		<div class="item-info">
			<span class="device-name">{device.name}</span>
			<span class="device-meta">
				<CategoryIcon category={device.category} size={12} />
				<span class="height-badge">{device.height}U</span>
			</span>
		</div>
	</div>
</div>

<style>
	.device-palette-item {
		display: flex;
		align-items: center;
		padding: 8px 12px;
		cursor: pointer;
		border-radius: 4px;
		transition: background-color 0.15s ease;
	}

	.device-palette-item:hover {
		background-color: var(--colour-hover, rgba(255, 255, 255, 0.05));
	}

	.device-palette-item.dragging {
		opacity: 0.5;
	}

	.device-palette-item:focus {
		outline: 2px solid var(--colour-selection, #0066ff);
		outline-offset: -2px;
	}

	.item-content {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
	}

	.colour-swatch {
		width: 16px;
		height: 16px;
		border-radius: 3px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		flex-shrink: 0;
	}

	.item-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
		min-width: 0;
	}

	.device-name {
		font-size: 13px;
		font-weight: 500;
		color: var(--colour-text, #ffffff);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.device-meta {
		display: flex;
		align-items: center;
		gap: 6px;
		color: var(--colour-text-secondary, #a0a0a0);
	}

	.height-badge {
		font-size: 11px;
		font-weight: 500;
		padding: 1px 4px;
		background-color: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
	}
</style>
