/**
 * Viewport Utility
 * Mobile/desktop viewport detection with reactive state
 */

const MOBILE_BREAKPOINT = '(max-width: 1024px)';

// Module-level state (using $state rune)
let isMobileViewport = $state(false);

/**
 * Check if current viewport is mobile (<= 1024px)
 * @returns True if viewport is mobile size
 */
export function isMobile(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia(MOBILE_BREAKPOINT).matches;
}

/**
 * Initialize viewport detection with reactive state
 * Call this once at app startup to enable reactivity
 */
export function initViewport(): void {
	if (typeof window === 'undefined') return;

	const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
	isMobileViewport = mediaQuery.matches;

	const handleChange = (e: MediaQueryListEvent) => {
		isMobileViewport = e.matches;
	};

	mediaQuery.addEventListener('change', handleChange);
}

// Track if store has been initialized
let isInitialized = false;

/**
 * Reset viewport store state (for testing)
 */
export function resetViewportStore(): void {
	isMobileViewport = false;
	isInitialized = false;
}

/**
 * Get viewport store with reactive state
 * @returns Store object with isMobile getter
 */
export function getViewportStore() {
	// Initialize on first access if not already done
	if (typeof window !== 'undefined' && !isInitialized) {
		const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
		isMobileViewport = mediaQuery.matches;

		const handleChange = (e: MediaQueryListEvent) => {
			isMobileViewport = e.matches;
		};

		mediaQuery.addEventListener('change', handleChange);
		isInitialized = true;
	}

	return {
		get isMobile() {
			return isMobileViewport;
		}
	};
}
