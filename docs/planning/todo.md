# Rackarr v0.4 Implementation Checklist

**Target Version:** v0.4.0
**Start Date:** ****\_\_\_****
**Completion Date:** ****\_\_\_****

---

## Phase 1: Foundation

### 1.1 Dependencies

- [ ] Install js-yaml package
- [ ] Install @types/js-yaml dev dependency
- [ ] Verify import works in test file
- [ ] Commit: "chore: add js-yaml dependency"

### 1.2 Slug Utilities

- [ ] Create `src/lib/utils/slug.ts`
- [ ] Write tests for `slugify()`
  - [ ] Converts to lowercase
  - [ ] Replaces spaces with hyphens
  - [ ] Removes special characters
  - [ ] Handles plus signs (DS920+ → ds920-plus)
  - [ ] Collapses multiple hyphens
  - [ ] Removes leading/trailing hyphens
  - [ ] Handles empty string
- [ ] Write tests for `generateDeviceSlug()`
  - [ ] From manufacturer + model
  - [ ] From name only
  - [ ] Fallback for empty input
- [ ] Write tests for `isValidSlug()`
  - [ ] Valid slug returns true
  - [ ] Invalid patterns return false
- [ ] Write tests for `ensureUniqueSlug()`
  - [ ] Returns original if unique
  - [ ] Appends -2 for first duplicate
  - [ ] Increments until unique
- [ ] Implement all functions
- [ ] All tests pass
- [ ] Commit: "feat: add slug utilities"

### 1.3 Type Definitions

- [ ] Create `src/lib/types/v04.ts`
- [ ] Define `DeviceType` interface
  - [ ] slug (required)
  - [ ] u_height (required)
  - [ ] manufacturer (optional)
  - [ ] model (optional)
  - [ ] is_full_depth (optional)
  - [ ] weight (optional)
  - [ ] weight_unit (optional)
  - [ ] airflow (optional)
  - [ ] comments (optional)
  - [ ] rackarr extensions (required)
- [ ] Define `Device` interface (placed instance)
  - [ ] device_type (slug reference)
  - [ ] name (optional display name)
  - [ ] position
  - [ ] face
- [ ] Define `Rack` interface
  - [ ] All snake_case fields
  - [ ] devices array
  - [ ] view as runtime-only comment
- [ ] Define `Layout` interface
  - [ ] version
  - [ ] name
  - [ ] rack (singular)
  - [ ] device_types array
  - [ ] settings
- [ ] Create type test file
- [ ] Export types with V04 suffix
- [ ] Commit: "feat: add v0.4 type definitions"

---

## Phase 2: Schemas

### 2.1 Zod Schemas

- [ ] Create `src/lib/schemas/v04.ts`
- [ ] Define `SlugSchema`
  - [ ] Min length 1
  - [ ] Max length 100
  - [ ] Regex pattern validation
- [ ] Define `DeviceCategorySchema` (enum)
- [ ] Define `FormFactorSchema` (enum)
- [ ] Define `AirflowSchema` (enum)
- [ ] Define `DeviceFaceSchema` (enum)
- [ ] Define `WeightUnitSchema` (enum)
- [ ] Define `RackarrExtensionsSchema`
  - [ ] colour (hex validation)
  - [ ] category
  - [ ] tags (optional array)
- [ ] Define `DeviceTypeSchema`
- [ ] Define `DeviceSchema`
- [ ] Define `RackSchema`
- [ ] Define `LayoutSettingsSchema`
- [ ] Define `LayoutSchema`
- [ ] Write tests for each schema
  - [ ] Valid data passes
  - [ ] Invalid data fails with message
- [ ] All tests pass
- [ ] Commit: "feat: add v0.4 Zod schemas"

### 2.2 Slug Uniqueness Validation

- [ ] Add `validateSlugUniqueness()` function
- [ ] Write tests
  - [ ] Empty array returns []
  - [ ] Unique slugs returns []
  - [ ] Duplicates returned correctly
- [ ] Add `.refine()` to LayoutSchema
- [ ] Test refinement catches duplicates
- [ ] All tests pass
- [ ] Commit: "feat: add slug uniqueness validation"

---

## Phase 3: Serialization

### 3.1 YAML Utilities

- [ ] Create `src/lib/utils/yaml.ts`
- [ ] Implement `serializeToYaml()`
  - [ ] Proper indentation (2 spaces)
  - [ ] Exclude runtime fields
  - [ ] Preserve field order
