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
	'shelf',
	'blank',
	'cable-management',
	'other'
];

describe('CategoryIcon Component', () => {
	describe('Rendering', () => {
		it.each(ALL_CATEGORIES)('renders Lucide icon for "%s" category', (category) => {
			const { container } = render(CategoryIcon, { props: { category } });
			const svg = container.querySelector('svg');
			expect(svg).toBeInTheDocument();
			// Lucide icons have class attribute containing 'lucide'
			expect(svg?.classList.toString()).toContain('lucide');
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
	});

	describe('Lucide icon mapping', () => {
		it('server category renders Server icon', () => {
			const { container } = render(CategoryIcon, { props: { category: 'server' } });
			const svg = container.querySelector('svg');
			expect(svg?.classList.toString()).toContain('lucide-server');
		});

		it('network category renders Network icon', () => {
			const { container } = render(CategoryIcon, { props: { category: 'network' } });
			const svg = container.querySelector('svg');
			expect(svg?.classList.toString()).toContain('lucide-network');
		});

		it('patch-panel category renders EthernetPort icon', () => {
			const { container } = render(CategoryIcon, { props: { category: 'patch-panel' } });
			const svg = container.querySelector('svg');
			expect(svg?.classList.toString()).toContain('lucide-ethernet-port');
		});

		it('power category renders Zap icon', () => {
			const { container } = render(CategoryIcon, { props: { category: 'power' } });
			const svg = container.querySelector('svg');
			expect(svg?.classList.toString()).toContain('lucide-zap');
		});

		it('storage category renders HardDrive icon', () => {
			const { container } = render(CategoryIcon, { props: { category: 'storage' } });
			const svg = container.querySelector('svg');
			expect(svg?.classList.toString()).toContain('lucide-hard-drive');
		});

		it('kvm category renders Monitor icon', () => {
			const { container } = render(CategoryIcon, { props: { category: 'kvm' } });
			const svg = container.querySelector('svg');
			expect(svg?.classList.toString()).toContain('lucide-monitor');
		});

		it('av-media category renders Speaker icon', () => {
			const { container } = render(CategoryIcon, { props: { category: 'av-media' } });
			const svg = container.querySelector('svg');
			expect(svg?.classList.toString()).toContain('lucide-speaker');
		});

		it('cooling category renders Fan icon', () => {
			const { container } = render(CategoryIcon, { props: { category: 'cooling' } });
			const svg = container.querySelector('svg');
			expect(svg?.classList.toString()).toContain('lucide-fan');
		});

		it('shelf category renders AlignEndHorizontal icon', () => {
			const { container } = render(CategoryIcon, { props: { category: 'shelf' } });
			const svg = container.querySelector('svg');
			expect(svg?.classList.toString()).toContain('lucide-align-end-horizontal');
		});

		it('blank category renders CircleOff icon', () => {
			const { container } = render(CategoryIcon, { props: { category: 'blank' } });
			const svg = container.querySelector('svg');
			expect(svg?.classList.toString()).toContain('lucide-circle-off');
		});

		it('cable-management category renders Cable icon', () => {
			const { container } = render(CategoryIcon, { props: { category: 'cable-management' } });
			const svg = container.querySelector('svg');
			expect(svg?.classList.toString()).toContain('lucide-cable');
		});

		it('other category renders CircleQuestionMark icon', () => {
			const { container } = render(CategoryIcon, { props: { category: 'other' } });
			const svg = container.querySelector('svg');
			expect(svg?.classList.toString()).toContain('lucide-circle-question-mark');
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
			// Should fall through to CircleQuestionMark (other) icon
			expect(svg?.classList.toString()).toContain('lucide-circle-question-mark');
		});
	});

	describe('CSS class', () => {
		it('has category-icon class on wrapper', () => {
			const { container } = render(CategoryIcon, { props: { category: 'server' } });
			const wrapper = container.querySelector('.category-icon');
			expect(wrapper).toBeInTheDocument();
		});
	});
});
