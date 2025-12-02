<!--
  Rackarr - Rack Layout Designer
  Main application component
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import Canvas from '$lib/components/Canvas.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import DevicePalette from '$lib/components/DevicePalette.svelte';
	import EditPanel from '$lib/components/EditPanel.svelte';
	import NewRackForm from '$lib/components/NewRackForm.svelte';
	import AddDeviceForm from '$lib/components/AddDeviceForm.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import ConfirmReplaceDialog from '$lib/components/ConfirmReplaceDialog.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import KeyboardHandler from '$lib/components/KeyboardHandler.svelte';
	import ExportDialog from '$lib/components/ExportDialog.svelte';
	import HelpPanel from '$lib/components/HelpPanel.svelte';
	import { getLayoutStore } from '$lib/stores/layout.svelte';
	import { getSelectionStore } from '$lib/stores/selection.svelte';
	import { getUIStore } from '$lib/stores/ui.svelte';
	import { getCanvasStore } from '$lib/stores/canvas.svelte';
	import { getToastStore } from '$lib/stores/toast.svelte';
	import { getImageStore } from '$lib/stores/images.svelte';
	import type { ImageData } from '$lib/types/images';
	import { downloadLayout, openFilePicker, readLayoutFile } from '$lib/utils/file';
	import {
		generateExportSVG,
		exportAsSVG,
		exportAsPNG,
		exportAsJPEG,
		downloadBlob,
		generateExportFilename
	} from '$lib/utils/export';
	import type { ExportOptions } from '$lib/types';

	const layoutStore = getLayoutStore();
	const selectionStore = getSelectionStore();
	const uiStore = getUIStore();
	const canvasStore = getCanvasStore();
	const toastStore = getToastStore();
	const imageStore = getImageStore();

	// Dialog state
	let newRackFormOpen = $state(false);
	let addDeviceFormOpen = $state(false);
	let confirmDeleteOpen = $state(false);
	let exportDialogOpen = $state(false);
	let helpPanelOpen = $state(false);
	let deleteTarget: { type: 'rack' | 'device'; name: string } | null = $state(null);
	let showReplaceDialog = $state(false);
	let pendingSaveFirst = $state(false);

	// Toolbar event handlers
	function handleNewRack() {
		if (layoutStore.racks.length > 0) {
			showReplaceDialog = true;
		} else {
			newRackFormOpen = true;
		}
	}

	function handleNewRackCreate(data: {
		name: string;
		height: number;
		width: number;
		form_factor: import('$lib/types').FormFactor;
		desc_units: boolean;
		starting_unit: number;
	}) {
		layoutStore.addRack(
			data.name,
			data.height,
			data.width,
			data.form_factor,
			data.desc_units,
			data.starting_unit
		);
		newRackFormOpen = false;
	}

	function handleNewRackCancel() {
		newRackFormOpen = false;
	}

	// Replace dialog handlers (single-rack mode)
	function handleSaveFirst() {
		showReplaceDialog = false;
		pendingSaveFirst = true;
		handleSave();
	}

	function handleReplace() {
		showReplaceDialog = false;
		layoutStore.resetLayout();
		newRackFormOpen = true;
	}

	function handleCancelReplace() {
		showReplaceDialog = false;
	}

	function handleSave() {
		downloadLayout(layoutStore.layout);
		layoutStore.markClean();
		toastStore.showToast('Layout saved', 'success', 3000);

		// After save, if pendingSaveFirst, reset and open new rack form
		if (pendingSaveFirst) {
			pendingSaveFirst = false;
			layoutStore.resetLayout();
			newRackFormOpen = true;
		}
	}

	async function handleLoad() {
		try {
			const file = await openFilePicker();
			if (!file) {
				// User cancelled
				return;
			}

			const loadedLayout = await readLayoutFile(file);
			const originalRackCount = layoutStore.loadLayout(loadedLayout);
			layoutStore.markClean();
			selectionStore.clearSelection();

			if (originalRackCount > 1) {
				toastStore.showToast(
					`Layout contained ${originalRackCount} racks. Loaded first rack only.`,
					'warning'
				);
			} else {
				toastStore.showToast('Layout loaded successfully', 'success');
			}
		} catch (error) {
			console.error('Failed to load layout:', error);
			toastStore.showToast(
				error instanceof Error ? error.message : 'Failed to load layout file',
				'error'
			);
		}
	}

	function handleExport() {
		if (layoutStore.racks.length === 0) {
			toastStore.showToast('No racks to export', 'warning');
			return;
		}
		exportDialogOpen = true;
	}

	async function handleExportSubmit(options: ExportOptions) {
		exportDialogOpen = false;

		try {
			// Determine which racks to export
			const racksToExport =
				options.scope === 'selected' && selectionStore.selectedId
					? layoutStore.racks.filter((r) => r.id === selectionStore.selectedId)
					: layoutStore.racks;

			// Generate the SVG
			const svg = generateExportSVG(racksToExport, layoutStore.deviceLibrary, options);

			// Generate filename
			const filename = generateExportFilename(layoutStore.layout.name, options.format);

			// Export based on format
			if (options.format === 'svg') {
				const svgString = exportAsSVG(svg);
				const blob = new Blob([svgString], { type: 'image/svg+xml' });
				downloadBlob(blob, filename);
				toastStore.showToast('SVG exported successfully', 'success');
			} else if (options.format === 'png') {
				const blob = await exportAsPNG(svg);
				downloadBlob(blob, filename);
				toastStore.showToast('PNG exported successfully', 'success');
			} else if (options.format === 'jpeg') {
				const blob = await exportAsJPEG(svg);
				downloadBlob(blob, filename);
				toastStore.showToast('JPEG exported successfully', 'success');
			} else if (options.format === 'pdf') {
				// PDF export will be implemented with jspdf library
				toastStore.showToast('PDF export not yet implemented', 'info');
			}
		} catch (error) {
			console.error('Export failed:', error);
			toastStore.showToast(error instanceof Error ? error.message : 'Export failed', 'error');
		}
	}

	function handleExportCancel() {
		exportDialogOpen = false;
	}

	function handleDelete() {
		if (selectionStore.isRackSelected && selectionStore.selectedId) {
			const rack = layoutStore.racks.find((r) => r.id === selectionStore.selectedId);
			if (rack) {
				deleteTarget = { type: 'rack', name: rack.name };
				confirmDeleteOpen = true;
			}
		} else if (selectionStore.isDeviceSelected) {
			if (selectionStore.selectedRackId !== null && selectionStore.selectedDeviceIndex !== null) {
				const rack = layoutStore.racks.find((r) => r.id === selectionStore.selectedRackId);
				if (rack && rack.devices[selectionStore.selectedDeviceIndex]) {
					const device = rack.devices[selectionStore.selectedDeviceIndex];
					const deviceDef = layoutStore.deviceLibrary.find((d) => d.id === device?.libraryId);
					deleteTarget = { type: 'device', name: deviceDef?.name || 'Device' };
					confirmDeleteOpen = true;
				}
			}
		}
	}

	function handleConfirmDelete() {
		if (deleteTarget?.type === 'rack' && selectionStore.selectedId) {
			layoutStore.deleteRack(selectionStore.selectedId);
			selectionStore.clearSelection();
		} else if (deleteTarget?.type === 'device') {
			if (selectionStore.selectedRackId !== null && selectionStore.selectedDeviceIndex !== null) {
				layoutStore.removeDeviceFromRack(
					selectionStore.selectedRackId,
					selectionStore.selectedDeviceIndex
				);
				selectionStore.clearSelection();
			}
		}
		confirmDeleteOpen = false;
		deleteTarget = null;
	}

	function handleCancelDelete() {
		confirmDeleteOpen = false;
		deleteTarget = null;
	}

	function handleZoomIn() {
		canvasStore.zoomIn();
	}

	function handleZoomOut() {
		canvasStore.zoomOut();
	}

	function handleFitAll() {
		canvasStore.fitAll(layoutStore.racks);
	}

	function handleToggleTheme() {
		uiStore.toggleTheme();
	}

	function handleHelp() {
		helpPanelOpen = true;
	}

	function handleHelpClose() {
		helpPanelOpen = false;
	}

	function handleAddDevice() {
		addDeviceFormOpen = true;
	}

	function handleAddDeviceCreate(data: {
		name: string;
		height: number;
		category: import('$lib/types').DeviceCategory;
		colour: string;
		notes: string;
		frontImage?: ImageData;
		rearImage?: ImageData;
	}) {
		const device = layoutStore.addDeviceToLibrary({
			name: data.name,
			height: data.height,
			category: data.category,
			colour: data.colour,
			notes: data.notes || undefined
		});

		// Store images if provided (v0.3.0)
		if (data.frontImage) {
			imageStore.setDeviceImage(device.id, 'front', data.frontImage);
		}
		if (data.rearImage) {
			imageStore.setDeviceImage(device.id, 'rear', data.rearImage);
		}

		addDeviceFormOpen = false;
	}

	function handleAddDeviceCancel() {
		addDeviceFormOpen = false;
	}

	// Beforeunload handler for unsaved changes
	function handleBeforeUnload(event: BeforeUnloadEvent) {
		if (layoutStore.isDirty) {
			event.preventDefault();
			// Modern browsers ignore custom messages, but we set it for legacy support
			event.returnValue = 'You have unsaved changes. Leave anyway?';
			return event.returnValue;
		}
	}

	onMount(() => {
		// Apply theme from storage (already done in ui store init)
		// Session restore will be implemented in a later phase
	});
