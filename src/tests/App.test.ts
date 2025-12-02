import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/svelte';
import App from '../App.svelte';
import { resetLayoutStore, getLayoutStore } from '$lib/stores/layout.svelte';
import { resetSelectionStore, getSelectionStore } from '$lib/stores/selection.svelte';
import { resetUIStore } from '$lib/stores/ui.svelte';
import { resetCanvasStore, getCanvasStore } from '$lib/stores/canvas.svelte';

describe('App Component', () => {
	beforeEach(() => {
		resetLayoutStore();
		resetSelectionStore();
		resetUIStore();
		resetCanvasStore();
		// Note: resetUIStore applies the theme to the document
	});

	afterEach(() => {
		cleanup();
	});

	describe('Layout Structure', () => {
		it('renders toolbar', () => {
			render(App);
			// Toolbar should exist with action buttons
			// 'Rackarr' text appears in both toolbar and welcome screen
			const rackarrElements = screen.getAllByText('Rackarr');
			expect(rackarrElements.length).toBeGreaterThanOrEqual(1);
			// And main action buttons - use getAllByRole since there's also a button in welcome screen
			const newRackButtons = screen.getAllByRole('button', { name: /new rack/i });
			expect(newRackButtons.length).toBeGreaterThanOrEqual(1);
		});

		it('renders canvas with welcome screen when no racks', () => {
			render(App);
			// Canvas shows welcome screen when no racks
			expect(screen.getByText(/rack layout designer/i)).toBeInTheDocument();
		});

		it('renders with correct layout structure', () => {
			render(App);
			// Main container should exist
			const main = document.querySelector('.app-layout');
			expect(main).toBeInTheDocument();
		});
	});

	describe('Device Library Sidebar', () => {
		it('device library sidebar is always visible', () => {
			render(App);

			// Sidebar should always be visible (not a drawer that toggles)
			const sidebar = document.querySelector('aside.sidebar');
			expect(sidebar).toBeInTheDocument();
			expect(sidebar).toBeVisible();
		});

		it('sidebar contains DevicePalette', () => {
			render(App);

			// Look for DevicePalette content inside sidebar
			const sidebar = document.querySelector('aside.sidebar');
			expect(sidebar).toBeInTheDocument();

			// DevicePalette should be inside - look for category icons or device items
			const palette = sidebar?.querySelector('.device-palette');
			expect(palette).toBeInTheDocument();
		});

		it('there is no toggle button for device library in toolbar', () => {
			render(App);

			// There should be no button named exactly "Device Library" anymore
			// (there is still an "Import device library" button in the sidebar, which is different)
			const paletteBtn = screen.queryByRole('button', { name: /^device library$/i });
			expect(paletteBtn).not.toBeInTheDocument();
		});

		it('main area has proper grid/flex layout structure', () => {
			render(App);

			// App main should exist with proper structure
			const appMain = document.querySelector('.app-main');
			expect(appMain).toBeInTheDocument();
			// Should have the class that enables the layout
			expect(appMain).toHaveClass('app-main');
		});

		it('canvas exists alongside sidebar in main area', () => {
			render(App);

			// Both sidebar and canvas should exist in the main area
			const appMain = document.querySelector('.app-main');
			expect(appMain).toBeInTheDocument();

			// Check that canvas exists
			const canvas = document.querySelector('.canvas');
			expect(canvas).toBeInTheDocument();
		});
	});

	describe('Edit Panel', () => {
		it('edit panel opens when rack selected', async () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();

			// Add a rack first
			layoutStore.addRack('Test Rack', 42);
			const rack = layoutStore.racks[0];

			render(App);

			// Initially closed
			const rightDrawer = document.querySelector('.drawer-right');
			expect(rightDrawer).not.toHaveClass('open');

			// Select the rack
			selectionStore.selectRack(rack!.id);

			// Wait for the effect to open the drawer
			await waitFor(() => {
				expect(rightDrawer).toHaveClass('open');
			});
		});

		it('edit panel closes when selection cleared', async () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();

			// Add and select a rack
			layoutStore.addRack('Test Rack', 42);
			const rack = layoutStore.racks[0];
			selectionStore.selectRack(rack!.id);

			render(App);

			const rightDrawer = document.querySelector('.drawer-right');

			// Should be open initially (due to selection)
			await waitFor(() => {
				expect(rightDrawer).toHaveClass('open');
			});

			// Clear selection
			selectionStore.clearSelection();

			// Should close
			await waitFor(() => {
				expect(rightDrawer).not.toHaveClass('open');
			});
		});
	});

	describe('Theme Toggle', () => {
		it('theme toggle changes theme', async () => {
			render(App);

			const themeBtn = screen.getByRole('button', { name: /toggle theme/i });

			// Default theme is dark
			expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

			// Toggle to light
			await fireEvent.click(themeBtn);
			expect(document.documentElement.getAttribute('data-theme')).toBe('light');

			// Toggle back to dark
			await fireEvent.click(themeBtn);
			expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
		});
	});

	describe('Zoom Controls', () => {
		it('zoom in updates zoom level', async () => {
			// Need a rack so panzoom initializes (Canvas needs panzoom-container)
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			render(App);

			// Wait for panzoom to initialize
			const canvasStore = getCanvasStore();
			await waitFor(() => {
				expect(canvasStore.hasPanzoom).toBe(true);
			});

			// Initial zoom should be 100%
			expect(screen.getByText('100%')).toBeInTheDocument();

			// Click zoom in
			const zoomInBtn = screen.getByRole('button', { name: /zoom in/i });
			await fireEvent.click(zoomInBtn);

			// Should increase by 25%
			await waitFor(() => {
				expect(screen.getByText('125%')).toBeInTheDocument();
			});
		});

		it('zoom out updates zoom level', async () => {
			// Need a rack so panzoom initializes
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			render(App);

			// Wait for panzoom to initialize
			const canvasStore = getCanvasStore();
			await waitFor(() => {
				expect(canvasStore.hasPanzoom).toBe(true);
			});

			// Start at 100%
			expect(screen.getByText('100%')).toBeInTheDocument();

			// Click zoom out
			const zoomOutBtn = screen.getByRole('button', { name: /zoom out/i });
			await fireEvent.click(zoomOutBtn);

			// Should decrease by 25%
			await waitFor(() => {
				expect(screen.getByText('75%')).toBeInTheDocument();
			});
		});
	});

	describe('Beforeunload Handler', () => {
		it('shows confirmation when dirty and leaving page', () => {
			const layoutStore = getLayoutStore();

			render(App);

			// Make a change to trigger dirty state
			layoutStore.addRack('Test Rack', 42);
			expect(layoutStore.isDirty).toBe(true);

			// Create a beforeunload event
			const event = new Event('beforeunload', { cancelable: true });
			const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

			// Dispatch it
			window.dispatchEvent(event);

			// Should have called preventDefault
			expect(preventDefaultSpy).toHaveBeenCalled();
		});

		it('does not show confirmation when not dirty', () => {
			const layoutStore = getLayoutStore();

			render(App);

			// No changes made, should not be dirty
			expect(layoutStore.isDirty).toBe(false);

			// Create a beforeunload event
			const event = new Event('beforeunload', { cancelable: true });
			const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

			// Dispatch it
			window.dispatchEvent(event);

			// Should NOT have called preventDefault
			expect(preventDefaultSpy).not.toHaveBeenCalled();
		});
	});

	describe('New Rack Action', () => {
		it('new rack button opens form dialog', async () => {
			const { container } = render(App);

			// Click the "New Rack" button in welcome screen (primary button with btn-primary class)
			const welcomeScreen = container.querySelector('.welcome-screen');
			expect(welcomeScreen).toBeInTheDocument();
			const newRackBtn = welcomeScreen?.querySelector('.btn-primary') as HTMLButtonElement;
			expect(newRackBtn).toBeInTheDocument();
			await fireEvent.click(newRackBtn);

			// Should open the new rack form dialog
			const dialog = screen.getByRole('dialog');
			expect(dialog).toBeInTheDocument();
			// The dialog title should be "New Rack"
			expect(dialog.querySelector('.dialog-title')).toHaveTextContent('New Rack');
		});

		it('new rack form creates a rack when submitted', async () => {
			const layoutStore = getLayoutStore();

			const { container } = render(App);

			// Initially no racks
			expect(layoutStore.rackCount).toBe(0);

			// Click the "New Rack" button in welcome screen
			const welcomeScreen = container.querySelector('.welcome-screen');
			const newRackBtn = welcomeScreen?.querySelector('.btn-primary') as HTMLButtonElement;
			await fireEvent.click(newRackBtn);

			// Fill out the form
			const nameInput = screen.getByLabelText(/name/i);
			await fireEvent.input(nameInput, { target: { value: 'Test Rack' } });

			// Submit the form
			const createBtn = screen.getByRole('button', { name: /create/i });
			await fireEvent.click(createBtn);

			// Should have created a rack
			expect(layoutStore.rackCount).toBe(1);
			expect(layoutStore.racks[0]?.name).toBe('Test Rack');
		});
	});

	describe('Delete Action', () => {
		it('delete button opens confirmation dialog', async () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();

			// Add a rack
			layoutStore.addRack('Test Rack', 42);
			const rack = layoutStore.racks[0];
			selectionStore.selectRack(rack!.id);

			render(App);

			expect(layoutStore.rackCount).toBe(1);

			// Click delete button in toolbar
			const toolbarDeleteBtn = document.querySelector(
				'.toolbar-center button[aria-label="Delete"]'
			) as HTMLButtonElement;
			expect(toolbarDeleteBtn).toBeInTheDocument();
			await fireEvent.click(toolbarDeleteBtn);

			// Confirmation dialog should open
			const dialog = screen.getByRole('dialog');
			expect(dialog).toBeInTheDocument();
			expect(dialog.querySelector('.dialog-title')).toHaveTextContent('Delete Rack');
		});

		it('delete confirmation removes selected rack', async () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();

			// Add a rack
			layoutStore.addRack('Test Rack', 42);
			const rack = layoutStore.racks[0];
			selectionStore.selectRack(rack!.id);

			render(App);

			expect(layoutStore.rackCount).toBe(1);

			// Click delete button in toolbar
			const toolbarDeleteBtn = document.querySelector(
				'.toolbar-center button[aria-label="Delete"]'
			) as HTMLButtonElement;
			await fireEvent.click(toolbarDeleteBtn);

			// Confirm the deletion - find the button within the dialog
			const dialog = screen.getByRole('dialog');
			const confirmBtn = dialog.querySelector('.btn-destructive') as HTMLButtonElement;
			expect(confirmBtn).toBeInTheDocument();
			await fireEvent.click(confirmBtn);

			// Rack should be deleted
			expect(layoutStore.rackCount).toBe(0);
		});
	});
});
