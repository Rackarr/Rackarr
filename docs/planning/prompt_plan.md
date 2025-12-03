# Rackarr v0.4 Implementation Prompt Plan

This document contains a series of prompts for implementing the v0.4 data schema changes in a test-driven manner. Each prompt builds on the previous ones, ensuring incremental progress with strong testing.

---

## Overview

### Implementation Phases

1. **Foundation** (Prompts 1-3): Dependencies, utilities, types
2. **Schemas** (Prompts 4-5): Zod validation updates
3. **Serialization** (Prompts 6-8): YAML support, file operations
4. **Migration** (Prompts 9-10): Legacy format support
5. **Store Updates** (Prompts 11-13): Layout store refactoring
6. **Component Updates** (Prompts 14-18): UI component updates
7. **Integration** (Prompts 19-20): E2E tests, final wiring

### Prerequisites

- Read `docs/planning/v0.4-implementation-spec.md` for full specification
- Read `docs/planning/data-schema-spec.md` for schema decisions
- Current tests should be passing before starting

---

## Phase 1: Foundation

### Prompt 1: Add js-yaml Dependency

````text
Add the js-yaml dependency to the project for YAML serialization.

Tasks:
1. Install js-yaml and @types/js-yaml
2. Verify the package is installed correctly by creating a simple test

Run:
```bash
npm install js-yaml
npm install -D @types/js-yaml
````

Create a simple verification test at `src/lib/utils/yaml.test.ts`:

- Test that js-yaml can be imported
- Test that it can parse a simple YAML string
- Test that it can serialize a simple object

Run the tests to verify the dependency works.

Do not modify any existing code yet - just add the dependency and verify it works.

````

---

### Prompt 2: Create Slug Utilities

```text
Create slug generation and validation utilities following TDD.

Reference: `docs/planning/v0.4-implementation-spec.md` Section 6, Task 1.2

Create `src/lib/utils/slug.ts` with the following functions:
- `slugify(input: string): string` - Convert any string to a valid slug
- `generateDeviceSlug(manufacturer?: string, model?: string, name?: string): string` - Generate slug from device info
- `isValidSlug(slug: string): boolean` - Validate slug format
- `ensureUniqueSlug(slug: string, existingSlugs: Set<string>): string` - Ensure uniqueness

Slug rules:
- Lowercase only
- Alphanumeric and hyphens only
- No leading/trailing hyphens
- No consecutive hyphens
- Pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/

Write tests FIRST in `src/lib/utils/slug.test.ts`:

Test cases for slugify:
- "Synology DS920+" → "synology-ds920-plus"
- "UniFi Dream Machine" → "unifi-dream-machine"
- "Some---Thing" → "some-thing"
- "-test-" → "test"
- "UPPERCASE" → "uppercase"
- "with  spaces" → "with-spaces"
- "special!@#chars" → "special-chars"
- "" → "" (empty string)

Test cases for generateDeviceSlug:
- With manufacturer and model: generates from both
- With only name: generates from name
- With nothing: generates timestamp-based fallback

Test cases for isValidSlug:
- "valid-slug" → true
- "also-valid-123" → true
- "Invalid Slug" → false (uppercase, space)
- "-invalid" → false (leading hyphen)
- "invalid-" → false (trailing hyphen)

Test cases for ensureUniqueSlug:
- Returns original if unique
- Appends -2 if duplicate exists
- Increments number until unique (my-slug-2, my-slug-3, etc.)

Run tests, watch them fail, then implement to make them pass.
````

---

### Prompt 3: Create New Type Definitions

