import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import LogoLoader from '$lib/components/LogoLoader.svelte';

describe('LogoLoader', () => {
	describe('Rendering', () => {
		it('renders the logo SVG', () => {
			const { container } = render(LogoLoader);
			const svg = container.querySelector('svg.logo-mark');

			expect(svg).toBeInTheDocument();
		});

		it('has correct default size', () => {
			const { container } = render(LogoLoader);
			const svg = container.querySelector('svg.logo-mark');

			expect(svg).toHaveAttribute('width', '48');
			expect(svg).toHaveAttribute('height', '48');
		});

		it('accepts custom size prop', () => {
			const { container } = render(LogoLoader, { props: { size: 64 } });
			const svg = container.querySelector('svg.logo-mark');

			expect(svg).toHaveAttribute('width', '64');
			expect(svg).toHaveAttribute('height', '64');
		});

		it('has correct viewBox', () => {
			const { container } = render(LogoLoader);
			const svg = container.querySelector('svg.logo-mark');

			expect(svg).toHaveAttribute('viewBox', '0 0 32 32');
		});

		it('viewBox has exactly 4 values (#166)', () => {
			const { container } = render(LogoLoader);
			const svg = container.querySelector('svg.logo-mark');
			const viewBox = svg?.getAttribute('viewBox');

			// Validate format: exactly 4 space-separated numeric values
			const values = viewBox?.split(' ');
			expect(values).toHaveLength(4);
			values?.forEach((val) => {
				expect(Number.isNaN(parseFloat(val))).toBe(false);
			});
		});
	});

	describe('Logo Structure', () => {
		it('contains frame path', () => {
			const { container } = render(LogoLoader);
			const frame = container.querySelector('.frame');

			expect(frame).toBeInTheDocument();
		});

		it('contains three animated slots', () => {
			const { container } = render(LogoLoader);
			const slots = container.querySelectorAll('.slot');

			expect(slots.length).toBe(3);
		});

		it('slots have staggered animation classes', () => {
			const { container } = render(LogoLoader);

			expect(container.querySelector('.slot-1')).toBeInTheDocument();
			expect(container.querySelector('.slot-2')).toBeInTheDocument();
			expect(container.querySelector('.slot-3')).toBeInTheDocument();
		});
	});

	describe('Message Display', () => {
		it('does not show message when not provided', () => {
			const { container } = render(LogoLoader);
			const message = container.querySelector('.loader-message');

			expect(message).not.toBeInTheDocument();
		});

		it('shows message when provided', () => {
			const { container } = render(LogoLoader, { props: { message: 'Rendering...' } });
			const message = container.querySelector('.loader-message');

			expect(message).toBeInTheDocument();
			expect(message?.textContent).toBe('Rendering...');
		});

		it('shows empty message when empty string provided', () => {
			const { container } = render(LogoLoader, { props: { message: '' } });
			const message = container.querySelector('.loader-message');

			expect(message).not.toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('has status role', () => {
			const { container } = render(LogoLoader);
			const loader = container.querySelector('.logo-loader');

			expect(loader).toHaveAttribute('role', 'status');
		});

		it('has aria-live polite', () => {
			const { container } = render(LogoLoader);
			const loader = container.querySelector('.logo-loader');

			expect(loader).toHaveAttribute('aria-live', 'polite');
		});

		it('SVG is hidden from screen readers', () => {
			const { container } = render(LogoLoader);
			const svg = container.querySelector('svg.logo-mark');

			expect(svg).toHaveAttribute('aria-hidden', 'true');
		});
	});
});
