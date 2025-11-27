<!--
  DevicePalette Component
  Displays the device library with search and category grouping
-->
<script lang="ts">
	import { getLayoutStore } from '$lib/stores/layout.svelte';
	import {
		searchDevices,
		groupDevicesByCategory,
		getCategoryDisplayName
	} from '$lib/utils/deviceFilters';
	import DevicePaletteItem from './DevicePaletteItem.svelte';
	import type { Device } from '$lib/types';

	interface Props {
		onadddevice?: () => void;
		ondeviceselect?: (event: CustomEvent<{ device: Device }>) => void;
	}

	let { onadddevice, ondeviceselect }: Props = $props();

	const layoutStore = getLayoutStore();

	// Search state
	let searchQuery = $state('');

	// Filtered and grouped devices
	const filteredDevices = $derived(searchDevices(layoutStore.deviceLibrary, searchQuery));
	const groupedDevices = $derived(groupDevicesByCategory(filteredDevices));
	const hasDevices = $derived(layoutStore.deviceLibrary.length > 0);
	const hasResults = $derived(filteredDevices.length > 0);

	function handleAddDevice() {
		onadddevice?.();
	}

	function handleDeviceSelect(event: CustomEvent<{ device: Device }>) {
		ondeviceselect?.(event);
	}
</script>

<div class="device-palette">
	<!-- Search -->
	<div class="search-container">
		<input
			type="search"
			class="search-input"
			placeholder="Search devices..."
			bind:value={searchQuery}
			aria-label="Search devices"
		/>
	</div>

	<!-- Device List -->
	<div class="device-list">
		{#if !hasDevices}
			<div class="empty-state">
				<p class="empty-message">No devices in library</p>
				<p class="empty-hint">Add a device to get started</p>
			</div>
		{:else if !hasResults}
			<div class="empty-state">
				<p class="empty-message">No devices match your search</p>
			</div>
		{:else}
			{#each [...groupedDevices.entries()] as [category, devices] (category)}
				<div class="category-group">
					<h3 class="category-header">{getCategoryDisplayName(category)}</h3>
					<div class="category-devices">
						{#each devices as device (device.id)}
							<DevicePaletteItem {device} onselect={handleDeviceSelect} />
						{/each}
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<!-- Add Device Button -->
	<div class="actions">
		<button class="add-device-button" type="button" onclick={handleAddDevice}>
			<span class="add-icon">+</span>
			Add Device
		</button>
	</div>
</div>

<style>
	.device-palette {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	.search-container {
		padding: 12px;
		border-bottom: 1px solid var(--colour-border, #333333);
	}

	.search-input {
		width: 100%;
		padding: 8px 12px;
		font-size: 13px;
		color: var(--colour-text, #ffffff);
		background-color: var(--colour-input-bg, #2d2d2d);
		border: 1px solid var(--colour-border, #404040);
		border-radius: 4px;
		outline: none;
		transition: border-color 0.15s ease;
	}

	.search-input::placeholder {
		color: var(--colour-text-secondary, #808080);
	}

	.search-input:focus {
		border-color: var(--colour-selection, #0066ff);
	}

	.device-list {
		flex: 1;
		overflow-y: auto;
		padding: 8px 0;
	}

	.category-group {
		margin-bottom: 8px;
	}

	.category-header {
		margin: 0;
		padding: 8px 12px 4px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--colour-text-secondary, #808080);
	}

	.category-devices {
		display: flex;
		flex-direction: column;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 24px;
		text-align: center;
	}

	.empty-message {
		margin: 0;
		font-size: 14px;
		color: var(--colour-text, #ffffff);
	}

	.empty-hint {
		margin: 4px 0 0;
		font-size: 12px;
		color: var(--colour-text-secondary, #808080);
	}

	.actions {
		padding: 12px;
		border-top: 1px solid var(--colour-border, #333333);
	}

	.add-device-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		width: 100%;
		padding: 10px 16px;
		font-size: 13px;
		font-weight: 500;
		color: #ffffff;
		background-color: var(--colour-selection, #0066ff);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			transform 0.1s ease;
	}

	.add-device-button:hover {
		background-color: var(--colour-selection-hover, #0055dd);
	}

	.add-device-button:active {
		transform: scale(0.98);
	}

	.add-device-button:focus {
		outline: 2px solid var(--colour-selection, #0066ff);
		outline-offset: 2px;
	}

	.add-icon {
		font-size: 16px;
		font-weight: bold;
	}
</style>
