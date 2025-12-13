# PROMPT-PLAN.md — Rackarr v0.6.0 Implementation

**Created:** 2025-12-12
**Target Version:** 0.6.0
**Scope:** R-01 through R-05 (Brand Packs, Export UX, CSV Export, Power Properties)

---

## Overview

This document contains step-by-step prompts for implementing v0.6.0 features. Each prompt is designed for a code-generation LLM following TDD methodology.

**Phases:**

1. Schema & Data Model Updates (R-05)
2. UI Component Foundation (Collapsible Sections)
3. DevicePalette Refactor
4. Brand Starter Packs (R-01, R-02)
5. Export Improvements (R-03, R-04)
6. First-Load Experience (Onboarding)

**Dependencies Flow:**

```
Phase 1 (Schema)
    ↓
Phase 2 (Collapsible Component)
    ↓
Phase 3 (DevicePalette Refactor)
    ↓
Phase 4 (Brand Packs Data + Images)
    ↓
Phase 5 (Export UX + CSV)

Phase 6 (First-Load Experience) ← Independent, can run anytime
```

---

## Phase 1: Schema & Data Model Updates

### Prompt 1.1: Add Power Device Properties to Schema

```text
Context: Rackarr is a Svelte 5 rack layout designer. We need to add optional power-specific properties to the DeviceType interface for UPS and PDU devices.

Task: Add `outlet_count` and `va_rating` optional fields to the DeviceType schema.

Requirements:
1. Update the DeviceType interface in `src/lib/types/layout.ts` to add:
   - `outlet_count?: number` — Number of outlets (e.g., 8, 12, 16)
   - `va_rating?: number` — VA capacity (e.g., 1500, 3000)

2. Update the Zod schema in `src/lib/schemas/layout.ts` to validate these new optional fields:
   - Both should be positive integers
   - Both are optional

3. Write tests FIRST in `src/lib/schemas/layout.test.ts`:
   - Test that DeviceType without power fields validates
   - Test that DeviceType with valid outlet_count validates
   - Test that DeviceType with valid va_rating validates
   - Test that DeviceType with both fields validates
   - Test that negative values are rejected
   - Test that non-integer values are rejected

TDD approach: Write failing tests first, then implement to make them pass.

Files to modify:
- src/lib/types/layout.ts
- src/lib/schemas/layout.ts
- src/lib/schemas/layout.test.ts (create if needed)
```

### Prompt 1.2: Update Starter Library Power Devices

```text
Context: We've added outlet_count and va_rating fields to DeviceType. Now update the existing power devices in the starter library to include these properties.

Task: Add power properties to PDU and UPS devices in the starter library.

Requirements:
1. Update `src/lib/data/starterLibrary.ts` to add power properties:
   - 1U PDU: outlet_count: 8 (typical basic PDU)
   - 2U UPS: outlet_count: 6, va_rating: 1500
   - 4U UPS: outlet_count: 8, va_rating: 3000

2. Update the StarterDeviceSpec interface to support optional power fields

3. Update getStarterLibrary() to pass through power properties

4. Write tests FIRST:
   - Test that 1U PDU has outlet_count of 8
   - Test that 2U UPS has outlet_count and va_rating
   - Test that 4U UPS has outlet_count and va_rating
   - Test that non-power devices don't have these fields

Files to modify:
- src/lib/data/starterLibrary.ts
- src/lib/data/starterLibrary.test.ts
```

### Prompt 1.3: Display Power Properties in EditPanel

```text
Context: DeviceType now has outlet_count and va_rating fields. We need to display these in the EditPanel when a power device is selected.

Task: Show power properties in EditPanel for devices with category 'power'.

Requirements:
1. In `src/lib/components/EditPanel.svelte`, add a conditional section that displays:
   - "Outlets: {outlet_count}" when outlet_count exists
   - "VA Rating: {va_rating}" when va_rating exists
   - Only show this section when device category is 'power'

2. Display as read-only info (not editable for placed devices, since these come from device type)

3. Style consistently with existing EditPanel sections

4. Write tests FIRST:
   - Test that power section doesn't appear for non-power devices
   - Test that power section appears for power devices
   - Test that outlet_count displays correctly
   - Test that va_rating displays correctly
   - Test that missing values show gracefully (no "undefined")

Files to modify:
- src/lib/components/EditPanel.svelte
- src/lib/components/EditPanel.test.ts
```

---

## Phase 2: UI Component Foundation

### Prompt 2.1: Create CollapsibleSection Component

````text
Context: Rackarr uses Svelte 5 with runes. We need a reusable collapsible section component for the device palette to organize devices by brand.

Task: Create a CollapsibleSection component.

Requirements:
1. Create `src/lib/components/CollapsibleSection.svelte` with:
   - Props: title (string), count (number), defaultExpanded (boolean, default false)
   - Svelte 5 runes for state ($state for expanded)
   - Click header to toggle expanded/collapsed
   - Slot for section content
   - Chevron icon that rotates on expand/collapse
   - Smooth height animation (CSS transition)

