import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import WelcomeScreen from '$lib/components/WelcomeScreen.svelte';

describe('WelcomeScreen Component', () => {
	describe('Rendering', () => {
		it('displays app name', () => {
			render(WelcomeScreen);
			expect(screen.getByText('Rackarr')).toBeInTheDocument();
		});

		it('displays welcome message', () => {
			render(WelcomeScreen);
			expect(screen.getByText(/rack layout designer/i)).toBeInTheDocument();
		});

		it('displays app description', () => {
			render(WelcomeScreen);
			expect(screen.getByText(/visualize.*rack.*layout/i)).toBeInTheDocument();
		});
	});

	describe('Actions', () => {
		it('has New Rack button', () => {
			render(WelcomeScreen);
			expect(screen.getByRole('button', { name: /new rack/i })).toBeInTheDocument();
		});

		it('has Load Layout button', () => {
			render(WelcomeScreen);
			expect(screen.getByRole('button', { name: /load layout/i })).toBeInTheDocument();
		});

		it('New Rack button dispatches newrack event', async () => {
			const onNewRack = vi.fn();
			render(WelcomeScreen, { props: { onnewrack: onNewRack } });

			await fireEvent.click(screen.getByRole('button', { name: /new rack/i }));
			expect(onNewRack).toHaveBeenCalledTimes(1);
		});

		it('Load Layout button dispatches load event', async () => {
			const onLoad = vi.fn();
			render(WelcomeScreen, { props: { onload: onLoad } });

			await fireEvent.click(screen.getByRole('button', { name: /load layout/i }));
			expect(onLoad).toHaveBeenCalledTimes(1);
		});
	});

	describe('Styling', () => {
		it('has welcome-screen class', () => {
			const { container } = render(WelcomeScreen);
			expect(container.querySelector('.welcome-screen')).toBeInTheDocument();
		});

		it('New Rack button is primary (larger/prominent)', () => {
			render(WelcomeScreen);
			const newRackBtn = screen.getByRole('button', { name: /new rack/i });
			expect(newRackBtn).toHaveClass('btn-primary');
		});

		it('Load Layout button is secondary', () => {
			render(WelcomeScreen);
			const loadBtn = screen.getByRole('button', { name: /load layout/i });
			expect(loadBtn).toHaveClass('btn-secondary');
		});
	});

	describe('Accessibility', () => {
		it('has heading for screen readers', () => {
			render(WelcomeScreen);
			expect(screen.getByRole('heading', { name: /rackarr/i })).toBeInTheDocument();
		});

		it('buttons are keyboard accessible', () => {
			render(WelcomeScreen);
			const buttons = screen.getAllByRole('button');
			buttons.forEach((btn) => {
				expect(btn).not.toHaveAttribute('tabindex', '-1');
			});
		});
	});
});
