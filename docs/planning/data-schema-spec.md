# Data Schema Specification v0.4

**Status:** Approved
**Date:** 2025-12-03
**Target Version:** v0.4.0

---

## Overview

This specification defines the data schema changes to align Rackarr with NetBox-compatible formats, improve human readability, and establish consistent naming conventions.

---

## 1. File Format

### Current State

- ZIP archive (`.rackarr.zip`) containing `layout.json`
- Images stored in `images/` folder within archive

### Target State

**Folder-based project structure:**

```
[rack-name]/
├── [rack-name].yaml          # NetBox-style YAML
└── assets/
    └── [device-slug]/
        ├── front.png
        └── rear.png
```

### Example

```
homelab-rack/
├── homelab-rack.yaml
└── assets/
    ├── synology-ds920-plus/
    │   ├── front.png
    │   └── rear.jpg
    └── ubiquiti-usg-pro-4/
        └── front.png
```

### Migration

- Support loading legacy `.rackarr.zip` and `.rackarr.json` formats
- Save always uses new folder structure
- Provide export as ZIP option for sharing (zips the folder)

---

## 2. Terminology

### Current State

- TypeScript uses "Device" terminology
- Mixed usage: `Device`, `deviceLibrary`, `PlacedDevice`

### Target State

**Use "DeviceType" for library definitions (NetBox-compatible):**

| Current         | Target                       |
| --------------- | ---------------------------- |
| `Device`        | `DeviceType`                 |
| `deviceLibrary` | `device_types`               |
| `PlacedDevice`  | `Device` (a placed instance) |

### Rationale

- NetBox uses "Device Type" for templates, "Device" for instances
- Clear distinction: DeviceType = template, Device = placed in rack

---

## 3. Device Identifier

### Current State

- TypeScript: `id: string` (UUID)
- Zod Schema: `slug: string` (kebab-case)
- Incompatible approaches

### Target State

**Slug-based identification with auto-generation:**

```yaml
# DeviceType definition
slug: synology-ds920-plus # Required, unique identifier
manufacturer: Synology # Optional
model: DS920+ # Optional
```

### Slug Generation Rules

1. If `manufacturer` and `model` provided: `slugify(manufacturer-model)`
2. If only name provided: `slugify(name)`
3. User can override with custom slug
4. Validate uniqueness within project on save
5. Pattern: `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` (lowercase, hyphens, no underscores)

### Examples

```
Synology DS920+        → synology-ds920-plus
Custom 2U Server       → custom-2u-server
UniFi Dream Machine    → unifi-dream-machine
```

---

## 4. Height Field

### Current State

- TypeScript: `height: number`
- Zod Schema: `u_height: number`
- Inconsistent naming

### Target State

**Use `u_height` throughout (NetBox-compatible):**

```yaml
slug: synology-ds920-plus
u_height: 2
```

### Rationale

- Self-documenting: "u" = rack units
- NetBox-compatible
- Avoids ambiguity (not pixels, not inches)

---

## 5. Placed Device Reference

### Current State

- TypeScript: `libraryId: string` (UUID)
- Zod Schema: `slug: string`
- Reference Doc: `type: string`

### Target State

**Use `device_type` field containing slug, with optional `name` for display:**

```yaml
devices:
  - device_type: synology-ds920-plus # References DeviceType.slug
    name: Primary NAS # Optional display name
    position: 10
    face: front

  - device_type: synology-ds920-plus # Same type, different instance
    name: Backup NAS
    position: 8
    face: front
```

### Fields

| Field         | Required | Description                                                 |
| ------------- | -------- | ----------------------------------------------------------- |
| `device_type` | **Yes**  | Slug reference to DeviceType                                |
| `name`        | No       | Display name (defaults to DeviceType model/name if not set) |
| `position`    | **Yes**  | U position (bottom of device)                               |
| `face`        | **Yes**  | `"front"`, `"rear"`, or `"both"`                            |

### Rationale

- `device_type` is explicit and NetBox-style
- Value is the slug, enabling human-readable YAML
- Clear relationship: Device → DeviceType
- Optional `name` allows distinguishing multiple instances of same type

---

## 6. Field Naming Convention

### Current State

- Mixed: `desc_units` (snake_case), `formFactor` (camelCase)
- Inconsistent between TypeScript and serialization

### Target State

**Full snake_case (NetBox style) in both TypeScript and YAML:**

```typescript
interface Rack {
	name: string;
	height: number;
	width: number;
	desc_units: boolean;
	form_factor: FormFactor;
	starting_unit: number;
	devices: Device[];
}
```

```yaml
rack:
  name: Homelab Rack
  height: 42
  width: 19
  desc_units: false
  form_factor: 4-post-cabinet
  starting_unit: 1
```

### Rationale

- Consistency over convention
- No transformation layer needed
- Direct serialization/deserialization

---

## 7. Rack Runtime Fields

### Current State

- `view: RackView` - not in schema
- `position: number` - not in schema

### Target State

- **`position`**: Persisted in schema (user data - rack order)
- **`view`**: Runtime only, defaults to `'front'`

```yaml
rack:
  name: Homelab Rack
  position: 0 # Persisted
  # view is NOT in YAML - runtime only
```

### Rationale

- Position represents intentional user arrangement
- View is transient UI state (which side user is looking at)

---

## 8. Image Storage

### Current State