2. Accessibility:
   - Button role on header
   - aria-expanded attribute
   - aria-controls pointing to content id
   - Keyboard accessible (Enter/Space to toggle)

3. Styling:
   - Use existing design tokens from tokens.css
   - Header shows: chevron + title + count badge "(N)"
   - Consistent with sidebar styling

4. Write tests FIRST in `src/lib/components/CollapsibleSection.test.ts`:
   - Test renders title and count
   - Test starts collapsed when defaultExpanded=false
   - Test starts expanded when defaultExpanded=true
   - Test clicking header toggles state
   - Test aria-expanded updates correctly
   - Test content is hidden when collapsed
   - Test content is visible when expanded

Example usage:
```svelte
<CollapsibleSection title="Ubiquiti" count={18} defaultExpanded={false}>
  {#each ubiquitiDevices as device}
    <DeviceCard {device} />
  {/each}
</CollapsibleSection>
````

Files to create:

- src/lib/components/CollapsibleSection.svelte
- src/lib/components/CollapsibleSection.test.ts

````

### Prompt 2.2: Add CollapsibleSection Styling Polish

```text
Context: CollapsibleSection component exists but needs polish for visual consistency with the app.

Task: Refine CollapsibleSection styling and animations.

Requirements:
1. Update CollapsibleSection.svelte styles:
   - Header: sticky within scroll container, subtle background on hover
   - Chevron: 12px size, smooth 200ms rotation, use existing icon pattern
   - Count badge: muted color, smaller font size (--font-size-xs)
   - Content area: no padding (content handles its own padding)
   - Border-bottom on header for visual separation

2. Add CSS custom properties for theming:
   - --collapsible-header-bg
   - --collapsible-header-hover-bg
   - Support both light and dark themes

3. Animation refinement:
   - Use max-height transition for smooth expand/collapse
   - Avoid layout shift during animation

4. Write/update tests:
   - Test chevron rotates on expand
   - Test hover state applies

Files to modify:
- src/lib/components/CollapsibleSection.svelte
- src/lib/styles/tokens.css (if new tokens needed)
````

---

## Phase 3: DevicePalette Refactor

### Prompt 3.1: Refactor DevicePalette for Sections

```text
Context: DevicePalette currently shows a flat list of devices. We need to refactor it to use CollapsibleSection components, starting with just the "Generic" section.

Task: Refactor DevicePalette to use CollapsibleSection for the generic library.

Requirements:
1. In `src/lib/components/DevicePalette.svelte`:
   - Wrap existing device list in CollapsibleSection
   - Title: "Generic", count: number of generic devices
   - defaultExpanded: true (generic is expanded by default)
   - Keep existing search functionality working

2. Search behavior:
   - Search should still filter devices within the section
   - Section should auto-expand if it contains search results
   - Show "No results" message if search finds nothing

3. Preserve existing functionality:
   - Device cards still draggable
   - Click to add device still works
   - Category filtering still works (if exists)

4. Write tests FIRST:
   - Test Generic section renders with correct count
   - Test Generic section is expanded by default
   - Test devices are filterable by search
   - Test search with no results shows message
   - Test section auto-expands when search matches

Files to modify:
- src/lib/components/DevicePalette.svelte
- src/lib/components/DevicePalette.test.ts
```

### Prompt 3.2: Add Section Infrastructure for Brand Packs

````text
Context: DevicePalette now uses CollapsibleSection for Generic devices. We need to prepare the infrastructure for brand pack sections.

Task: Add data structure and rendering for multiple sections in DevicePalette.

Requirements:
1. Create a section data structure:
   ```typescript
   interface DeviceSection {
     id: string;           // 'generic' | 'ubiquiti' | 'mikrotik'
     title: string;
     devices: DeviceType[];
     defaultExpanded: boolean;
   }
````

2. Refactor DevicePalette to:
   - Accept/derive sections array
   - Render CollapsibleSection for each section
   - Generic section: defaultExpanded=true
   - Brand sections: defaultExpanded=false

3. Update search to work across all sections:
   - Filter devices in each section
   - Auto-expand sections with matching results
   - Collapse sections with no matches (optional: or show with 0 count)

4. For now, only Generic section has devices (brand packs added in Phase 4)

5. Write tests:
   - Test multiple sections render
   - Test each section has correct expanded state
   - Test search filters across all sections
   - Test sections with matches auto-expand

Files to modify:

- src/lib/components/DevicePalette.svelte
- src/lib/components/DevicePalette.test.ts

````

---

## Phase 4: Brand Starter Packs

### Prompt 4.1: Create Ubiquiti Brand Pack Data

```text
Context: Rackarr supports brand-specific device packs. We need to create the Ubiquiti starter pack data.

Task: Create the Ubiquiti device pack data file.

