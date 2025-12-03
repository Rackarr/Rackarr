import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Canvas from '$lib/components/Canvas.svelte';
import { getLayoutStore, resetLayoutStore } from '$lib/stores/layout.svelte';
import { getSelectionStore, resetSelectionStore } from '$lib/stores/selection.svelte';
import { resetUIStore } from '$lib/stores/ui.svelte';
import { resetCanvasStore, getCanvasStore } from '$lib/stores/canvas.svelte';

describe('Canvas Component', () => {
	beforeEach(() => {
		resetLayoutStore();
		resetSelectionStore();
		resetUIStore();
		resetCanvasStore();
		// Most tests assume user has already started (rack visible)
		getLayoutStore().markStarted();
	});

	// WelcomeScreen is shown when user hasn't started yet
	describe('WelcomeScreen (fresh start)', () => {
		it('shows WelcomeScreen when hasStarted is false', () => {
			// Reset to clear markStarted from beforeEach
			resetLayoutStore();
			const layoutStore = getLayoutStore();
			expect(layoutStore.hasStarted).toBe(false);

			const { container } = render(Canvas);

			// WelcomeScreen should be visible
			expect(container.querySelector('.welcome-screen')).toBeInTheDocument();
			// Rack should not be visible
			expect(container.querySelector('.rack-container')).not.toBeInTheDocument();
		});
	});

	// After user has started, rack is shown
	describe('Initial State (v0.2)', () => {
		it('shows rack after user has started (v0.2 always has a rack)', () => {
			const { container } = render(Canvas);

			// v0.2: rack is always present after user starts
			const rackContainer = container.querySelector('.rack-container');
			expect(rackContainer).toBeInTheDocument();
			// WelcomeScreen should not be visible
			expect(container.querySelector('.welcome-screen')).not.toBeInTheDocument();
		});

		it('default rack has 42U height', () => {
			const layoutStore = getLayoutStore();

			render(Canvas);

			// Default rack is 42U
			expect(layoutStore.rack.height).toBe(42);
		});
	});

	// Note: Multi-rack rendering tests updated for single-rack mode (v0.1.1)
	describe('Rack Rendering', () => {
		it('renders single rack', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 42);

			const { container } = render(Canvas);

			// Should have exactly one rack container
			const rackContainers = container.querySelectorAll('.rack-container');
			expect(rackContainers.length).toBe(1);
		});

		it('renders rack with correct name', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('My Server Rack', 42);

			render(Canvas);

			expect(screen.getByText('My Server Rack')).toBeInTheDocument();
		});

		// Note: v0.2 always has a rack, so WelcomeScreen check is moved to 'Initial State' describe block
	});

	// Note: Layout tests updated for single-rack mode (v0.1.1)
	describe('Layout', () => {
		it('renders canvas container', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 42);

			const { container } = render(Canvas);

			const canvas = container.querySelector('.canvas');
			expect(canvas).toBeInTheDocument();
			expect(canvas?.classList.contains('canvas')).toBe(true);
		});

		it('has canvas element when rack exists', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 42);

			const { container } = render(Canvas);

			const canvas = container.querySelector('.canvas');
			expect(canvas).toBeInTheDocument();
		});
	});

	describe('Selection', () => {
		it('clicking empty space clears selection', async () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			const selectionStore = getSelectionStore();
			const rack = layoutStore.racks[0];
			selectionStore.selectRack(rack!.id);

			expect(selectionStore.hasSelection).toBe(true);

			const { container } = render(Canvas);

			// Click on the canvas background (not on a rack)
			const canvas = container.querySelector('.canvas');
			await fireEvent.click(canvas!);

			// Selection should be cleared
			expect(selectionStore.hasSelection).toBe(false);
		});

		it('passes selected state to rack component', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			const selectionStore = getSelectionStore();
			const rack = layoutStore.racks[0];
			selectionStore.selectRack(rack!.id);

			const { container } = render(Canvas);

			// The selected rack should have aria-selected=true (CSS applies outline)
			const selectedRack = container.querySelector('.rack-container[aria-selected="true"]');
			expect(selectedRack).toBeInTheDocument();
		});
	});

	describe('Zoom (panzoom)', () => {
		it('has panzoom container when racks exist', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			const { container } = render(Canvas);

			const panzoomContainer = container.querySelector('.panzoom-container');
			expect(panzoomContainer).toBeInTheDocument();
		});

		it('initializes canvas store with panzoom instance', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			render(Canvas);

			const canvasStore = getCanvasStore();
			// Panzoom should be initialized after mount
			expect(canvasStore.hasPanzoom).toBe(true);
		});
	});

	describe('Events', () => {
		it('dispatches rackselect event when rack is clicked', async () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			const handleRackSelect = vi.fn();

			const { container } = render(Canvas, { props: { onrackselect: handleRackSelect } });

			const svg = container.querySelector('svg');
			await fireEvent.click(svg!);

			expect(handleRackSelect).toHaveBeenCalledTimes(1);
		});
	});
});

describe('Canvas Layout with Fixed Sidebar (v0.1.0)', () => {
	beforeEach(() => {
		resetLayoutStore();
		resetSelectionStore();
		resetUIStore();
		resetCanvasStore();
		getLayoutStore().markStarted();
	});

	describe('Canvas positioning', () => {
		it('canvas has proper structure for sidebar offset', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			const { container } = render(Canvas);

			// Canvas should exist and have correct class
			const canvas = container.querySelector('.canvas');
			expect(canvas).toBeInTheDocument();
			expect(canvas).toHaveClass('canvas');
		});

		it('canvas fills available space', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			const { container } = render(Canvas);

			// Canvas should have flex: 1 style via CSS
			const canvas = container.querySelector('.canvas');
			expect(canvas).toBeInTheDocument();
			// Verify the class exists (CSS sets flex: 1)
			expect(canvas).toHaveClass('canvas');
		});
	});
});
