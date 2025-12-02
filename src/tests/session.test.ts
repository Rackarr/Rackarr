import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
	saveToSession,
	loadFromSession,
	clearSession,
	hasSession,
	STORAGE_KEY
} from '$lib/utils/session';
import { debounce } from '$lib/utils/debounce';
import type { Layout } from '$lib/types';
import { CURRENT_VERSION } from '$lib/types/constants';

// Mock sessionStorage
const sessionStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] || null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		}),
		// Helper to directly manipulate store for testing
		__setRaw: (key: string, value: string) => {
			store[key] = value;
		}
	};
})();

Object.defineProperty(globalThis, 'sessionStorage', {
	value: sessionStorageMock,
	writable: true
});

describe('Session Persistence', () => {
	const mockLayout: Layout = {
		version: CURRENT_VERSION,
		name: 'Test Layout',
		created: '2025-01-01T00:00:00.000Z',
		modified: '2025-01-01T00:00:00.000Z',
		settings: { theme: 'dark' },
		deviceLibrary: [
			{
				id: 'device-1',
				name: 'Test Server',
				height: 2,
				colour: '#4A90D9',
				category: 'server'
			}
		],
		racks: [
			{
				id: 'rack-1',
				name: 'Main Rack',
				height: 42,
				width: 19,
				position: 0,
				view: 'front',
				devices: [{ libraryId: 'device-1', position: 5, face: 'front' }]
			}
		]
	};

	beforeEach(() => {
		sessionStorageMock.clear();
		vi.clearAllMocks();
	});

	describe('saveToSession', () => {
		it('stores valid JSON in sessionStorage', () => {
			saveToSession(mockLayout);

			expect(sessionStorageMock.setItem).toHaveBeenCalledWith(STORAGE_KEY, expect.any(String));

			// Verify it's valid JSON
			const stored = sessionStorageMock.setItem.mock.calls[0]![1];
			expect(() => JSON.parse(stored)).not.toThrow();
		});

		it('stores layout with all properties', () => {
			saveToSession(mockLayout);

			const stored = sessionStorageMock.setItem.mock.calls[0]![1];
			const parsed = JSON.parse(stored) as Layout;

			expect(parsed.name).toBe('Test Layout');
			expect(parsed.racks).toHaveLength(1);
			expect(parsed.deviceLibrary).toHaveLength(1);
		});
	});

	describe('loadFromSession', () => {
		it('retrieves stored layout', () => {
			sessionStorageMock.__setRaw(STORAGE_KEY, JSON.stringify(mockLayout));

			const loaded = loadFromSession();

			expect(loaded).not.toBeNull();
			expect(loaded!.name).toBe('Test Layout');
			expect(loaded!.racks).toHaveLength(1);
		});

		it('returns null for empty storage', () => {
			const loaded = loadFromSession();
			expect(loaded).toBeNull();
		});

		it('returns null for invalid JSON', () => {
			sessionStorageMock.__setRaw(STORAGE_KEY, 'not valid json {{{');

			const loaded = loadFromSession();
			expect(loaded).toBeNull();
		});

		it('returns null for invalid layout structure', () => {
			sessionStorageMock.__setRaw(STORAGE_KEY, JSON.stringify({ invalid: 'data' }));

			const loaded = loadFromSession();
			expect(loaded).toBeNull();
		});

		it('migrates v0.1.0 layouts to current version', () => {
			const v01Layout = {
				version: '0.1.0',
				name: 'Old Layout',
				created: '2025-01-01T00:00:00.000Z',
				modified: '2025-01-01T00:00:00.000Z',
				settings: { theme: 'dark' },
				deviceLibrary: [
					{
						id: 'dev-1',
						name: 'Test Device',
						height: 2,
						colour: '#4A90D9',
						category: 'server'
					}
				],
				racks: [
					{
						id: 'rack-1',
						name: 'Test Rack',
						height: 42,
						width: 19,
						position: 0,
						devices: [{ libraryId: 'dev-1', position: 5 }]
					}
				]
			};

			sessionStorageMock.__setRaw(STORAGE_KEY, JSON.stringify(v01Layout));

			const loaded = loadFromSession();
			expect(loaded).not.toBeNull();
			expect(loaded!.version).toBe(CURRENT_VERSION);
			expect(loaded!.racks[0]!.view).toBe('front');
			expect(loaded!.racks[0]!.devices[0]!.face).toBe('front');
		});

		it('migrates v1.0 layouts to current version', () => {
			const v10Layout = {
				version: '1.0',
				name: 'Old Layout',
				created: '2025-01-01T00:00:00.000Z',
				modified: '2025-01-01T00:00:00.000Z',
				settings: { theme: 'dark' },
				deviceLibrary: [],
				racks: [
					{
						id: 'rack-1',
						name: 'Test Rack',
						height: 42,
						width: 19,
						position: 0,
						devices: []
					}
				]
			};

			sessionStorageMock.__setRaw(STORAGE_KEY, JSON.stringify(v10Layout));

			const loaded = loadFromSession();
			expect(loaded).not.toBeNull();
			expect(loaded!.version).toBe(CURRENT_VERSION);
			expect(loaded!.racks[0]!.view).toBe('front');
		});
	});

	describe('clearSession', () => {
		it('removes data from sessionStorage', () => {
			sessionStorageMock.__setRaw(STORAGE_KEY, JSON.stringify(mockLayout));

			clearSession();

			expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
		});
	});

	describe('hasSession', () => {
		it('returns true when valid session exists', () => {
			sessionStorageMock.__setRaw(STORAGE_KEY, JSON.stringify(mockLayout));

			expect(hasSession()).toBe(true);
		});

		it('returns false when no session', () => {
			expect(hasSession()).toBe(false);
		});

		it('returns false when session has invalid JSON', () => {
			sessionStorageMock.__setRaw(STORAGE_KEY, 'not valid json');

			expect(hasSession()).toBe(false);
		});

		it('returns false when session has invalid layout structure', () => {
			sessionStorageMock.__setRaw(STORAGE_KEY, JSON.stringify({ invalid: 'data' }));

			expect(hasSession()).toBe(false);
		});
	});
});

describe('Debounce Utility', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('delays execution', () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 100);

		debounced();

		expect(fn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(100);

		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('only calls once for rapid invocations', () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 100);

		debounced();
		debounced();
		debounced();
		debounced();
		debounced();

		vi.advanceTimersByTime(100);

		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('passes arguments to the debounced function', () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 100);

		debounced('arg1', 'arg2');

		vi.advanceTimersByTime(100);

		expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
	});

	it('uses latest arguments when called multiple times', () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 100);

		debounced('first');
		debounced('second');
		debounced('third');

		vi.advanceTimersByTime(100);

		expect(fn).toHaveBeenCalledWith('third');
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('can be called again after timeout', () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 100);

		debounced('first');
		vi.advanceTimersByTime(100);
		expect(fn).toHaveBeenCalledTimes(1);

		debounced('second');
		vi.advanceTimersByTime(100);
		expect(fn).toHaveBeenCalledTimes(2);
	});
});