Requirements:
1. Create `src/lib/data/brandPacks/ubiquiti.ts` with:
   - Export array of DeviceType objects for Ubiquiti devices
   - Each device must have: slug, u_height, manufacturer: "Ubiquiti", model, is_full_depth, airflow, rackarr (colour, category)

2. Include these devices (from SPEC.md Section 11.6.3):
   | Device | Category | U-Height | Full Depth | Airflow |
   |--------|----------|----------|------------|---------|
   | USW-Pro-24 | network | 1 | true | side-to-rear |
   | USW-Pro-48 | network | 1 | true | side-to-rear |
   | USW-Pro-24-PoE | network | 1 | true | side-to-rear |
   | USW-Pro-48-PoE | network | 1 | true | side-to-rear |
   | USW-Aggregation | network | 1 | true | side-to-rear |
   | UDM-Pro | network | 1 | true | front-to-rear |
   | UDM-SE | network | 1 | true | front-to-rear |
   | UNVR | storage | 1 | true | front-to-rear |
   | UNVR-Pro | storage | 2 | true | front-to-rear |
   | USP-PDU-Pro | power | 1 | false | passive |

3. Use category colors from CATEGORY_COLOURS constant

4. Slugs should be lowercase model names (e.g., 'usw-pro-24')

5. Write tests FIRST in `src/lib/data/brandPacks/ubiquiti.test.ts`:
   - Test correct number of devices exported
   - Test all devices have manufacturer: "Ubiquiti"
   - Test each device has valid slug, u_height, category
   - Test specific device properties (spot check UDM-Pro, USP-PDU-Pro)

Files to create:
- src/lib/data/brandPacks/ubiquiti.ts
- src/lib/data/brandPacks/ubiquiti.test.ts
````

### Prompt 4.2: Create Mikrotik Brand Pack Data

```text
Context: Following the same pattern as Ubiquiti, create the Mikrotik device pack.

Task: Create the Mikrotik device pack data file.

Requirements:
1. Create `src/lib/data/brandPacks/mikrotik.ts` with Mikrotik devices

2. Include these devices (from SPEC.md Section 11.6.4):
   | Device | Category | U-Height | Full Depth | Airflow |
   |--------|----------|----------|------------|---------|
   | CRS326-24G-2S+ | network | 1 | true | side-to-rear |
   | CRS328-24P-4S+ | network | 1 | true | side-to-rear |
   | CRS309-1G-8S+ | network | 1 | true | side-to-rear |
   | CCR2004-1G-12S+2XS | network | 1 | true | front-to-rear |
   | RB5009UG+S+IN | network | 1 | true | front-to-rear |

3. All devices have manufacturer: "Mikrotik"

4. Write tests FIRST in `src/lib/data/brandPacks/mikrotik.test.ts`:
   - Test correct number of devices
   - Test all devices have manufacturer: "Mikrotik"
   - Test each device has valid properties
   - Test slug generation handles special characters ('+' in model names)

Files to create:
- src/lib/data/brandPacks/mikrotik.ts
- src/lib/data/brandPacks/mikrotik.test.ts
```

### Prompt 4.3: Create Brand Pack Index and Integration

```text
Context: Ubiquiti and Mikrotik data files exist. Now create an index to export them and integrate with DevicePalette.

Task: Create brand pack index and wire up to DevicePalette.

Requirements:
1. Create `src/lib/data/brandPacks/index.ts`:
   - Export ubiquitiDevices from './ubiquiti'
   - Export mikrotikDevices from './mikrotik'
   - Export a combined getBrandPacks() function that returns section data

2. Update DevicePalette to import and use brand packs:
   - Import from brandPacks index
   - Create sections: Generic (from starterLibrary), Ubiquiti, Mikrotik
   - Pass sections to rendering logic

3. Sections should appear in order: Generic, Ubiquiti, Mikrotik

4. Write tests:
   - Test getBrandPacks returns all three sections
   - Test sections have correct titles and device counts
   - Test DevicePalette renders all three sections

Files to create:
- src/lib/data/brandPacks/index.ts

Files to modify:
- src/lib/components/DevicePalette.svelte
- src/lib/components/DevicePalette.test.ts
```

### Prompt 4.4: Source and Add Ubiquiti Images

```text
Context: Ubiquiti devices are defined but need images. Source images from NetBox device-type library.

Task: Add front images for Ubiquiti devices.

Requirements:
1. Download front images from NetBox device-type library for available Ubiquiti devices
   - Check: https://github.com/netbox-community/devicetype-library/tree/master/device-types/Ubiquiti

2. Process images:
   - Resize to max 400px width
   - Convert to WebP format
   - Save to `src/lib/assets/device-images/ubiquiti/`

3. Create image manifest or update image loading:
   - Map device slugs to image paths
   - Ensure bundled image system picks them up

4. For devices without available images, they will fall back to category-colored rectangles (no action needed)

5. Test that images load correctly in image display mode

Note: This prompt may require manual image sourcing. Focus on devices with readily available images first. Document which devices have images vs fallback.

Files to create/modify:
- src/lib/assets/device-images/ubiquiti/*.webp
- src/lib/data/brandPacks/ubiquiti.ts (if image mapping needed)
```

