import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ColourPicker from '$lib/components/ColourPicker.svelte';

describe('ColourPicker Component', () => {
	describe('Preset colours', () => {
		it('renders preset colour buttons', () => {
			render(ColourPicker, { props: { value: '#BD93F9' } });

			// Should have preset buttons with aria-labels
			expect(screen.getByRole('button', { name: /purple/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /pink/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /cyan/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /green/i })).toBeInTheDocument();
		});

		it('highlights selected preset', () => {
			render(ColourPicker, { props: { value: '#FF79C6' } });

			const pinkButton = screen.getByRole('button', { name: /pink/i });
			expect(pinkButton).toHaveClass('selected');
		});

		it('calls onchange when preset is clicked', async () => {
			const onchange = vi.fn();
			render(ColourPicker, { props: { value: '#BD93F9', onchange } });

			const greenButton = screen.getByRole('button', { name: /green/i });
			await fireEvent.click(greenButton);

			expect(onchange).toHaveBeenCalledWith('#50FA7B');
		});
	});

	describe('Custom hex input', () => {
		it('renders custom hex input', () => {
			render(ColourPicker, { props: { value: '#BD93F9' } });

			const input = screen.getByLabelText(/custom/i);
			expect(input).toBeInTheDocument();
		});

		it('shows current value in input', () => {
			render(ColourPicker, { props: { value: '#123456' } });

			const input = screen.getByLabelText(/custom/i) as HTMLInputElement;
			expect(input.value).toBe('#123456');
		});

		it('calls onchange for valid hex input', async () => {
			const onchange = vi.fn();
			render(ColourPicker, { props: { value: '#BD93F9', onchange } });

			const input = screen.getByLabelText(/custom/i);
			await fireEvent.input(input, { target: { value: '#AABBCC' } });

			expect(onchange).toHaveBeenCalledWith('#AABBCC');
		});

		it('does not call onchange for invalid hex', async () => {
			const onchange = vi.fn();
			render(ColourPicker, { props: { value: '#BD93F9', onchange } });

			const input = screen.getByLabelText(/custom/i);
			await fireEvent.input(input, { target: { value: 'invalid' } });

			expect(onchange).not.toHaveBeenCalled();
		});
	});

	describe('Reset button', () => {
		it('shows reset button when value differs from default', () => {
			render(ColourPicker, {
				props: { value: '#FF5555', defaultValue: '#BD93F9' }
			});

			expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
		});

		it('hides reset button when value matches default', () => {
			render(ColourPicker, {
				props: { value: '#BD93F9', defaultValue: '#BD93F9' }
			});

			expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument();
		});

		it('hides reset button when no default provided', () => {
			render(ColourPicker, { props: { value: '#FF5555' } });

			expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument();
		});

		it('calls onreset when reset is clicked', async () => {
			const onreset = vi.fn();
			render(ColourPicker, {
				props: { value: '#FF5555', defaultValue: '#BD93F9', onreset }
			});

			const resetButton = screen.getByRole('button', { name: /reset/i });
			await fireEvent.click(resetButton);

			expect(onreset).toHaveBeenCalled();
		});
	});

	describe('Accessibility', () => {
		it('preset buttons have aria-labels', () => {
			render(ColourPicker, { props: { value: '#BD93F9' } });

			const buttons = screen.getAllByRole('button');
			buttons.forEach((button) => {
				if (!button.textContent?.includes('Reset')) {
					expect(button).toHaveAttribute('aria-label');
				}
			});
		});

		it('custom input has label', () => {
			render(ColourPicker, { props: { value: '#BD93F9' } });

			expect(screen.getByLabelText(/custom/i)).toBeInTheDocument();
		});
	});
});