</script>

<svelte:window onbeforeunload={handleBeforeUnload} />

<div class="app-layout">
	<Toolbar
		hasSelection={selectionStore.hasSelection}
		theme={uiStore.theme}
		onnewrack={handleNewRack}
		onsave={handleSave}
		onload={handleLoad}
		onexport={handleExport}
		ondelete={handleDelete}
		onzoomin={handleZoomIn}
		onzoomout={handleZoomOut}
		onfitall={handleFitAll}
		ontoggletheme={handleToggleTheme}
		onhelp={handleHelp}
	/>

	<main class="app-main">
		<Sidebar side="left" title="Device Library">
			<DevicePalette onadddevice={handleAddDevice} />
		</Sidebar>

		<Canvas onnewrack={handleNewRack} onload={handleLoad} />

		<EditPanel />
	</main>

	<NewRackForm
		open={newRackFormOpen}
		rackCount={layoutStore.rackCount}
		oncreate={handleNewRackCreate}
		oncancel={handleNewRackCancel}
	/>

	<AddDeviceForm
		open={addDeviceFormOpen}
		onadd={handleAddDeviceCreate}
		oncancel={handleAddDeviceCancel}
	/>

	<ConfirmDialog
		open={confirmDeleteOpen}
		title={deleteTarget?.type === 'rack' ? 'Delete Rack' : 'Remove Device'}
		message={deleteTarget?.type === 'rack'
			? `Are you sure you want to delete "${deleteTarget?.name}"? All devices in this rack will be removed.`
			: `Are you sure you want to remove "${deleteTarget?.name}" from this rack?`}
		confirmLabel={deleteTarget?.type === 'rack' ? 'Delete Rack' : 'Remove'}
		onconfirm={handleConfirmDelete}
		oncancel={handleCancelDelete}
	/>

	<ConfirmReplaceDialog
		open={showReplaceDialog}
		onSaveFirst={handleSaveFirst}
		onReplace={handleReplace}
		onCancel={handleCancelReplace}
	/>

	<ExportDialog
		open={exportDialogOpen}
		racks={layoutStore.racks}
		selectedRackId={selectionStore.isRackSelected ? selectionStore.selectedId : null}
		onexport={(e) => handleExportSubmit(e.detail)}
		oncancel={handleExportCancel}
	/>

	<HelpPanel open={helpPanelOpen} onclose={handleHelpClose} />

	<ToastContainer />

	<KeyboardHandler
		onsave={handleSave}
		onload={handleLoad}
		onexport={handleExport}
		ondelete={handleDelete}
		onfitall={handleFitAll}
		onhelp={handleHelp}
	/>
</div>

<style>
	.app-layout {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
	}

	.app-main {
		display: flex;
		flex: 1;
		position: relative;
		overflow: hidden;
		/* Account for fixed sidebar on left */
		margin-left: var(--sidebar-width, 300px);
	}
</style>