### Prompt 4.5: Source and Add Mikrotik Images

```text
Context: Same as Ubiquiti - add images for Mikrotik devices.

Task: Add front images for Mikrotik devices.

Requirements:
1. Download front images from NetBox device-type library for available Mikrotik devices
   - Check: https://github.com/netbox-community/devicetype-library/tree/master/device-types/MikroTik

2. Process images (same as Ubiquiti):
   - Resize to max 400px width
   - Convert to WebP format
   - Save to `src/lib/assets/device-images/mikrotik/`

3. Update image loading to include Mikrotik images

4. Document which devices have images

Files to create/modify:
- src/lib/assets/device-images/mikrotik/*.webp
- src/lib/data/brandPacks/mikrotik.ts (if image mapping needed)
```

---

## Phase 5: Export Improvements

### Prompt 5.1: Implement Export File Naming Convention

````text
Context: Currently exports use generic filenames like "export.png". We need meaningful filenames.

Task: Implement the file naming convention: {layout-name}-{view}-{YYYY-MM-DD}.{ext}

Requirements:
1. Create utility function in `src/lib/utils/export.ts`:
   ```typescript
   function generateExportFilename(
     layoutName: string,
     view: 'front' | 'rear' | 'both' | null,
     format: string
   ): string
````

2. Slugify layout name (lowercase, hyphens, no special chars)

3. Include view for image exports, omit for CSV

4. Format date as YYYY-MM-DD

5. Examples:
   - "My Homelab" + front + png → "my-homelab-front-2025-12-12.png"
   - "Server Rack #1" + both + pdf → "server-rack-1-both-2025-12-12.pdf"
   - "My Rack" + null + csv → "my-rack-2025-12-12.csv"

6. Write tests FIRST:
   - Test basic filename generation
   - Test slugification of layout name
   - Test date formatting
   - Test CSV (no view)
   - Test special characters removed

7. Integrate with ExportDialog to use generated filenames

Files to create/modify:

- src/lib/utils/export.ts
- src/lib/utils/export.test.ts
- src/lib/components/ExportDialog.svelte

````

### Prompt 5.2: Implement CSV Export

```text
Context: Rackarr needs to export rack contents as CSV for spreadsheet users.

Task: Implement CSV export functionality.

Requirements:
1. Create CSV export function in `src/lib/utils/export.ts`:
   ```typescript
   function exportToCSV(rack: Rack, deviceTypes: DeviceType[]): string
````

2. CSV columns (in order):
   - Position (U position)
   - Name (custom instance name, empty string if none)
   - Model (device type model)
   - Manufacturer (device type manufacturer, empty string if none)
   - U_Height (device height)
   - Category (device category)
   - Face (front/rear/both)

3. Sort by position descending (top of rack first)

4. Proper CSV escaping (quotes around fields with commas)

5. Write tests FIRST:
   - Test CSV header row
   - Test device rows in correct order
   - Test empty fields handled
   - Test special characters escaped
   - Test multiple devices

6. Add CSV to format options in ExportDialog

7. Trigger download with generated filename

Files to modify:

- src/lib/utils/export.ts
- src/lib/utils/export.test.ts
- src/lib/components/ExportDialog.svelte

````

### Prompt 5.3: Add Export Thumbnail Preview

```text
Context: Users want to see a preview before exporting. Add a thumbnail preview to the export dialog.

Task: Add thumbnail preview to ExportDialog.

Requirements:
1. In ExportDialog, add a preview area that shows:
   - Small-scale rendering of what will be exported
   - Updates when export options change (view, display mode, etc.)
   - Max size ~200px wide, maintain aspect ratio

2. Implementation approach:
   - Reuse existing rack rendering logic
   - Scale down for preview
   - Render to a small canvas or inline SVG

3. Preview should respect current export options:
   - Front/rear/both view
   - Label/image display mode
   - Background color
   - Airflow mode (if enabled)

4. Performance consideration:
   - Debounce preview updates when options change rapidly
   - Show loading state briefly if needed

5. Write tests:
   - Test preview renders
   - Test preview updates when view changes
   - Test preview reflects display mode

Files to modify:
- src/lib/components/ExportDialog.svelte
- src/lib/components/ExportDialog.test.ts
````

### Prompt 5.4: Fix Export Margins