- [ ] Implement `parseYaml()`
  - [ ] Parse YAML string
  - [ ] Validate with Zod
  - [ ] Add runtime defaults
  - [ ] Descriptive error messages
- [ ] Write tests
  - [ ] Serialize produces valid YAML
  - [ ] Parse returns correct object
  - [ ] Round-trip preserves data
  - [ ] Invalid YAML throws
  - [ ] Validation errors thrown
- [ ] All tests pass
- [ ] Commit: "feat: add YAML serialization"

### 3.2 Folder-Based Save

- [ ] Create `src/lib/utils/folder.ts`
- [ ] Implement `createFolderArchive()`
  - [ ] Creates ZIP with folder structure
  - [ ] YAML file at root of folder
  - [ ] Assets subfolder for images
  - [ ] Images nested by slug
- [ ] Implement `extractFolderArchive()`
  - [ ] Finds YAML file
  - [ ] Parses layout
  - [ ] Extracts images
  - [ ] Maps to device slugs
- [ ] Add helper functions
  - [ ] getImageExtension()
  - [ ] getMimeType()
- [ ] Write tests
  - [ ] Archive creation
  - [ ] Archive extraction
  - [ ] Round-trip preservation
  - [ ] Error handling
- [ ] All tests pass
- [ ] Commit: "feat: add folder-based save/load"

### 3.3 File Format Detection

- [ ] Update `detectFileFormat()` in file.ts
  - [ ] Detect folder-archive (new format)
  - [ ] Detect legacy-archive (.rackarr.zip)
  - [ ] Detect legacy-json (.rackarr.json)
  - [ ] Return 'unknown' for others
- [ ] Write tests for detection
- [ ] All tests pass
- [ ] Commit: "feat: update file format detection"

---

## Phase 4: Migration

### 4.1 Layout Migration

- [ ] Create `src/lib/utils/migrate-v04.ts`
- [ ] Define `LegacyLayout` interface
- [ ] Implement `migrateToV04()`
  - [ ] Convert deviceLibrary → device_types
  - [ ] Generate slugs for devices
  - [ ] Handle duplicate names
  - [ ] Map libraryId → device_type
  - [ ] Take first rack only
  - [ ] Set version to "0.4.0"
  - [ ] Return idToSlugMap
- [ ] Implement `detectLayoutVersion()`
- [ ] Write tests
  - [ ] Version detection
  - [ ] Field conversion
  - [ ] Slug generation
  - [ ] Reference mapping
  - [ ] Edge cases
- [ ] All tests pass
- [ ] Commit: "feat: add layout migration to v0.4"

### 4.2 Image Migration

- [ ] Implement `migrateImages()`
  - [ ] Convert UUID keys to slug keys
  - [ ] Use idToSlugMap from layout migration
  - [ ] Preserve image data
  - [ ] Handle unknown IDs
- [ ] Write tests
  - [ ] Key mapping
  - [ ] Data preservation
  - [ ] Unknown ID handling
- [ ] All tests pass
- [ ] Commit: "feat: add image migration"

---

## Phase 5: Store Updates

### 5.1 Store Helper Functions

- [ ] Create `src/lib/stores/layout-helpers-v04.ts`
- [ ] Implement `createDeviceType()`
- [ ] Implement `createDevice()`
- [ ] Implement `findDeviceType()`
- [ ] Implement `getDeviceDisplayName()`
- [ ] Write tests for all helpers
- [ ] All tests pass
- [ ] Commit: "feat: add v0.4 store helpers"

### 5.2 Store Operations

- [ ] Implement `addDeviceTypeToLayout()`
- [ ] Implement `removeDeviceTypeFromLayout()`
- [ ] Implement `placeDeviceInRack()`
- [ ] Implement `removeDeviceFromRack()`
- [ ] Write tests
  - [ ] Add operations
  - [ ] Remove operations
  - [ ] Immutability
  - [ ] Error cases
- [ ] All tests pass
- [ ] Commit: "feat: add v0.4 store operations"

### 5.3 Layout Store Refactor

- [ ] Update imports to v0.4 types
- [ ] Rename functions
  - [ ] addDeviceToLibrary → addDeviceType
  - [ ] updateDeviceInLibrary → updateDeviceType
  - [ ] deleteDeviceFromLibrary → deleteDeviceType
- [ ] Update field names
  - [ ] deviceLibrary → device_types
  - [ ] height → u_height
  - [ ] libraryId → device_type
- [ ] Update existing tests
- [ ] All tests pass
- [ ] Commit: "refactor: update layout store to v0.4 types"

---

