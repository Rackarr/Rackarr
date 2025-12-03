import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import WelcomeScreen from '$lib/components/WelcomeScreen.svelte';

describe('WelcomeScreen Component', () => {
	describe('Rendering', () => {
		it('displays ghost rack background', () => {
			const { container } = render(WelcomeScreen);
			expect(container.querySelector('.ghost-rack')).toBeInTheDocument();
		});

		it('has welcome-screen container', () => {
			const { container } = render(WelcomeScreen);
			expect(container.querySelector('.welcome-screen')).toBeInTheDocument();
		});
	});

	describe('Ghost Rack Structure', () => {
		it('has rack interior', () => {
			const { container } = render(WelcomeScreen);
			expect(container.querySelector('.rack-interior')).toBeInTheDocument();
		});

		it('has rack rails (top, bottom, left, right)', () => {
			const { container } = render(WelcomeScreen);
			const rails = container.querySelectorAll('.rack-rail');
			expect(rails.length).toBe(4);
		});

		it('has 43 grid lines (42U + 1)', () => {
			const { container } = render(WelcomeScreen);
			const lines = container.querySelectorAll('.rack-line');
			expect(lines.length).toBe(43);
		});

		it('has 42 unit numbers', () => {
			const { container } = render(WelcomeScreen);
			const numbers = container.querySelectorAll('.rack-unit-num');
			expect(numbers.length).toBe(42);
		});
	});

	describe('Accessibility', () => {
		it('ghost rack is decorative (aria-hidden)', () => {
			const { container } = render(WelcomeScreen);
			const svg = container.querySelector('.ghost-rack');
			expect(svg).toHaveAttribute('aria-hidden', 'true');
		});

		it('welcome screen has button role', () => {
			const { container } = render(WelcomeScreen);
			const screen = container.querySelector('.welcome-screen');
			expect(screen).toHaveAttribute('role', 'button');
		});

		it('welcome screen has aria-label', () => {
			const { container } = render(WelcomeScreen);
			const screen = container.querySelector('.welcome-screen');
			expect(screen).toHaveAttribute('aria-label', 'Click to get started');
		});

		it('welcome screen is focusable', () => {
			const { container } = render(WelcomeScreen);
			const screen = container.querySelector('.welcome-screen');
			expect(screen).toHaveAttribute('tabindex', '0');
		});
	});

	describe('Click Interaction', () => {
		it('calls onclick when clicked', async () => {
			const handleClick = vi.fn();
			const { container } = render(WelcomeScreen, { props: { onclick: handleClick } });

			const screen = container.querySelector('.welcome-screen');
			await fireEvent.click(screen!);

			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it('calls onclick on Enter key', async () => {
			const handleClick = vi.fn();
			const { container } = render(WelcomeScreen, { props: { onclick: handleClick } });

			const screen = container.querySelector('.welcome-screen');
			await fireEvent.keyDown(screen!, { key: 'Enter' });

			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it('calls onclick on Space key', async () => {
			const handleClick = vi.fn();
			const { container } = render(WelcomeScreen, { props: { onclick: handleClick } });

			const screen = container.querySelector('.welcome-screen');
			await fireEvent.keyDown(screen!, { key: ' ' });

			expect(handleClick).toHaveBeenCalledTimes(1);
		});
	});
});