```text
Context: Exported images have inconsistent margins around the rack. Need consistent padding.

Task: Fix export margins to have consistent padding.

Requirements:
1. Identify where export rendering happens (likely in export utility or ExportDialog)

2. Add consistent padding around rack in exports:
   - Minimum 20px padding on all sides
   - Padding should scale proportionally with rack size
   - Consistent between PNG, JPEG, SVG, PDF

3. For "both" view exports:
   - Equal padding around the combined front+rear layout
   - Consistent gap between front and rear views

4. Update export canvas/SVG dimensions to account for padding

5. Write tests:
   - Test single view export has correct dimensions with padding
   - Test both view export has correct dimensions
   - Test padding is consistent across formats

Files to modify:
- src/lib/utils/export.ts (or wherever export rendering happens)
- Related test files
```

### Prompt 5.5: Fix Dual-View Export Layout

```text
Context: When exporting "both" views, the front and rear arrangement needs improvement.

Task: Improve dual-view export layout.

Requirements:
1. When exportView is "both":
   - Front view on left, rear view on right
   - Equal spacing between views (40px gap)
   - Views vertically centered and aligned
   - Labels "Front" and "Rear" above each view (optional, if includeNames is true)

2. Calculate correct canvas dimensions:
   - Width: rack_width * 2 + gap + padding * 2
   - Height: rack_height + padding * 2 + label_height (if labels)

3. Ensure both views render at same scale

4. Write tests:
   - Test dual view renders both front and rear
   - Test views are horizontally arranged
   - Test correct total dimensions
   - Test labels appear when enabled

Files to modify:
- src/lib/utils/export.ts
- Related test files
```

### Prompt 5.6: Fix Export Border and Text Rendering

```text
Context: Exported images have issues with borders looking wrong and text being unclear.

Task: Fix border and text rendering in exports.

Requirements:
1. Borders/lines:
   - Ensure rack rail borders are crisp (no sub-pixel rendering)
   - Device borders should match on-screen appearance
   - Use integer coordinates for sharp lines
   - Check stroke-width and stroke colors match canvas

2. Text rendering:
   - Ensure fonts are embedded in SVG exports
   - Text should be sharp, not blurry
   - Font sizes should match on-screen display
   - Labels should be properly positioned within devices

3. General:
   - Export output should visually match canvas appearance
   - Test across PNG, SVG, PDF formats

4. Debugging approach:
   - Compare canvas rendering vs export rendering
   - Check for CSS properties not being applied to export
   - Verify SVG viewBox and dimensions

5. Write visual regression tests if possible, or manual verification checklist

Files to modify:
- Export-related files
- SVG rendering components if needed
```

### Prompt 5.7: Wire Up Export Dialog Changes

```text
Context: All export improvements are implemented. Final integration and polish.

Task: Ensure all export improvements work together in ExportDialog.

Requirements:
1. ExportDialog should now have:
   - Format selector including CSV option
   - Options panel (existing)
   - Thumbnail preview area
   - Export button that uses generated filename

2. CSV-specific behavior:
   - When CSV selected, hide irrelevant options (background, display mode, etc.)
   - Show only relevant options for data export

3. Preview behavior:
   - Show preview for image formats
   - Show "CSV preview not available" or similar for CSV

4. Filename preview:
   - Show generated filename before export
   - Update in real-time as options change

5. Run full integration test:
   - Test each format exports correctly
   - Test filename is correct
   - Test preview updates
   - Test CSV has correct content

Files to modify:
- src/lib/components/ExportDialog.svelte
- src/lib/components/ExportDialog.test.ts
```

---

## Phase 6: First-Load Experience

### Prompt 6.1: Auto-Open New Rack Dialog on First Load

````text
Context: Rackarr currently shows a WelcomeScreen when there are no racks. Users must click it to open the NewRackForm dialog. We want to improve onboarding by auto-opening the dialog.

Task: Auto-open NewRackForm dialog when rackCount === 0.

Requirements:
1. Add onMount handler in App.svelte that checks layoutStore.rackCount
2. When rackCount === 0 on mount, set newRackFormOpen = true
3. WelcomeScreen remains visible behind the dialog (current aesthetic)
4. If user dismisses dialog, WelcomeScreen is visible (clickable to re-open)
5. Triggers on initial load only (uses onMount, not reactive $effect)

