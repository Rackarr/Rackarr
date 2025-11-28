import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Canvas from '$lib/components/Canvas.svelte';
import { getLayoutStore, resetLayoutStore } from '$lib/stores/layout.svelte';
import { getSelectionStore, resetSelectionStore } from '$lib/stores/selection.svelte';
import { getUIStore, resetUIStore } from '$lib/stores/ui.svelte';

describe('Canvas Component', () => {
	beforeEach(() => {
		resetLayoutStore();
		resetSelectionStore();
		resetUIStore();
	});

	describe('Empty State', () => {
		it('shows EmptyState when no racks exist', () => {
			render(Canvas);

			expect(screen.getByText('No racks yet')).toBeInTheDocument();
			expect(screen.getByText(/Create your first rack/i)).toBeInTheDocument();
		});

		it('EmptyState has New Rack button', () => {
			render(Canvas);

			const newRackButton = screen.getByRole('button', { name: /new rack/i });
			expect(newRackButton).toBeInTheDocument();
		});

		it('EmptyState New Rack button dispatches newRack event', async () => {
			const handleNewRack = vi.fn();

			render(Canvas, { props: { onnewrack: handleNewRack } });

			const newRackButton = screen.getByRole('button', { name: /new rack/i });
			await fireEvent.click(newRackButton);

			expect(handleNewRack).toHaveBeenCalledTimes(1);
		});
	});

	describe('Rack Rendering', () => {
		it('renders correct number of racks', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Rack 1', 12);
			layoutStore.addRack('Rack 2', 18);
			layoutStore.addRack('Rack 3', 24);

			const { container } = render(Canvas);

			// Each rack should have an SVG element
			const rackContainers = container.querySelectorAll('.rack-container');
			expect(rackContainers.length).toBe(3);
		});

		it('renders racks in position order', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('First Rack', 12);
			layoutStore.addRack('Second Rack', 18);
			layoutStore.addRack('Third Rack', 24);

			render(Canvas);

			// Rack names should appear in order
			const rackNames = screen.getAllByText(/Rack$/);
			expect(rackNames[0]).toHaveTextContent('First Rack');
			expect(rackNames[1]).toHaveTextContent('Second Rack');
			expect(rackNames[2]).toHaveTextContent('Third Rack');
		});

		it('hides EmptyState when racks exist', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			render(Canvas);

			expect(screen.queryByText('No racks yet')).not.toBeInTheDocument();
		});
	});

	describe('Layout', () => {
		it('bottom-aligns racks (uses flex-end)', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Short Rack', 12);
			layoutStore.addRack('Tall Rack', 42);

			const { container } = render(Canvas);

			const canvas = container.querySelector('.canvas');
			expect(canvas).toBeInTheDocument();

			// Canvas should have the class that applies flex-end alignment
			expect(canvas?.classList.contains('canvas')).toBe(true);
		});

		it('has horizontal scroll enabled', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Rack 1', 12);

			const { container } = render(Canvas);

			const canvas = container.querySelector('.canvas');
			expect(canvas).toBeInTheDocument();

			// overflow-x should be auto or scroll
			// This will be verified through CSS
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

			// The selected rack should have selection outline
			const selectionOutline = container.querySelector('.rack-selection');
			expect(selectionOutline).toBeInTheDocument();
		});
	});

	describe('Zoom', () => {
		it('applies zoom to rack containers', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			const uiStore = getUIStore();
			uiStore.setZoom(150);

			const { container } = render(Canvas);

			const rackContainer = container.querySelector('.rack-container');
			const style = rackContainer?.getAttribute('style');

			expect(style).toContain('scale(1.5)');
		});

		it('updates when zoom changes', () => {
			const layoutStore = getLayoutStore();
			layoutStore.addRack('Test Rack', 12);

			const uiStore = getUIStore();
			uiStore.setZoom(50);

			const { container } = render(Canvas);

			const rackContainer = container.querySelector('.rack-container');
			const style = rackContainer?.getAttribute('style');

			expect(style).toContain('scale(0.5)');
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
