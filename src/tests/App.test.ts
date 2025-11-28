import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/svelte';
import App from '../App.svelte';
import { resetLayoutStore, getLayoutStore } from '$lib/stores/layout.svelte';
import { resetSelectionStore, getSelectionStore } from '$lib/stores/selection.svelte';
import { resetUIStore } from '$lib/stores/ui.svelte';

describe('App Component', () => {
	beforeEach(() => {
		resetLayoutStore();
		resetSelectionStore();
		resetUIStore();
		// Note: resetUIStore applies the theme to the document
	});

	afterEach(() => {
		cleanup();
	});

	describe('Layout Structure', () => {
		it('renders toolbar', () => {
			render(App);
			// Toolbar should have the logo
			expect(screen.getByText('Rackarr')).toBeInTheDocument();
			// And main action buttons - use getAllByRole since there's also a button in empty state
			const newRackButtons = screen.getAllByRole('button', { name: /new rack/i });
			expect(newRackButtons.length).toBeGreaterThanOrEqual(1);
		});

		it('renders canvas', () => {
			render(App);
			// Canvas shows empty state when no racks
			expect(screen.getByText('No racks yet')).toBeInTheDocument();
		});

		it('renders with correct layout structure', () => {
			render(App);
			// Main container should exist
			const main = document.querySelector('.app-layout');
			expect(main).toBeInTheDocument();
		});
	});

	describe('Palette Drawer', () => {
		it('palette drawer toggles with toolbar button', async () => {
			render(App);

			const paletteBtn = screen.getByRole('button', { name: /device palette/i });

			// Initially closed - drawer should not be visible
			const drawer = document.querySelector('.drawer-left');
			expect(drawer).not.toHaveClass('open');

			// Click to open
			await fireEvent.click(paletteBtn);
			expect(drawer).toHaveClass('open');

			// Click to close
			await fireEvent.click(paletteBtn);
			expect(drawer).not.toHaveClass('open');
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
			render(App);

			// Initial zoom should be 100%
			expect(screen.getByText('100%')).toBeInTheDocument();

			// Click zoom in
			const zoomInBtn = screen.getByRole('button', { name: /zoom in/i });
			await fireEvent.click(zoomInBtn);

			// Should increase by 25%
			expect(screen.getByText('125%')).toBeInTheDocument();
		});

		it('zoom out updates zoom level', async () => {
			render(App);

			// Start at 100%
			expect(screen.getByText('100%')).toBeInTheDocument();

			// Click zoom out
			const zoomOutBtn = screen.getByRole('button', { name: /zoom out/i });
			await fireEvent.click(zoomOutBtn);

			// Should decrease by 25%
			expect(screen.getByText('75%')).toBeInTheDocument();
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
		it('new rack button creates a rack via empty state', async () => {
			const layoutStore = getLayoutStore();

			render(App);

			// Initially no racks
			expect(layoutStore.rackCount).toBe(0);

			// Click the "New Rack" button in empty state (there are 2, use the one in empty state)
			const emptyStateBtn = document.querySelector('.empty-state-button') as HTMLButtonElement;
			expect(emptyStateBtn).toBeInTheDocument();
			await fireEvent.click(emptyStateBtn);

			// Should have created a rack
			expect(layoutStore.rackCount).toBe(1);
		});
	});

	describe('Delete Action', () => {
		it('delete button removes selected rack', async () => {
			const layoutStore = getLayoutStore();
			const selectionStore = getSelectionStore();

			// Add a rack
			layoutStore.addRack('Test Rack', 42);
			const rack = layoutStore.racks[0];
			selectionStore.selectRack(rack!.id);

			render(App);

			expect(layoutStore.rackCount).toBe(1);

			// Click delete button in toolbar (not in edit panel)
			// The toolbar button has aria-label="Delete" while edit panel has "Delete rack"
			const toolbarDeleteBtn = document.querySelector(
				'.toolbar-center button[aria-label="Delete"]'
			) as HTMLButtonElement;
			expect(toolbarDeleteBtn).toBeInTheDocument();
			await fireEvent.click(toolbarDeleteBtn);

			// Rack should be deleted
			expect(layoutStore.rackCount).toBe(0);
		});
	});
});