Implementation:
```typescript
// App.svelte - Auto-open new rack dialog on mount
onMount(() => {
  if (layoutStore.rackCount === 0) {
    newRackFormOpen = true;
  }
});
````

TDD approach - Write tests FIRST in src/tests/App.test.ts:

1. "auto-opens NewRackForm dialog on first load when no racks exist"
   - Fresh state with hasStarted = false
   - Expect NewRackForm dialog visible immediately

2. "shows WelcomeScreen behind auto-opened dialog"
   - Fresh state
   - Expect both WelcomeScreen and NewRackForm in DOM

3. "returns to WelcomeScreen when dialog is dismissed without creating rack"
   - Auto-opened dialog is visible
   - Close dialog (find cancel button, click it)
   - Expect WelcomeScreen visible, dialog not visible

4. "can re-open dialog by clicking WelcomeScreen after dismissing"
   - Dismiss auto-opened dialog
   - Click WelcomeScreen
   - Expect dialog opens again

Files to modify:

- src/App.svelte (add $effect)
- src/tests/App.test.ts (add test cases)

````

---

## Completion Checklist

After all prompts are completed, verify:

- [ ] Power properties (outlet_count, va_rating) work in schema and display
- [ ] CollapsibleSection component works with accessibility
- [ ] DevicePalette shows Generic, Ubiquiti, Mikrotik sections
- [ ] Search works across all sections
- [ ] Ubiquiti devices appear with correct properties
- [ ] Mikrotik devices appear with correct properties
- [ ] Brand device images load (where available)
- [ ] Export uses correct filename convention
- [ ] CSV export works with correct columns
- [ ] Export preview shows in dialog
- [ ] Export margins are consistent
- [ ] Dual-view export layout is correct
- [ ] Export borders and text are crisp
- [ ] NewRackForm auto-opens on first load (rackCount === 0)
- [ ] WelcomeScreen visible behind auto-opened dialog
- [ ] All tests pass
- [ ] Build succeeds

---

## Notes for Implementation

### Pre-commit Hooks

The project has pre-commit hooks that run automatically on every commit:

```bash
# .husky/pre-commit
npx lint-staged          # ESLint + Prettier on staged files
npm run test:run         # ALL unit tests must pass
````

**This means:**

- Every commit will run the full test suite
- Commits will be rejected if any test fails
- Lint and formatting errors will block commits

### TDD Workflow with Pre-commit Hooks

1. **Write failing test** — Create test for new functionality
2. **Run tests manually** — `npm run test:run` to verify test fails
3. **Implement** — Write code to make test pass
4. **Run tests manually** — `npm run test:run` to verify ALL tests pass
5. **Lint check** — `npm run lint` and `npm run check`
6. **Commit** — Pre-commit hook re-verifies (safety net, not primary check)

**Important:** Don't rely on pre-commit hooks to catch issues. Run tests manually first to get faster feedback and avoid commit failures.

### Implementation Guidelines

1. **TDD is mandatory** — Write tests before implementation for each prompt
2. **Small commits** — Commit after each prompt completion
3. **Run tests frequently** — `npm run test:run` after each change
4. **Check build** — `npm run build` before marking prompt complete
5. **Visual verification** — Some export changes need manual visual check
6. **Lint early** — Run `npm run lint` before attempting to commit

### Quick Verification Commands

```bash
npm run test:run         # All unit tests
npm run lint             # ESLint
npm run check            # Svelte type checking
npm run build            # Production build
npm run test:e2e         # E2E tests (run after major changes)
```

---

## Phase 7: Console Log Standardization

### Overview

Standardize all console logging to use consistent `[rackarr:category] message` format.

**Current inconsistent formats:**

- `[RACKARR DEVICE:PLACE]` - device logging
- `[RACKARR DEBUG]` - general debug
- `[RACKARR]` - startup messages

**Target format:** `[rackarr:category] message` (lowercase, colon-delimited)

### Prompt 7.1: Update debug.ts Log Prefixes

```text
Context: Rackarr console logging is inconsistent. Standardize to [rackarr:category] format.

Task: Update src/lib/utils/debug.ts to use standardized prefixes.

Requirements:
1. Add constant: `const LOG_PREFIX = 'rackarr';`
2. Update all log methods to use new format:
   - `debug.log()` → `[rackarr:debug] message`
   - `debug.warn()` → `[rackarr:debug:warn] message`
   - `debug.error()` → `[rackarr:debug:error] message`
   - `debug.group()` → `[rackarr:debug] label`
   - `debug.devicePlace()` → `[rackarr:device:place] message`
   - `debug.deviceMove()` → `[rackarr:device:move] message`
   - `debug.collision()` → `[rackarr:collision] message`
3. Add `debug.info()` method for general info: `[rackarr] message`
4. Update startup message to use `[rackarr]` prefix
5. Update enable/disable messages to use `[rackarr]` prefix

TDD:
1. Write tests in src/tests/debug.test.ts for:
   - Each log method outputs correct prefix
   - Prefix format matches [rackarr:category] pattern
2. Run tests (should fail)
3. Implement changes
4. Run tests (should pass)
5. Verify: npm run lint && npm run check && npm run build
```

### Prompt 7.2: Update Canvas.svelte Panzoom Logging

```text
Context: Canvas.svelte uses debug.log() for panzoom initialization.

Task: Ensure panzoom logging uses correct category.

Requirements:
1. Check Canvas.svelte panzoom initialization logs
2. If using debug.log(), the output will automatically be [rackarr:debug]
3. No code changes needed if already using debug.log()
4. Verify by running tests

TDD:
1. Check existing tests cover panzoom logging
2. Verify output format in test runs
3. If needed, add test to verify [rackarr:debug] prefix
```