```text
Create the new v0.4 type definitions alongside existing types (don't modify existing yet).

Reference: `docs/planning/v0.4-implementation-spec.md` Section 4.1

Create `src/lib/types/v04.ts` with the new interfaces:

1. DeviceType interface (renamed from Device):
   - slug: string (required)
   - u_height: number (required, renamed from height)
   - manufacturer?: string
   - model?: string
   - is_full_depth?: boolean
   - weight?: number
   - weight_unit?: 'kg' | 'lb'
   - airflow?: Airflow
   - comments?: string
   - rackarr: { colour: string, category: DeviceCategory, tags?: string[] }

2. Device interface (renamed from PlacedDevice):
   - device_type: string (slug reference, renamed from libraryId)
   - name?: string (new - optional display name)
   - position: number
   - face: DeviceFace

3. Rack interface (updated):
   - All fields snake_case
   - devices: Device[] (not PlacedDevice[])
   - view is runtime-only (marked with comment)

4. Layout interface (updated):
   - rack: Rack (singular, not racks[])
   - device_types: DeviceType[] (not deviceLibrary)

Write a type test file `src/lib/types/v04.test.ts` that:
- Creates sample objects of each type
- Verifies type assignments compile correctly
- Documents the expected structure

This is a parallel types file - existing code continues to use old types.
Export types with 'V04' suffix to avoid conflicts: DeviceTypeV04, DeviceV04, etc.
```

---

## Phase 2: Schemas

### Prompt 4: Create v0.4 Zod Schemas

```text
Create Zod validation schemas for the v0.4 data structures.

Reference: `docs/planning/v0.4-implementation-spec.md` Section 4.2

Create `src/lib/schemas/v04.ts` with:

1. SlugSchema - validates slug format with regex
2. DeviceCategorySchema - enum of all categories
3. FormFactorSchema - enum of form factors
4. AirflowSchema - enum of airflow directions
5. DeviceFaceSchema - enum: front, rear, both
6. WeightUnitSchema - enum: kg, lb
7. RackarrExtensionsSchema - colour, category, tags
8. DeviceTypeSchema - full device type validation
9. DeviceSchema - placed device validation
10. RackSchema - rack with devices array
11. LayoutSettingsSchema - display settings
12. LayoutSchema - complete layout validation

Write tests FIRST in `src/lib/schemas/v04.test.ts`:

Test DeviceTypeSchema:
- Valid device type passes
- Missing slug fails
- Invalid slug format fails
- Missing u_height fails
- u_height < 1 fails
- u_height > 50 fails
- Invalid colour format fails
- Invalid category fails

Test DeviceSchema:
- Valid device passes
- Missing device_type fails
- Invalid position (< 1) fails
- Invalid face fails
- Optional name is allowed

Test RackSchema:
- Valid rack passes
- Missing name fails
- Invalid width (not 10 or 19) fails
- Empty devices array is valid

Test LayoutSchema:
- Complete valid layout passes
- Missing version fails
- Missing rack fails

Run tests, implement schemas to pass.
```

---

### Prompt 5: Add Slug Uniqueness Validation

````text
Add a helper function to validate slug uniqueness within a layout.

Reference: `docs/planning/v0.4-implementation-spec.md` Section 4.2

Add to `src/lib/schemas/v04.ts`:

```typescript
function validateSlugUniqueness(device_types: { slug: string }[]): string[]
````

This function:

- Takes an array of objects with slug property
- Returns array of duplicate slugs (empty if all unique)
- Used before save to catch duplicates

Write tests FIRST in `src/lib/schemas/v04.test.ts`:

Test validateSlugUniqueness:

- Empty array returns []
- All unique slugs returns []
- One duplicate returns [duplicate]
- Multiple duplicates returns all duplicates
- Three of same slug returns that slug once

Also add a Zod refinement to LayoutSchema that uses this:

- Add .refine() to check slug uniqueness
- Custom error message: "Duplicate device type slugs: {slugs}"

Test the refinement:

- Layout with unique slugs passes
- Layout with duplicate slugs fails with appropriate message

Run tests, implement to pass.

````

---

## Phase 3: Serialization

### Prompt 6: Create YAML Serialization Utilities

```text
Create YAML serialization utilities for layouts.

