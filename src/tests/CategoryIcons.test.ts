import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import CategoryIcon from '$lib/components/CategoryIcon.svelte';
import type { DeviceCategory } from '$lib/types';

const ALL_CATEGORIES: DeviceCategory[] = [
	'server',
	'network',
	'patch-panel',
	'power',
	'storage',
	'kvm',
	'av-media',
	'cooling',
	'blank',
	'other'
];

describe('CategoryIcon Component', () => {
	describe('Rendering', () => {
		it.each(ALL_CATEGORIES)('renders correct icon for "%s" category', (category) => {
			const { container } = render(CategoryIcon, { props: { category } });
			const svg = container.querySelector('svg');
			expect(svg).toBeInTheDocument();
			// Each category should render some SVG content
			expect(svg?.children.length).toBeGreaterThan(0);
		});

		it('renders at default size (16px)', () => {
			const { container } = render(CategoryIcon, { props: { category: 'server' } });
			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('width', '16');
			expect(svg).toHaveAttribute('height', '16');
		});

		it('renders at specified size', () => {
			const { container } = render(CategoryIcon, { props: { category: 'server', size: 24 } });
			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('width', '24');
			expect(svg).toHaveAttribute('height', '24');
		});

		it('renders at small size (12px)', () => {
			const { container } = render(CategoryIcon, { props: { category: 'network', size: 12 } });
			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('width', '12');
			expect(svg).toHaveAttribute('height', '12');
		});
	});

	describe('Accessibility', () => {
		it('has aria-hidden for decorative icons', () => {
			const { container } = render(CategoryIcon, { props: { category: 'server' } });
			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('aria-hidden', 'true');
		});

		it('uses currentColor for fill to inherit text colour', () => {
			const { container } = render(CategoryIcon, { props: { category: 'server' } });
			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('fill', 'currentColor');
		});
	});

	describe('Category-specific icons', () => {
		it('server icon has horizontal lines (rectangles)', () => {
			const { container } = render(CategoryIcon, { props: { category: 'server' } });
			const rects = container.querySelectorAll('rect');
			expect(rects.length).toBeGreaterThanOrEqual(2);
		});

		it('network icon has connected nodes (circles and lines)', () => {
			const { container } = render(CategoryIcon, { props: { category: 'network' } });
			const circles = container.querySelectorAll('circle');
			const lines = container.querySelectorAll('line');
			expect(circles.length).toBeGreaterThanOrEqual(2);
			expect(lines.length).toBeGreaterThanOrEqual(1);
		});

		it('patch-panel icon has grid of ports (circles)', () => {
			const { container } = render(CategoryIcon, { props: { category: 'patch-panel' } });
			const circles = container.querySelectorAll('circle');
			expect(circles.length).toBeGreaterThanOrEqual(4);
		});

		it('power icon has lightning bolt shape (polygon)', () => {
			const { container } = render(CategoryIcon, { props: { category: 'power' } });
			const polygon = container.querySelector('polygon');
			expect(polygon).toBeInTheDocument();
		});

		it('storage icon has stacked drives (rectangles)', () => {
			const { container } = render(CategoryIcon, { props: { category: 'storage' } });
			const rects = container.querySelectorAll('rect');
			expect(rects.length).toBeGreaterThanOrEqual(3);
		});

		it('kvm icon has monitor and keyboard (rectangles)', () => {
			const { container } = render(CategoryIcon, { props: { category: 'kvm' } });
			const rects = container.querySelectorAll('rect');
			expect(rects.length).toBeGreaterThanOrEqual(2);
		});

		it('av-media icon has speaker shape (rect and path)', () => {
			const { container } = render(CategoryIcon, { props: { category: 'av-media' } });
			const rect = container.querySelector('rect');
			const path = container.querySelector('path');
			expect(rect).toBeInTheDocument();
			expect(path).toBeInTheDocument();
		});

		it('cooling icon has fan blades (circle and lines)', () => {
			const { container } = render(CategoryIcon, { props: { category: 'cooling' } });
			const circles = container.querySelectorAll('circle');
			const lines = container.querySelectorAll('line');
			expect(circles.length).toBeGreaterThanOrEqual(1);
			expect(lines.length).toBeGreaterThanOrEqual(2);
		});

		it('blank icon has empty rectangle (stroke only)', () => {
			const { container } = render(CategoryIcon, { props: { category: 'blank' } });
			const rect = container.querySelector('rect');
			expect(rect).toBeInTheDocument();
			expect(rect).toHaveAttribute('fill', 'none');
		});

		it('other icon has question mark (circle with text)', () => {
			const { container } = render(CategoryIcon, { props: { category: 'other' } });
			const circle = container.querySelector('circle');
			const text = container.querySelector('text');
			expect(circle).toBeInTheDocument();
			expect(text).toBeInTheDocument();
			expect(text?.textContent).toBe('?');
		});
	});

	describe('Unknown category fallback', () => {
		it('shows fallback icon for unknown category', () => {
			// Cast to DeviceCategory to test fallback behaviour
			const { container } = render(CategoryIcon, {
				props: { category: 'unknown-type' as unknown as DeviceCategory }
			});
			const svg = container.querySelector('svg');
			expect(svg).toBeInTheDocument();
			// Should fall through to 'other' case (question mark)
			const text = container.querySelector('text');
			expect(text?.textContent).toBe('?');
		});
	});

	describe('CSS class', () => {
		it('has category-icon class', () => {
			const { container } = render(CategoryIcon, { props: { category: 'server' } });
			const svg = container.querySelector('svg');
			expect(svg).toHaveClass('category-icon');
		});
	});
});