### Prompt 7.3: Verify All Console Usages

```text
Context: Ensure no direct console.log calls bypass the debug system.

Task: Audit codebase for direct console.log usage and migrate to debug utility.

Requirements:
1. Search for console.log/warn/error in src/lib (excluding debug.ts)
2. Replace any direct calls with debug.* equivalents
3. Exception: Keep console.log in vitest test setup if needed

TDD:
1. Run: grep -r "console\." src/lib --include="*.ts" --include="*.svelte" | grep -v debug.ts
2. For each finding, determine if it should use debug.*
3. Update and verify tests pass
```

### Completion Criteria (Phase 7.1-7.3)

- [x] All console output uses `[rackarr:category]` format
- [x] debug.ts uses LOG_PREFIX constant
- [x] Tests verify correct prefixes
- [x] No direct console.log in src/lib (except debug.ts)
- [x] All tests pass
- [x] Lint and build pass

---

## Phase 8: UI Bug Fixes

### Prompt 8.1: Fix CollapsibleSection Header Overlap

```text
Context: CollapsibleSection headers use `position: sticky` which causes headers to stack/overlap at `top: 0` when scrolling within DevicePalette. This makes bottommost items in expanded sections invisible.

Task: Remove sticky positioning from CollapsibleSection headers.

Requirements:
1. Remove from `.collapsible-header` in CollapsibleSection.svelte:
   - `position: sticky`
   - `top: 0`
   - `z-index: 1`
2. Headers should scroll normally with content
3. Retain all other styling (border, padding, hover states)

TDD:
1. Write test verifying header does NOT have `position: sticky`
2. Run tests (should fail)
3. Remove sticky positioning
4. Run tests (should pass)
5. Verify: npm run lint && npm run check && npm run build
```

### Completion Criteria (Phase 8)

- [ ] CollapsibleSection headers scroll with content
- [ ] No header overlap when multiple sections expanded
- [ ] All tests pass
- [ ] Visual verification in browser

---

## Phase 9: Exclusive Accordion Refactor

### Overview

Replace the current CollapsibleSection implementation with a Bits UI exclusive accordion pattern. This eliminates scroll/visibility issues by ensuring only one section is open at a time.

**Research Reference:** RES-01 (ROADMAP.md)

### Prompt 9.1: Install and Configure Bits UI Accordion

```text
Context: Rackarr DevicePalette currently uses CollapsibleSection components that cause scroll/visibility issues when multiple sections are expanded. We're refactoring to use Bits UI Accordion with exclusive (radio-style) behavior.

Task: Add Bits UI dependency and create base Accordion wrapper component.

Requirements:
1. Install Bits UI: `npm install bits-ui`

2. Create `src/lib/components/ui/Accordion/` directory with:
   - `index.ts` — barrel export for Accordion components
   - Wrapper components that configure Bits UI Accordion with `type="single"`

3. Ensure CSS variables integrate with existing theme system:
   - Use `--colour-surface-primary`, `--colour-text-primary`, etc.
   - Support `data-state="open|closed"` for styling

4. Write tests FIRST in `src/lib/components/ui/Accordion/Accordion.test.ts`:
   - Test Accordion renders with provided sections
   - Test only one section can be open at a time (exclusive behaviour)
   - Test clicking open section closes it
   - Test clicking different section switches to it
   - Test section headers are keyboard accessible (Tab, Enter, Space)
   - Test ARIA attributes are correctly applied (`aria-expanded`, `aria-controls`)

TDD:
1. Write tests (should fail — component doesn't exist)
2. Install bits-ui
3. Create Accordion wrapper components
4. Run tests (should pass)
5. Verify: npm run lint && npm run check && npm run build

Files to create:
- src/lib/components/ui/Accordion/index.ts
- src/lib/components/ui/Accordion/Accordion.svelte (or wrapper components)
- src/lib/components/ui/Accordion/Accordion.test.ts
```

### Prompt 9.2: Refactor DevicePalette to Exclusive Accordion

```text
Context: Bits UI Accordion wrapper is available. Refactor DevicePalette to replace CollapsibleSection with the exclusive accordion.

Task: Replace current CollapsibleSection with Bits UI Accordion.

Requirements:
1. Replace CollapsibleSection imports with new Accordion components

2. Convert sections array to Accordion structure:
   - Accordion.Root with `type="single"` and `defaultValue="generic"`
   - Each section becomes an Accordion.Item
   - Device list goes in Accordion.Content

3. Maintain existing functionality:
   - Section headers show device count
   - Devices are draggable (svelte-dnd-action)
   - Click device to add to rack

4. Handle svelte-dnd-action integration:
   - Use `onconsider`/`onfinalize` (Svelte 5 syntax)
   - Set `type: 'device-palette'` to scope drag operations
   - Each Accordion.Content contains the dnd-zone

5. Write tests FIRST in `src/lib/components/DevicePalette.test.ts`:
   - Test DevicePalette renders all brand sections
   - Test only one section expanded at a time
   - Test default state: Generic section expanded
   - Test section items are draggable
   - Test switching sections doesn't break drag state
   - Test collapsing open section works

TDD:
1. Write/update tests for exclusive accordion behavior
2. Run tests (should fail — still using CollapsibleSection)
3. Refactor to use Accordion
4. Run tests (should pass)
5. Manual verification: drag-and-drop still works

Files to modify:
- src/lib/components/DevicePalette.svelte
- src/lib/components/DevicePalette.test.ts
```

