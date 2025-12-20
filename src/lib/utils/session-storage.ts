import type { Layout } from '$lib/types';

const STORAGE_KEY = 'rackarr:autosave';

/**
 * Save the current layout to localStorage.
 * @param layout - The layout to save
 * @returns true if successful, false if failed (e.g., quota exceeded)
 */
export function saveSession(layout: Layout): boolean {
	try {
		const serialized = JSON.stringify(layout);
		localStorage.setItem(STORAGE_KEY, serialized);
		return true;
	} catch (error) {
		// Handle QuotaExceededError or other storage errors
		console.warn('[SessionStorage] Failed to save session:', error);
		return false;
	}
}

/**
 * Load the autosaved layout from localStorage.
 * @returns The saved layout, or null if none exists or parsing failed
 */
export function loadSession(): Layout | null {
	try {
		const serialized = localStorage.getItem(STORAGE_KEY);
		if (!serialized) {
			return null;
		}
		return JSON.parse(serialized) as Layout;
	} catch (error) {
		console.warn('[SessionStorage] Failed to load session:', error);
		return null;
	}
}

/**
 * Clear the autosaved session from localStorage.
 */
export function clearSession(): void {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch (error) {
		console.warn('[SessionStorage] Failed to clear session:', error);
	}
}