- Flat: `images/device-{uuid}-{face}.{ext}`

### Target State

**Nested by device slug:**

```
assets/
├── synology-ds920-plus/
│   ├── front.png
│   └── rear.jpg
├── ubiquiti-usg-pro-4/
│   └── front.png
└── custom-patch-panel/
    ├── front.png
    └── rear.png
```

### Naming Rules

- Folder name = device slug
- File names: `front.{ext}` or `rear.{ext}`
- Supported extensions: `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`

---

## 9. NetBox Compatibility Fields

### Current State

- `manufacturer?: string` (optional)
- `model?: string` (optional)
- No `slug` in TypeScript interface

### Target State

| Field           | Required | Description                                        |
| --------------- | -------- | -------------------------------------------------- |
| `slug`          | **Yes**  | Unique identifier (auto-generated if not provided) |
| `manufacturer`  | No       | e.g., "Synology", "Ubiquiti"                       |
| `model`         | No       | e.g., "DS920+", "USG-Pro-4"                        |
| `u_height`      | **Yes**  | Height in rack units                               |
| `is_full_depth` | No       | Boolean, default `true`                            |
| `weight`        | No       | Numeric weight value                               |
| `weight_unit`   | No       | `"kg"` or `"lb"`                                   |
| `airflow`       | No       | `"front-to-rear"`, `"rear-to-front"`, etc.         |
| `comments`      | No       | Free-text notes                                    |

### Rackarr-Specific Fields

```yaml
rackarr:
  colour: '#3b82f6' # Display colour
  category: storage # For filtering UI
  tags: [nas, synology] # User organization
```

---

## Complete Schema Examples

### DeviceType Definition

```yaml
# device_types/synology-ds920-plus.yaml
slug: synology-ds920-plus
manufacturer: Synology
model: DS920+
u_height: 2
is_full_depth: true
weight: 2.34
weight_unit: kg
airflow: front-to-rear
comments: '4-bay NAS, Intel Celeron J4125'
rackarr:
  colour: '#10b981'
  category: storage
  tags: [nas, synology, homelab]
```

### Project File

```yaml
# homelab-rack/homelab-rack.yaml
version: '0.4.0'
name: Homelab Rack

rack:
  name: Homelab Rack
  height: 42
  width: 19
  desc_units: false
  form_factor: 4-post-cabinet
  starting_unit: 1
  position: 0

device_types:
  - slug: synology-ds920-plus
    manufacturer: Synology
    model: DS920+
    u_height: 2
    rackarr:
      colour: '#10b981'
      category: storage

  - slug: custom-patch-panel
    u_height: 1
    rackarr:
      colour: '#6b7280'
      category: networking

devices:
  - device_type: synology-ds920-plus
    name: Primary NAS
    position: 10
    face: front

  - device_type: custom-patch-panel
    position: 42
    face: front

settings:
  display_mode: label
  show_labels_on_images: true
```

---

## Migration Strategy

### Phase 1: Schema Alignment

1. Update TypeScript interfaces to use snake_case
2. Rename `Device` → `DeviceType`, `PlacedDevice` → `Device`
3. Add `slug` field, implement auto-generation
4. Rename `height` → `u_height`
5. Rename `libraryId` → `device_type`

### Phase 2: File Format

1. Add YAML serialization (js-yaml dependency)
2. Implement folder-based save
3. Update image storage to nested structure
4. Maintain backward-compatible loading for `.rackarr.zip` and `.rackarr.json`

### Phase 3: Validation

1. Update Zod schemas to match new structure
2. Add slug uniqueness validation
3. Add migration utility for existing saves

---

## TypeScript Interface Summary

```typescript
// types/index.ts

interface DeviceType {
	slug: string; // Required, unique
	manufacturer?: string;
	model?: string;
	u_height: number; // Required
	is_full_depth?: boolean;
	weight?: number;
	weight_unit?: 'kg' | 'lb';
	airflow?: Airflow;
	comments?: string;
	rackarr?: {
		colour: string;
		category: DeviceCategory;
		tags?: string[];
	};
}

interface Device {
	device_type: string; // Slug reference to DeviceType
	name?: string; // Optional display name
	position: number; // U position (bottom of device)
	face: 'front' | 'rear' | 'both';
}

interface Rack {
	name: string;
	height: number;
	width: 10 | 19;
	desc_units: boolean;
	form_factor: FormFactor;
	starting_unit: number;
	position: number; // Persisted
	devices: Device[];
	// view: RackView - runtime only, not persisted
}

interface Layout {
	version: string;
	name: string;
	rack: Rack; // Single rack (v0.4)
	device_types: DeviceType[];
	settings: LayoutSettings;
}

interface LayoutSettings {
	display_mode: 'label' | 'image';
	show_labels_on_images: boolean;
}
```

---

## Acceptance Criteria

1. [ ] Project saves as folder with `[name].yaml` and `assets/` subfolder
2. [ ] All fields use snake_case naming
3. [ ] DeviceType has required `slug` field (auto-generated if needed)
4. [ ] Placed devices reference DeviceType via `device_type` slug
5. [ ] Images stored in `assets/[slug]/[face].[ext]` structure
6. [ ] Legacy `.rackarr.zip` and `.rackarr.json` files load correctly
7. [ ] Zod schemas validate new structure
8. [ ] All existing tests pass or are updated
9. [ ] E2E tests verify save/load cycle with new format
