/**
 * Debug Logging Utility Tests
 * Verifies console logging uses standardized [rackarr:category] format
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debug } from '$lib/utils/debug';

describe('Debug Logging', () => {
	let consoleSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		consoleSpy.mockRestore();
	});

	describe('Log Format Standards', () => {
		it('debug.log() outputs [rackarr:debug] prefix', () => {
			debug.log('test message');
			expect(consoleSpy).toHaveBeenCalled();
			const call = consoleSpy.mock.calls[0];
			expect(call?.[0]).toBe('[rackarr:debug]');
		});

		it('debug.info() outputs [rackarr] prefix', () => {
			debug.info('test message');
			expect(consoleSpy).toHaveBeenCalled();
			const call = consoleSpy.mock.calls[0];
			expect(call?.[0]).toBe('[rackarr]');
		});

		it('debug.devicePlace() outputs [rackarr:device:place] prefix', () => {
			debug.devicePlace({
				slug: 'test-device',
				position: 1,
				passedFace: 'front',
				effectiveFace: 'both',
				deviceName: 'Test Device',
				isFullDepth: true,
				result: 'success'
			});
			expect(consoleSpy).toHaveBeenCalled();
			const call = consoleSpy.mock.calls[0];
			expect(call?.[0]).toMatch(/^\[rackarr:device:place\]/);
		});

		it('debug.deviceMove() outputs [rackarr:device:move] prefix', () => {
			debug.deviceMove({
				index: 0,
				deviceName: 'Test Device',
				face: 'both',
				fromPosition: 1,
				toPosition: 5,
				result: 'success'
			});
			expect(consoleSpy).toHaveBeenCalled();
			const call = consoleSpy.mock.calls[0];
			expect(call?.[0]).toMatch(/^\[rackarr:device:move\]/);
		});

		it('debug.collision() outputs [rackarr:collision] prefix', () => {
			debug.collision({
				position: 1,
				height: 2,
				face: 'both',
				isFullDepth: true,
				existingDevices: [],
				result: 'clear'
			});
			expect(consoleSpy).toHaveBeenCalled();
			const call = consoleSpy.mock.calls[0];
			expect(call?.[0]).toMatch(/^\[rackarr:collision\]/);
		});
	});

	describe('Warn and Error Logging', () => {
		let warnSpy: ReturnType<typeof vi.spyOn>;
		let errorSpy: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		});

		afterEach(() => {
			warnSpy.mockRestore();
			errorSpy.mockRestore();
		});

		it('debug.warn() outputs [rackarr:debug:warn] prefix', () => {
			debug.warn('warning message');
			expect(warnSpy).toHaveBeenCalled();
			const call = warnSpy.mock.calls[0];
			expect(call?.[0]).toBe('[rackarr:debug:warn]');
		});

		it('debug.error() outputs [rackarr:debug:error] prefix', () => {
			debug.error('error message');
			expect(errorSpy).toHaveBeenCalled();
			const call = errorSpy.mock.calls[0];
			expect(call?.[0]).toBe('[rackarr:debug:error]');
		});
	});

	describe('Group Logging', () => {
		let groupSpy: ReturnType<typeof vi.spyOn>;
		let groupEndSpy: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			groupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
			groupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
		});

		afterEach(() => {
			groupSpy.mockRestore();
			groupEndSpy.mockRestore();
		});

		it('debug.group() outputs [rackarr:debug] prefix with label', () => {
			debug.group('Test Group');
			expect(groupSpy).toHaveBeenCalled();
			const call = groupSpy.mock.calls[0];
			expect(call?.[0]).toBe('[rackarr:debug] Test Group');
		});
	});

	describe('Debug State', () => {
		it('isEnabled() returns true in test environment', () => {
			// In test environment, debug should be enabled
			expect(debug.isEnabled()).toBe(true);
		});
	});
});