## Phase 6: Component Updates

### 6.1 Type Import Updates

- [ ] Update DevicePalette.svelte imports
- [ ] Update Rack.svelte imports
- [ ] Update EditPanel.svelte imports
- [ ] Update AddDeviceForm.svelte imports
- [ ] Update ExportDialog.svelte imports
- [ ] Update App.svelte imports
- [ ] Document TypeScript errors
- [ ] Commit: "refactor: update component type imports"

### 6.2 DevicePalette Component

- [ ] Update to use device_types
- [ ] Update to use u_height
- [ ] Update slug-based identification
- [ ] Update/write tests
- [ ] All tests pass
- [ ] Commit: "refactor: update DevicePalette to v0.4"

### 6.3 Rack Component

- [ ] Update Device type usage
- [ ] Update device lookup by slug
- [ ] Update u_height usage
- [ ] Support device.name display
- [ ] Update/write tests
- [ ] All tests pass
- [ ] Commit: "refactor: update Rack to v0.4"

### 6.4 EditPanel Component

- [ ] Update to use slug
- [ ] Update field names
- [ ] Support device.name editing
- [ ] Update/write tests
- [ ] All tests pass
- [ ] Commit: "refactor: update EditPanel to v0.4"

### 6.5 AddDeviceForm Component

- [ ] Create DeviceType structure
- [ ] Auto-generate slug preview
- [ ] Use u_height
- [ ] Update/write tests
- [ ] All tests pass
- [ ] Commit: "refactor: update AddDeviceForm to v0.4"

### 6.6 App Component

- [ ] Update device creation handler
- [ ] Use addDeviceType function
- [ ] Update save/load handlers
- [ ] All tests pass
- [ ] Commit: "refactor: update App to v0.4"

---

## Phase 7: Integration

### 7.1 File Operations Integration

- [ ] Update handleSave in App.svelte
  - [ ] Use createFolderArchive
  - [ ] Slugify filename
  - [ ] Show filename in toast
- [ ] Update handleLoad in App.svelte
  - [ ] Use detectFileFormat
  - [ ] Handle folder-archive
  - [ ] Handle legacy-archive with migration
  - [ ] Handle legacy-json with migration
  - [ ] Migrate images
- [ ] Write integration tests
- [ ] All tests pass
- [ ] Commit: "feat: integrate v0.4 file operations"

### 7.2 E2E Tests

- [ ] Create test fixtures
  - [ ] legacy-v0.3.rackarr.zip
  - [ ] valid-v0.4 folder
- [ ] Test: Create and save new layout
- [ ] Test: Load legacy v0.3 file
- [ ] Test: Round-trip preservation
- [ ] Test: Slug uniqueness
- [ ] All E2E tests pass
- [ ] Commit: "test: add v0.4 E2E tests"

### 7.3 Final Verification

- [ ] Run `npm run check` - no errors
- [ ] Run `npm run test:run` - all pass
- [ ] Run `npm run build` - succeeds
- [ ] Run `npm run test:e2e` - all pass
- [ ] Manual testing
  - [ ] Create new rack
  - [ ] Add device types
  - [ ] Place devices
  - [ ] Save layout
  - [ ] Load layout
  - [ ] Load legacy file
- [ ] Commit: "chore: v0.4 final verification"

---

## Cleanup

### Documentation

- [ ] Update CLAUDE.md version number
- [ ] Update any outdated comments
- [ ] Remove v04.ts suffix files (merge into main types)
- [ ] Update README if needed

### Type Cleanup

- [ ] Remove V04 suffix from types
- [ ] Update all imports to use main types
- [ ] Delete temporary parallel files
- [ ] Commit: "refactor: finalize v0.4 type naming"

### Version Bump

- [ ] Update package.json version to 0.4.0
- [ ] Update version constant if any
- [ ] Create git tag v0.4.0
- [ ] Commit: "chore: bump version to 0.4.0"

---

## Sign-Off

### Code Quality

- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All tests passing
- [ ] Build succeeds

### Functionality

- [ ] New format save works
- [ ] New format load works
- [ ] Legacy .rackarr.zip loads
- [ ] Legacy .rackarr.json loads
- [ ] Images preserved through migration
- [ ] Slug uniqueness enforced

### Documentation

- [ ] Spec documents complete
- [ ] Checklist complete
- [ ] Prompt plan executed

---

## Notes

_Add any notes, issues encountered, or decisions made during implementation:_

```
Date:
Note:
```

```
Date:
Note:
```

```
Date:
Note:
```
