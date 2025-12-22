import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import LogoLockup from '$lib/components/LogoLockup.svelte';

describe('LogoLockup', () => {
	describe('Basic Rendering', () => {
		it('renders logo mark and title', () => {
			const { container } = render(LogoLockup);
			const logoMark = container.querySelector('.logo-mark');
			const logoTitle = container.querySelector('.logo-title');

			expect(logoMark).toBeInTheDocument();
			expect(logoTitle).toBeInTheDocument();
		});

		it('applies default size', () => {
			const { container } = render(LogoLockup);
			const logoMark = container.querySelector('.logo-mark');

			expect(logoMark).toHaveAttribute('width', '36');
			expect(logoMark).toHaveAttribute('height', '36');
		});

		it('accepts custom size prop', () => {
			const { container } = render(LogoLockup, { props: { size: 48 } });
			const logoMark = container.querySelector('.logo-mark');

			expect(logoMark).toHaveAttribute('width', '48');
			expect(logoMark).toHaveAttribute('height', '48');
		});

		it('renders title with aria-label', () => {
			const { container } = render(LogoLockup);
			const logoTitle = container.querySelector('.logo-title');

			expect(logoTitle).toHaveAttribute('aria-label', 'Rackarr');
		});
	});

	describe('SVG Gradient Definitions', () => {
		it('contains rainbow gradient for hover', () => {
			const { container } = render(LogoLockup);
			const rainbowGradient = container.querySelector('#lockup-rainbow');

			expect(rainbowGradient).toBeInTheDocument();
		});

		it('contains celebrate gradient', () => {
			const { container } = render(LogoLockup);
			const celebrateGradient = container.querySelector('#lockup-celebrate');

			expect(celebrateGradient).toBeInTheDocument();
		});

		it('contains party gradient', () => {
			const { container } = render(LogoLockup);
			const partyGradient = container.querySelector('#lockup-party');

			expect(partyGradient).toBeInTheDocument();
		});

		it('rainbow gradient has 6s duration', () => {
			const { container } = render(LogoLockup);
			const animate = container.querySelector('#lockup-rainbow animate');

			expect(animate).toHaveAttribute('dur', '6s');
		});

		it('celebrate gradient has 3s duration with one-shot', () => {
			const { container } = render(LogoLockup);
			const animate = container.querySelector('#lockup-celebrate animate');

			expect(animate).toHaveAttribute('dur', '3s');
			expect(animate).toHaveAttribute('repeatCount', '1');
		});

		it('party gradient has 0.5s duration', () => {
			const { container } = render(LogoLockup);
			const animate = container.querySelector('#lockup-party animate');

			expect(animate).toHaveAttribute('dur', '0.5s');
		});
	});

	describe('Celebrate Mode', () => {
		it('applies celebrate class to logo mark', () => {
			const { container } = render(LogoLockup, { props: { celebrate: true } });
			const logoMark = container.querySelector('.logo-mark');

			expect(logoMark).toHaveClass('logo-mark--celebrate');
		});

		it('applies celebrate class to logo title', () => {
			const { container } = render(LogoLockup, { props: { celebrate: true } });
			const logoTitle = container.querySelector('.logo-title');

			expect(logoTitle).toHaveClass('logo-title--celebrate');
		});

		it('sets active gradient style variable', () => {
			const { container } = render(LogoLockup, { props: { celebrate: true } });
			const logoMark = container.querySelector('.logo-mark');

			expect(logoMark).toHaveStyle('--active-gradient: url(#lockup-celebrate)');
		});

		it('does not apply celebrate class when false', () => {
			const { container } = render(LogoLockup, { props: { celebrate: false } });
			const logoMark = container.querySelector('.logo-mark');

			expect(logoMark).not.toHaveClass('logo-mark--celebrate');
		});
	});

	describe('Party Mode', () => {
		it('applies party class to logo mark', () => {
			const { container } = render(LogoLockup, { props: { partyMode: true } });
			const logoMark = container.querySelector('.logo-mark');

			expect(logoMark).toHaveClass('logo-mark--party');
		});

		it('applies party class to logo title', () => {
			const { container } = render(LogoLockup, { props: { partyMode: true } });
			const logoTitle = container.querySelector('.logo-title');

			expect(logoTitle).toHaveClass('logo-title--party');
		});

		it('sets party gradient style variable', () => {
			const { container } = render(LogoLockup, { props: { partyMode: true } });
			const logoMark = container.querySelector('.logo-mark');

			expect(logoMark).toHaveStyle('--active-gradient: url(#lockup-party)');
		});

		it('party mode takes precedence over celebrate', () => {
			const { container } = render(LogoLockup, {
				props: { celebrate: true, partyMode: true }
			});
			const logoMark = container.querySelector('.logo-mark');

			expect(logoMark).toHaveStyle('--active-gradient: url(#lockup-party)');
			expect(logoMark).toHaveClass('logo-mark--party');
		});
	});

	describe('Hover State', () => {
		it('applies hover class on mouseenter', async () => {
			const { container } = render(LogoLockup);
			const lockup = container.querySelector('.logo-lockup')!;
			const logoMark = container.querySelector('.logo-mark');

			await fireEvent.mouseEnter(lockup);

			expect(logoMark).toHaveClass('logo-mark--hover');
		});

		it('removes hover class on mouseleave', async () => {
			const { container } = render(LogoLockup);
			const lockup = container.querySelector('.logo-lockup')!;
			const logoMark = container.querySelector('.logo-mark');

			await fireEvent.mouseEnter(lockup);
			expect(logoMark).toHaveClass('logo-mark--hover');

			await fireEvent.mouseLeave(lockup);
			expect(logoMark).not.toHaveClass('logo-mark--hover');
		});

		it('sets rainbow gradient on hover', async () => {
			const { container } = render(LogoLockup);
			const lockup = container.querySelector('.logo-lockup')!;
			const logoMark = container.querySelector('.logo-mark');

			await fireEvent.mouseEnter(lockup);

			expect(logoMark).toHaveStyle('--active-gradient: url(#lockup-rainbow)');
		});

		it('hover does not apply when partyMode is active', async () => {
			const { container } = render(LogoLockup, { props: { partyMode: true } });
			const lockup = container.querySelector('.logo-lockup')!;
			const logoMark = container.querySelector('.logo-mark');

			await fireEvent.mouseEnter(lockup);

			// Party mode takes precedence, hover class should not be applied
			expect(logoMark).not.toHaveClass('logo-mark--hover');
			expect(logoMark).toHaveClass('logo-mark--party');
		});

		it('hover does not apply when celebrate is active', async () => {
			const { container } = render(LogoLockup, { props: { celebrate: true } });
			const lockup = container.querySelector('.logo-lockup')!;
			const logoMark = container.querySelector('.logo-mark');

			await fireEvent.mouseEnter(lockup);

			// Celebrate takes precedence, hover class should not be applied
			expect(logoMark).not.toHaveClass('logo-mark--hover');
			expect(logoMark).toHaveClass('logo-mark--celebrate');
		});

		it('hover does not apply when showcase is active', async () => {
			const { container } = render(LogoLockup, { props: { showcase: true } });
			const lockup = container.querySelector('.logo-lockup')!;
			const logoMark = container.querySelector('.logo-mark');

			await fireEvent.mouseEnter(lockup);

			// Showcase takes precedence, hover class should not be applied
			expect(logoMark).not.toHaveClass('logo-mark--hover');
			expect(logoMark).toHaveClass('logo-mark--showcase');
		});
	});

	describe('Accessibility', () => {
		it('logo mark is hidden from screen readers', () => {
			const { container } = render(LogoLockup);
			const logoMark = container.querySelector('.logo-mark');

			expect(logoMark).toHaveAttribute('aria-hidden', 'true');
		});

		it('gradient definitions SVG is hidden', () => {
			const { container } = render(LogoLockup);
			const defsSvg = container.querySelector('svg[style*="position: absolute"]');

			expect(defsSvg).toHaveAttribute('aria-hidden', 'true');
		});
	});
});
