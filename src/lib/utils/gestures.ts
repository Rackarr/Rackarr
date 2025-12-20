/**
 * Touch Gesture Utilities
 * Composable gesture detection for touch interactions
 */

const DEFAULT_LONG_PRESS_DURATION = 500; // ms
const MOVE_THRESHOLD = 10; // px

/**
 * Add long-press gesture detection to an element
 * @param element - Target element
 * @param callback - Function to call on long-press
 * @param duration - Long-press duration in ms (default: 500)
 * @returns Cleanup function to remove event listeners
 */
export function useLongPress(
	element: HTMLElement,
	callback: () => void,
	duration: number = DEFAULT_LONG_PRESS_DURATION
): () => void {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	let startX = 0;
	let startY = 0;
	let hasMoved = false;

	const handlePointerDown = (e: PointerEvent) => {
		// Store initial position
		startX = e.clientX;
		startY = e.clientY;
		hasMoved = false;

		// Start timer
		timeoutId = setTimeout(() => {
			// Trigger haptic feedback if available
			if (navigator.vibrate) {
				navigator.vibrate(50);
			}

			callback();
			timeoutId = null;
		}, duration);
	};

	const handlePointerUp = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	};

	const handlePointerCancel = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	};

	const handlePointerMove = (e: PointerEvent) => {
		if (!timeoutId || hasMoved) return;

		// Calculate distance moved
		const deltaX = Math.abs(e.clientX - startX);
		const deltaY = Math.abs(e.clientY - startY);
		const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		// Cancel if moved beyond threshold
		if (distance > MOVE_THRESHOLD) {
			hasMoved = true;
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	};

	// Attach event listeners
	element.addEventListener('pointerdown', handlePointerDown);
	element.addEventListener('pointerup', handlePointerUp);
	element.addEventListener('pointercancel', handlePointerCancel);
	element.addEventListener('pointermove', handlePointerMove);

	// Return cleanup function
	return () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		element.removeEventListener('pointerdown', handlePointerDown);
		element.removeEventListener('pointerup', handlePointerUp);
		element.removeEventListener('pointercancel', handlePointerCancel);
		element.removeEventListener('pointermove', handlePointerMove);
	};
}
