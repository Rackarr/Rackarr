# Blockers for Resumption

## Issue: Panzoom Panning Not Working on Empty Space or Racks

**Date:** 2025-11-30
**Reporter:** User
**Status:** RESOLVED - 2025-11-30

### Resolution

**Root Cause:** The `beforeMouseDown` return values in Canvas.svelte were inverted.

Per panzoom's API (`if (beforeMouseDown(e)) return;`):

- `return true` = "ignore this event" = BLOCK panning
- `return false` = "proceed" = ALLOW panning

The original code had this backwards:

```typescript
if (isDraggableElement) {
	return false; // BUG: This ALLOWED panning on draggables
}
return true; // BUG: This BLOCKED panning on empty space
```

**Fix Applied:**

1. Swapped the return values in `Canvas.svelte:98-104`
2. Added `isPanning` state tracking to `canvas.svelte.ts` with panstart/panend listeners
3. Added isPanning check in `Rack.svelte` handleClick to prevent accidental selection after pan

---

## Issue: Fit All Not Centering Properly

**Date:** 2025-11-30
**Status:** RESOLVED - 2025-11-30

### Root Cause

Multiple CSS conflicts were causing incorrect positioning:

1. **Canvas flexbox centering** - The `.canvas` had `display: flex; align-items: center; justify-content: center;` which centered the panzoom-container. When the container was taller than the viewport (e.g., 960px rack-row vs 848px canvas), flexbox pushed it UP by (960-848)/2 = 56px, clipping the top.

2. **Panzoom-container flexbox centering** - Had its own `align-items: center; justify-content: center;` fighting with panzoom transforms.

3. **Inconsistent content dimensions** - Zoom calculation used `FIT_ALL_PADDING` (48px) but pan calculation used `RACK_ROW_PADDING` (16px), causing mismatched margins.

### Fix Applied

1. Removed flexbox centering from `.canvas` - now just `overflow: hidden`
2. Removed flexbox centering from `.panzoom-container` - panzoom controls all positioning
3. Changed `transform-origin` to `0 0` for predictable transforms
4. Fixed `calculateFitAll()` to use consistent content dimensions for both zoom and pan
5. Added `fitAll()` call on initial canvas mount
6. Moved drag handle from top (-24px) to bottom (-24px) to avoid obscuring rack name

### Problem Description

Panning is not working when clicking and dragging on:

1. Empty space in the canvas (areas with no racks)
2. Racks themselves (the rack SVG elements)

Expected behavior: User should be able to click and drag anywhere in the panzoom container to pan the view.

### Current Implementation

**Panzoom Integration Location:**

- Component: `src/lib/components/Canvas.svelte:68-118`
- Store: `src/lib/stores/canvas.svelte.ts`

**Panzoom Configuration:**

```typescript
panzoom(panzoomContainer, {
	minZoom: ZOOM_MIN,
	maxZoom: ZOOM_MAX,
	smoothScroll: false,
	zoomDoubleClickSpeed: 1,
	beforeMouseDown: (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		const isDraggableElement =
			(target as HTMLElement).draggable === true ||
			target.getAttribute?.('draggable') === 'true' ||
			target.closest?.('[draggable="true"]') !== null;

		// Return false to block panning, true to allow
		if (isDraggableElement) {
			return false;
		}
		return true;
	},
	filterKey: () => true
});
```

**DOM Structure:**

```html
<div class="canvas" bind:this="{canvasContainer}" onclick="{handleCanvasClick}">
	<div class="panzoom-container" bind:this="{panzoomContainer}">
		<div class="rack-row">
			<Rack ... />
			<!-- Each rack has onclick={handleClick} -->
			<Rack ... />
			...
		</div>
	</div>
</div>
```

### Potential Root Causes

#### 1. Click Handler Interference

**Location:** `src/lib/components/Rack.svelte:300`

- Each `<div class="rack-container">` has `onclick={handleClick}` for rack selection
- This click handler might be:
  - Preventing event propagation needed for panzoom
  - Interfering with panzoom's click vs. drag detection
  - Capturing events before panzoom can process them

#### 2. beforeMouseDown Filter Logic

**Location:** `src/lib/components/Canvas.svelte:77-105`

- The filter checks for draggable elements correctly
- But may need additional logic to handle:
  - SVG elements (rack backgrounds, empty space within SVG)
  - Empty space in the panzoom-container
  - Interactive children like buttons/toggles

**Debug logs enabled:** Lines 88-96 show extensive debug output

#### 3. Pointer Events Configuration

**Location:** `src/lib/components/Rack.svelte:506, 448`

- SVG has `pointer-events: auto`
- rack-container has `cursor: inherit`
- These may be interfering with panzoom's event handling

#### 4. Missing panzoom Configuration

Possible missing options:

- `onTouch`: May need to disable or configure touch handling
- `onDoubleClick`: May need explicit handling
- Event capture/bubble phase conflicts

### Investigation Steps Needed

1. **Test empty space panning:**
   - Add temporary padding/margin to create guaranteed empty space
   - Test if panning works there
   - If yes → issue is with rack elements; if no → issue is with panzoom config

2. **Check event propagation:**
   - Add `event.stopPropagation()` guards in rack click handlers
   - Or use `event.currentTarget` checks to only handle direct clicks
   - Test if this allows panning

3. **Review beforeMouseDown logic:**
   - Add more comprehensive debug logging
   - Check what elements are being filtered
   - Verify the return values are correct (true = allow pan, false = block pan)

4. **Test with minimal rack structure:**
   - Temporarily remove all click handlers from Rack.svelte
   - Test if panning works
   - Re-add handlers one by one to identify culprit

5. **Check panzoom documentation:**
   - Review [anvaka/panzoom docs](https://github.com/anvaka/panzoom) for:
     - Known conflicts with click handlers
     - Recommended patterns for interactive children
     - Event handling options

### Code References

| File                               | Lines    | Description                                        |
| ---------------------------------- | -------- | -------------------------------------------------- |
| `src/lib/components/Canvas.svelte` | 68-118   | Panzoom initialization with beforeMouseDown filter |
| `src/lib/components/Canvas.svelte` | 120-125  | Canvas click handler (clears selection)            |
| `src/lib/components/Rack.svelte`   | 108-111  | Rack click handler (selects rack)                  |
| `src/lib/components/Rack.svelte`   | 300      | rack-container with onclick                        |
| `src/lib/components/Rack.svelte`   | 506, 448 | SVG pointer-events and cursor styles               |
| `src/lib/stores/canvas.svelte.ts`  | 81-93    | setPanzoomInstance with zoom listener              |

### Related Context

- Zoom functionality works correctly (toolbar buttons functional)
- Drag-and-drop of devices works (uses separate drag-drop API)
- Selection works (clicking racks/devices selects them)
- This is v0.2 feature - panzoom was just integrated

### Temporary Workarounds

None available - panning is a core navigation feature.

### Next Actions

1. Enable debug mode and test user interactions
2. Review panzoom event flow with browser DevTools
3. Experiment with event handler modifications
4. Consider consulting panzoom issues/examples for interactive children

### Questions to Answer

- Does panzoom require exclusive pointer event handling?
- Can we use panzoom with child click handlers, and if so, how?
- Should we use a different approach for rack selection (hover + keyboard)?
- Is there a panzoom option to distinguish clicks from drags explicitly?

---

**End of blocker documentation**