### Prompt 9.3: Add Device Search to Palette

```text
Context: DevicePalette uses exclusive accordion. Add global search input for cross-brand device discovery.

Task: Global search input that filters across all brand sections.

Requirements:
1. Add search input component above Accordion:
   - Placeholder: "Search devices..."
   - Clear button when text present
   - Debounced input (200ms)

2. Create derived state for filtered devices:
   - Filter devices across all sections by name
   - Case-insensitive partial match

3. Search behavior with exclusive accordion:
   - When search has results, auto-expand first matching section
   - Show match count per section in header
   - Clear search restores previous expansion state (Generic)

4. Empty results handling:
   - Show "No devices found" message
   - Keep all sections collapsed

5. Keyboard shortcut:
   - Ctrl+K / Cmd+K focuses search input
   - Escape clears search and returns focus to content

6. Write tests FIRST:
   - Test search input renders above accordion
   - Test typing filters devices across all sections
   - Test matching section auto-expands
   - Test clearing search restores Generic expanded
   - Test empty results show "No devices found"
   - Test keyboard shortcut focuses search

TDD:
1. Write tests for search behavior
2. Run tests (should fail)
3. Implement search functionality
4. Run tests (should pass)
5. Manual verification

Files to modify:
- src/lib/components/DevicePalette.svelte
- src/lib/components/DevicePalette.test.ts
```

### Prompt 9.4: Smooth Accordion Animation

```text
Context: Accordion is functional but needs smooth animations for expand/collapse.

Task: CSS Grid animation for expand/collapse transitions.

Requirements:
1. Implement CSS Grid animation:
   - `grid-template-rows: 0fr → 1fr` for expand
   - `grid-template-rows: 1fr → 0fr` for collapse
   - Content wrapper with `overflow: hidden`

2. Animation timing:
   - Duration: 200-300ms
   - Easing: ease-out for natural feel

3. Accessibility:
   - Respect `prefers-reduced-motion` media query
   - Instant transition for users with reduced motion preference

4. DnD compatibility:
   - Ensure animation doesn't interfere with drag operations
   - Test dragging during animation works correctly

5. Write tests:
   - Test accordion content animates smoothly on expand
   - Test accordion content animates smoothly on collapse
   - Test animation doesn't interfere with drag operations
   - Test reduced motion preference is respected

TDD:
1. Write tests for animation behavior
2. Run tests (animation tests may need visual verification)
3. Implement CSS Grid animation
4. Run tests (should pass)
5. Manual verification: smooth 60fps animation

Files to modify:
- src/lib/components/ui/Accordion/Accordion.svelte (or relevant component)
- src/lib/components/DevicePalette.svelte (if needed)
- src/lib/styles/tokens.css (if animation tokens needed)
```

### Prompt 9.5: Cleanup CollapsibleSection

```text
Context: DevicePalette now uses Bits UI Accordion. Clean up the old CollapsibleSection component.

Task: Remove or deprecate CollapsibleSection component.

Requirements:
1. Check if CollapsibleSection is used elsewhere in codebase:
   - Search for imports across all components
   - If used elsewhere, keep it; if only DevicePalette used it, remove it

2. If removing:
   - Delete `src/lib/components/CollapsibleSection.svelte`
   - Delete `src/lib/components/CollapsibleSection.test.ts`
   - Remove any related CSS tokens

3. If keeping:
   - Add deprecation notice in component docstring
   - Document that Accordion should be used for new features

4. Update imports and barrel exports

5. Run full test suite to ensure nothing breaks

TDD:
1. Search for CollapsibleSection usage
2. Make decision: remove or deprecate
3. Execute cleanup
4. Run full test suite
5. Verify: npm run lint && npm run check && npm run build

Files to modify:
- Potentially delete CollapsibleSection files
- Update any barrel exports
```

### Completion Criteria (Phase 9)

- [ ] Bits UI installed and configured
- [ ] DevicePalette uses exclusive accordion
- [ ] Only one section open at a time
- [ ] Search filters across all sections
- [ ] Smooth animation on expand/collapse
- [ ] Drag-and-drop still works
- [ ] Keyboard navigation works
- [ ] Reduced motion respected
- [ ] All tests pass
- [ ] Visual verification in browser

---

_This plan implements ROADMAP items R-01 through R-05 for Rackarr v0.6.0_