Reference: `docs/planning/v0.4-implementation-spec.md` Section 6, Task 2.1

Create `src/lib/utils/yaml.ts` with:

1. `serializeToYaml(layout: LayoutV04): string`
   - Convert layout to YAML string
   - Exclude runtime-only fields (view)
   - Use 2-space indentation
   - Preserve field order (don't sort keys)

2. `parseYaml(yamlString: string): LayoutV04`
   - Parse YAML string to layout object
   - Validate with LayoutSchema
   - Add runtime defaults (view: 'front')
   - Throw descriptive errors for invalid YAML

Write tests FIRST in `src/lib/utils/yaml.test.ts` (expand from Prompt 1):

Test serializeToYaml:
- Produces valid YAML that can be parsed back
- Excludes view field from output
- Includes all required fields
- Maintains field order (version, name, rack, device_types, settings)
- Properly indents nested structures

Test parseYaml:
- Parses valid YAML correctly
- Returns layout with all fields
- Adds default view: 'front'
- Throws on invalid YAML syntax
- Throws on schema validation failure
- Error message includes details about what's wrong

Test round-trip:
- serialize then parse returns equivalent object
- All device_types preserved
- All devices preserved
- Settings preserved

Run tests, implement to pass.
````

---

### Prompt 7: Create Folder-Based Save Utilities

```text
Create utilities for saving layouts as folder structure (inside ZIP for browser download).

Reference: `docs/planning/v0.4-implementation-spec.md` Section 5

Create `src/lib/utils/folder.ts` with:

1. `createFolderArchive(layout: LayoutV04, images: Map<string, DeviceImages>): Promise<Blob>`
   - Creates a ZIP containing folder structure
   - Structure: [name]/[name].yaml + [name]/assets/[slug]/[face].[ext]
   - Uses JSZip (already a dependency)
   - Sanitizes folder name using slugify

2. `extractFolderArchive(blob: Blob): Promise<{ layout: LayoutV04, images: Map<string, DeviceImages> }>`
   - Extracts ZIP with folder structure
   - Finds .yaml file in root folder
   - Loads images from assets subfolder
   - Returns parsed layout and images

3. Helper: `getImageExtension(mimeType: string): string`
   - Maps MIME type to file extension

4. Helper: `getMimeType(filename: string): string`
   - Maps file extension to MIME type

Write tests FIRST in `src/lib/utils/folder.test.ts`:

Test createFolderArchive:
- Creates valid ZIP blob
- ZIP contains folder with layout name
- Folder contains .yaml file
- YAML file has correct content
- Assets folder exists when images present
- Images are in correct nested structure

Test extractFolderArchive:
- Extracts layout from valid ZIP
- Extracts images correctly
- Maps images to correct device slugs
- Throws on missing .yaml file
- Throws on invalid YAML content

Test round-trip:
- Create archive then extract returns equivalent data
- Images preserved with correct face assignments

Use mocked JSZip or actual ZIP operations in tests.
Run tests, implement to pass.
```

---

### Prompt 8: Update File Detection and Loading

```text
Update file utilities to detect and handle the new folder format.

Reference: Existing `src/lib/utils/file.ts` and `src/lib/utils/archive.ts`

Modify `src/lib/utils/file.ts`:

1. Update `detectFileFormat(file: File)` to return:
   - 'folder-archive' for new ZIP with folder structure
   - 'legacy-archive' for old .rackarr.zip format
   - 'legacy-json' for .rackarr.json
   - 'unknown' for unrecognized

2. Detection logic:
   - Check file extension first
   - For .zip files, peek inside to distinguish:
     - Has `*//*.yaml` = folder-archive
     - Has `layout.json` = legacy-archive

Write tests FIRST in `src/lib/utils/file.test.ts` (add to existing):

Test detectFileFormat:
- .rackarr.json returns 'legacy-json'
- .zip with folder/folder.yaml returns 'folder-archive'
- .zip with layout.json returns 'legacy-archive'
- .txt returns 'unknown'
- .zip with neither returns 'unknown'

Create test fixtures:
- A minimal folder-archive ZIP
- Reuse existing legacy-archive fixtures

Do NOT change the actual save/load flow yet - just detection.
Run tests, implement to pass.
```

---

## Phase 4: Migration

### Prompt 9: Create Layout Migration Utility

```text
Create migration utility to convert v0.1-v0.3 layouts to v0.4 format.

Reference: `docs/planning/v0.4-implementation-spec.md` Section 8

Create `src/lib/utils/migrate-v04.ts` with:

1. `migrateToV04(legacy: LegacyLayout): LayoutV04`
   - Converts old format to new format
   - Generates slugs for all devices
   - Maps libraryId references to slugs
   - Takes first rack only (single-rack mode)
   - Sets version to "0.4.0"

2. Define `LegacyLayout` interface matching v0.3 structure:
   - deviceLibrary: LegacyDevice[]
   - racks: LegacyRack[]
   - etc.

3. `detectLayoutVersion(data: unknown): string`
   - Returns version string or 'unknown'
   - Handles missing version field

Write tests FIRST in `src/lib/utils/migrate-v04.test.ts`:

Test migrateToV04:
- Sets version to "0.4.0"
- Converts deviceLibrary to device_types
- Renames height to u_height
- Generates valid slugs for all devices
- Handles duplicate names (unique slugs)
- Converts first rack only
- Maps libraryId to device_type correctly
- Preserves device positions and faces
- Preserves rack properties (height, width, etc.)
- Handles missing optional fields gracefully

Test slug generation during migration:
- Device named "Test Server" gets slug "test-server"
- Two devices named "Test Server" get "test-server" and "test-server-2"
- Preserves mapping so placed devices reference correct slug

Test detectLayoutVersion:
- Object with version: "0.3.0" returns "0.3.0"
- Object with deviceLibrary but no version returns "0.3.0"
- Object with racks array returns "0.1.0"
- Empty object returns "unknown"

Run tests, implement to pass.
```

---

### Prompt 10: Create Image Migration Utility

````text
Create utility to migrate images from old naming to new structure.

Reference: Old format uses `device-{uuid}-{face}.{ext}`, new uses `{slug}/{face}.{ext}`

Add to `src/lib/utils/migrate-v04.ts`:

1. `migrateImages(oldImages: Map<string, DeviceImages>, idToSlugMap: Map<string, string>): Map<string, DeviceImages>`
   - Converts UUID-keyed image map to slug-keyed
   - Uses idToSlugMap from layout migration
   - Preserves image data, just changes keys

2. Update `migrateToV04` to also return the idToSlugMap:
   ```typescript
   function migrateToV04(legacy: LegacyLayout): {
     layout: LayoutV04,
     idToSlugMap: Map<string, string>
   }
````

Write tests FIRST (add to `src/lib/utils/migrate-v04.test.ts`):

Test migrateImages:

- Empty map returns empty map
- Single device images mapped correctly
- Multiple devices mapped correctly
- Unknown IDs are skipped (logged warning)
- Both front and rear images preserved

Test integration:

- migrateToV04 returns valid idToSlugMap
- Map contains entry for each device
- Map values are valid slugs matching device_types

Run tests, implement to pass.

````

---

## Phase 5: Store Updates

### Prompt 11: Create v0.4 Layout Store Helpers

```text
Create helper functions for the layout store that work with v0.4 types.

These are new functions that will be used alongside existing store - no modifications yet.

Create `src/lib/stores/layout-helpers-v04.ts` with:

1. `createDeviceType(data: { name: string, u_height: number, category: DeviceCategory, colour: string, ... }): DeviceTypeV04`
   - Creates a new device type with auto-generated slug
   - Ensures slug is valid format

2. `createDevice(device_type: string, position: number, face: DeviceFace, name?: string): DeviceV04`
   - Creates a placed device referencing a device type by slug

3. `findDeviceType(device_types: DeviceTypeV04[], slug: string): DeviceTypeV04 | undefined`
   - Find device type by slug

4. `getDeviceDisplayName(device: DeviceV04, device_types: DeviceTypeV04[]): string`
   - Returns device.name if set
   - Falls back to device type's model or slug

Write tests FIRST in `src/lib/stores/layout-helpers-v04.test.ts`:

Test createDeviceType:
- Generates valid slug from name
- Sets all required fields
- Includes rackarr extensions

Test createDevice:
- Creates device with correct device_type reference
- Optional name is handled correctly

Test findDeviceType:
- Finds existing device type
- Returns undefined for non-existent slug

Test getDeviceDisplayName:
- Returns device name if set
- Returns model if name not set
- Returns slug as fallback

Run tests, implement to pass.
````

---

### Prompt 12: Create Parallel v0.4 Store Functions

```text
Create v0.4 versions of core store operations as separate functions.

These functions work with v0.4 types and will replace existing ones later.

Add to `src/lib/stores/layout-helpers-v04.ts`:

1. `addDeviceTypeToLayout(layout: LayoutV04, deviceType: DeviceTypeV04): LayoutV04`
   - Immutably adds device type to layout
   - Validates slug uniqueness
   - Throws if duplicate slug

2. `removeDeviceTypeFromLayout(layout: LayoutV04, slug: string): LayoutV04`
   - Removes device type by slug
   - Also removes all placed devices referencing it

3. `placeDeviceInRack(layout: LayoutV04, device: DeviceV04): LayoutV04`
   - Adds device to rack
   - Validates device_type exists
   - Does NOT check collisions (caller responsibility)

4. `removeDeviceFromRack(layout: LayoutV04, index: number): LayoutV04`
   - Removes device at index from rack

Write tests FIRST (add to `src/lib/stores/layout-helpers-v04.test.ts`):

Test addDeviceTypeToLayout:
- Adds device type to empty layout
- Adds to existing device_types
- Throws on duplicate slug
- Original layout unchanged (immutable)

Test removeDeviceTypeFromLayout:
- Removes device type
- Removes placed devices referencing it
- No-op if slug doesn't exist

Test placeDeviceInRack:
- Adds device to rack.devices
- Throws if device_type doesn't exist in device_types

Test removeDeviceFromRack:
- Removes device at index
- Handles out-of-bounds gracefully

Run tests, implement to pass.
```

---

### Prompt 13: Update Layout Store Types

```text
Update the layout store to use v0.4 types internally.

This is the main refactoring of `src/lib/stores/layout.svelte.ts`.

Changes:
1. Import v0.4 types instead of old types
2. Rename internal functions:
   - addDeviceToLibrary → addDeviceType
   - updateDeviceInLibrary → updateDeviceType
   - deleteDeviceFromLibrary → deleteDeviceType
3. Update all field names:
   - deviceLibrary → device_types
   - height → u_height
   - libraryId → device_type
4. Update placeDevice to use device_type slug
5. Use helper functions from layout-helpers-v04.ts

Write/update tests in `src/lib/stores/layout.svelte.test.ts`:

Update existing tests:
- Change field names in assertions
- Change function names in calls
- Update test data to use v0.4 structure

New tests:
- addDeviceType generates valid slug
- Device placement uses device_type slug
- getDeviceDisplayName returns correct value

Key changes to verify:
- layout.device_types exists (not deviceLibrary)
- DeviceType has slug and u_height
- Device has device_type (not libraryId)
- All snake_case field names

Run existing tests first - they should fail.
Update tests to match new structure.
Update store implementation to pass tests.
```

---

## Phase 6: Component Updates

### Prompt 14: Update Type Imports Across Components

```text
Update all components to import v0.4 types.

Files to update (imports only, not logic yet):
- src/lib/components/DevicePalette.svelte
- src/lib/components/Rack.svelte
- src/lib/components/EditPanel.svelte
- src/lib/components/AddDeviceForm.svelte
- src/lib/components/ExportDialog.svelte
- src/App.svelte

For each file:
1. Update type imports to use v0.4 types
2. TypeScript will show errors for mismatched field names
3. Do NOT fix the errors yet - just update imports

This prompt is preparation for the next prompts which will fix each component.

After updating imports, run `npm run check` to see all type errors.
Document the errors - they indicate what needs to change in each component.

Expected errors:
- deviceLibrary → device_types
- device.height → device.u_height
- placedDevice.libraryId → device.device_type
- Device type → DeviceType
- etc.

Do not run tests yet - they will fail until components are updated.
```

---

### Prompt 15: Update DevicePalette Component

```text
Update DevicePalette.svelte to work with v0.4 types.

Reference the type errors from Prompt 14.

Changes needed:
1. Use device_types instead of deviceLibrary
2. Use u_height instead of height
3. Use slug for device identification
4. Update any local type annotations

Update the component:
- Props/bindings that reference devices
- Event handlers that create/select devices
- Display logic for device info

Write/update tests in `src/lib/components/DevicePalette.test.ts`:
- Test rendering with v0.4 device types
- Test slug-based identification
- Test display of u_height

Run component tests after changes.
Verify no TypeScript errors in this component.
```

---

### Prompt 16: Update Rack Component

```text
Update Rack.svelte to work with v0.4 types.

Changes needed:
1. Use Device (placed) instead of PlacedDevice
2. Use device.device_type instead of device.libraryId
3. Look up DeviceType by slug instead of id
4. Use u_height for device height calculations
5. Support optional device.name for display

Key logic changes:
- Find device type: `device_types.find(dt => dt.slug === device.device_type)`
- Display name: use device.name ?? deviceType.model ?? deviceType.slug
- Height: use deviceType.u_height

Update tests in `src/lib/components/Rack.test.ts`:
- Use v0.4 test data
- Test device lookup by slug
- Test display name fallback logic
- Test u_height rendering

Run tests after changes.
```

---

### Prompt 17: Update EditPanel Component

```text
Update EditPanel.svelte to work with v0.4 types.

Changes needed:
1. Device type editing uses slug
2. Field names use snake_case (u_height, device_type)
3. Support editing optional device.name
4. Update validation for slug format

If EditPanel allows editing device type properties:
- Slug should be editable but validated
- Show warning if slug change would break references

Write/update tests in `src/lib/components/EditPanel.test.ts`:
- Test editing device with v0.4 structure
- Test slug validation
- Test device name editing

Run tests after changes.
```

---

### Prompt 18: Update AddDeviceForm and App Component

````text
Update AddDeviceForm.svelte and App.svelte to work with v0.4 types.

AddDeviceForm changes:
1. Form creates DeviceType (not Device)
2. Auto-generate slug from name input
3. Show generated slug preview
4. Use u_height field name
5. Event emits DeviceType structure

App.svelte changes:
1. Update handler for new device creation
2. Use addDeviceType store function
3. Update save/load to use new file format
4. Update any type annotations

Write/update tests:
- AddDeviceForm.test.ts: Test form creates valid DeviceType
- Integration tests for save/load flow

After this prompt, run full test suite:
```bash
npm run test:run
npm run check
````

Fix any remaining type errors.

````

---

## Phase 7: Integration

### Prompt 19: Wire Up New File Operations

```text
Integrate the new save/load operations into the application.

Update `src/App.svelte` handleSave and handleLoad:

handleSave:
1. Use createFolderArchive for new saves
2. Pass device_types and images
3. Generate filename from layout.name using slugify
4. Show toast with filename

handleLoad:
1. Use detectFileFormat to identify format
2. For 'folder-archive': use extractFolderArchive
3. For 'legacy-archive': use extractArchive + migrateToV04
4. For 'legacy-json': use readLayoutFile + migrateToV04
5. Migrate images using migrateImages when loading legacy
6. Show appropriate toast messages

Update `src/lib/utils/file.ts`:
1. Export new unified load function that handles all formats
2. Keep backward compatibility

Write integration tests:
- Save new layout, verify folder structure in ZIP
- Load legacy .rackarr.zip, verify migration
- Load legacy .rackarr.json, verify migration
- Round-trip: save then load returns equivalent data

Run all unit tests: `npm run test:run`
Run type check: `npm run check`
````

---

### Prompt 20: E2E Tests and Final Verification

````text
Create/update E2E tests for the complete v0.4 flow.

Create test fixtures in `e2e/fixtures/`:
1. `legacy-v0.3.rackarr.zip` - Old format archive
2. `valid-v0.4/` folder with valid v0.4 structure

Update E2E tests in `e2e/`:

Test: Create and save new layout
1. Create new rack
2. Add device type to library
3. Place device in rack
4. Save layout
5. Verify downloaded ZIP has folder structure
6. Verify YAML content is correct

Test: Load legacy v0.3 file
1. Load legacy-v0.3.rackarr.zip
2. Verify rack displays correctly
3. Verify devices are placed correctly
4. Save again
5. Verify saves in new format

Test: Round-trip preservation
1. Create layout with multiple device types
2. Add images to some devices
3. Save
4. Reload saved file
5. Verify all data preserved
6. Verify images preserved

Test: Slug uniqueness
1. Add device type "Test Server"
2. Add another "Test Server"
3. Verify second gets unique slug (test-server-2)

Run full E2E suite:
```bash
npm run test:e2e
````

Final verification:

```bash
npm run check
npm run test:run
npm run build
npm run test:e2e
```

All tests should pass. Application should:

- Save in new folder/YAML format
- Load both new and legacy formats
- Display all data correctly
- Maintain full backward compatibility

```

---

## Prompt Execution Checklist

| # | Prompt | Status | Tests Pass |
|---|--------|--------|------------|
| 1 | Add js-yaml dependency | ⬜ | ⬜ |
| 2 | Create slug utilities | ⬜ | ⬜ |
| 3 | Create v0.4 type definitions | ⬜ | ⬜ |
| 4 | Create v0.4 Zod schemas | ⬜ | ⬜ |
| 5 | Add slug uniqueness validation | ⬜ | ⬜ |
| 6 | Create YAML serialization | ⬜ | ⬜ |
| 7 | Create folder-based save | ⬜ | ⬜ |
| 8 | Update file detection | ⬜ | ⬜ |
| 9 | Create layout migration | ⬜ | ⬜ |
| 10 | Create image migration | ⬜ | ⬜ |
| 11 | Create store helpers | ⬜ | ⬜ |
| 12 | Create parallel store functions | ⬜ | ⬜ |
| 13 | Update layout store types | ⬜ | ⬜ |
| 14 | Update component imports | ⬜ | ⬜ |
| 15 | Update DevicePalette | ⬜ | ⬜ |
| 16 | Update Rack component | ⬜ | ⬜ |
| 17 | Update EditPanel | ⬜ | ⬜ |
| 18 | Update AddDeviceForm & App | ⬜ | ⬜ |
| 19 | Wire up file operations | ⬜ | ⬜ |
| 20 | E2E tests & verification | ⬜ | ⬜ |

---

## Recovery Procedures

### If tests fail after a prompt:

1. Check if test expectations need updating (v0.3 → v0.4 structure)
2. Check for missing type imports
3. Check for field name mismatches
4. Revert to last known good state if stuck

### If TypeScript errors persist:

1. Run `npm run check` for full error list
2. Focus on one file at a time
3. Ensure all imports use v0.4 types
4. Check for stale type references

### If E2E tests fail:

1. Check browser console for errors
2. Verify test fixtures are valid
3. Check for async timing issues
4. Run single test in headed mode for debugging
```
