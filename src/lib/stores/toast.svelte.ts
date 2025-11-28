/**
 * Toast notification store using Svelte 5 runes
 * Provides notifications for user feedback
 */

import { SvelteMap } from 'svelte/reactivity';
import { generateId } from '$lib/utils/device';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
	id: string;
	type: ToastType;
	message: string;
	duration: number; // ms, 0 = permanent
}

const DEFAULT_DURATION = 5000; // 5 seconds

// Store state
let toasts = $state<Toast[]>([]);

// Timeout IDs for auto-dismiss
const timeouts = new SvelteMap<string, ReturnType<typeof setTimeout>>();

/**
 * Show a new toast notification
 * Returns the toast ID for manual dismissal if needed
 */
function showToast(message: string, type: ToastType, duration: number = DEFAULT_DURATION): string {
	const id = generateId();
	const toast: Toast = { id, type, message, duration };

	toasts = [...toasts, toast];

	// Set up auto-dismiss if duration > 0
	if (duration > 0) {
		const timeoutId = setTimeout(() => {
			dismissToast(id);
		}, duration);
		timeouts.set(id, timeoutId);
	}

	return id;
}

/**
 * Dismiss a specific toast by ID
 */
function dismissToast(id: string): void {
	// Clear timeout if exists
	const timeoutId = timeouts.get(id);
	if (timeoutId) {
		clearTimeout(timeoutId);
		timeouts.delete(id);
	}

	toasts = toasts.filter((t) => t.id !== id);
}

/**
 * Clear all toasts
 */
function clearAllToasts(): void {
	// Clear all timeouts
	for (const timeoutId of timeouts.values()) {
		clearTimeout(timeoutId);
	}
	timeouts.clear();

	toasts = [];
}

/**
 * Reset store state (for testing)
 */
export function resetToastStore(): void {
	clearAllToasts();
}

/**
 * Get the toast store
 */
export function getToastStore() {
	return {
		get toasts() {
			return toasts;
		},
		showToast,
		dismissToast,
		clearAllToasts
	};
}
