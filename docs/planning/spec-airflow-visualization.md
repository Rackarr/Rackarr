# Airflow Visualization Specification

**Version:** 0.5.0
**Status:** Ready
**Created:** 2025-12-08
**Updated:** 2025-12-08

---

## Overview

Add an optional visualization layer to display device airflow direction and highlight potential conflicts. This is the first of several planned visualization overlays (airflow, power, network).

### Design Principles

- **Off by default** - Clean canvas for users who don't need it
- **Non-obtrusive** - Toggle on/off, doesn't replace label/image mode
- **Passive feedback** - Visual indicators only, no modals or prompts
- **Extensible pattern** - Sets precedent for power/network overlays

---

## User Stories

1. As a user, I want to set the airflow direction when creating a device type
2. As a user, I want to toggle airflow visualization on/off
3. As a user, I want to see which direction each device moves air
4. As a user, I want to see when adjacent devices have conflicting airflow

---

## Scope

### In Scope (v0.5.0)

| Feature              | Description                                               |
| -------------------- | --------------------------------------------------------- |
| Airflow metadata     | Add airflow direction to device type UI                   |
| Airflow toggle       | Button to enable/disable airflow overlay                  |
| Direction indicators | Visual arrows showing airflow direction                   |
| Conflict indicators  | Subtle visual between opposing adjacent devices           |
| Keyboard shortcut    | `A` key toggles airflow mode                              |
| Export support       | Include airflow indicators in exports (when mode enabled) |

### Out of Scope (Future)

| Feature              | Target                              |
| -------------------- | ----------------------------------- |
| Rack-mounted fans    | v0.6.0 (with 0U accessories system) |
| CFM/thermal modeling | Backlog                             |
| Warning modals       | Not planned                         |
| Auto-suggestions     | Not planned (no "Clippy")           |

---

## Data Model

### Existing Schema (Already Supported)

The `airflow` field already exists in `DeviceTypeSchema`:

```typescript
// From src/lib/schemas/index.ts
export const AirflowSchema = z.enum([
	'front-to-rear',
	'rear-to-front',
	'left-to-right',
	'right-to-left',
	'side-to-rear',
	'passive'
]);
```

### Internal Device Type

```typescript
// From src/lib/types/index.ts - LibraryDevice
interface LibraryDevice {
	id: string;
	name: string;
	height: number;
	category: DeviceCategory;
	colour: string;
	notes?: string;
	airflow?: Airflow; // Add this field (optional, defaults to 'passive')
}
```

### Default Value

- New devices default to `passive` (no active airflow)
- Existing devices without airflow field treated as `passive`

---

## UI Changes

### 1. Device Creation/Edit Form

Add airflow dropdown to `AddDeviceForm.svelte` and device edit UI:

```
Airflow Direction
┌─────────────────────────────┐
│ Passive (no active cooling) │ ▼
├─────────────────────────────┤
│ Passive (no active cooling) │ ← default
│ Front to Rear               │
│ Rear to Front               │
│ Left to Right               │
│ Right to Left               │
│ Side to Rear                │
└─────────────────────────────┘
```

**Field placement:** After "Category" dropdown, before "Notes"

### 2. Airflow Toggle

**Location:** Toolbar, next to display mode toggle (label/image)

**Button behavior:**

- Icon: Fan or wind icon (e.g., `IconWind`)
- Tooltip: "Toggle Airflow View (A)"
- Active state: Highlighted when airflow mode is on
- Keyboard: `A` key toggles

**State management:**

- Add `airflowMode: boolean` to UI store
- Independent of `displayMode` (label/image) - can combine

### 3. Airflow Indicators (When Mode Enabled)

Visual overlay appears on all devices when airflow mode is active:

#### Direction Arrows

| Airflow         | Visual  | Position                  |
| --------------- | ------- | ------------------------- |
| `front-to-rear` | `→ → →` | Left edge, pointing right |
| `rear-to-front` | `← ← ←` | Right edge, pointing left |
| `left-to-right` | `→ → →` | Top edge, pointing right  |
| `right-to-left` | `← ← ←` | Top edge, pointing left   |
| `side-to-rear`  | `↘`     | Corner indicator          |
| `passive`       | `○`     | Center, hollow circle     |

#### Color Coding (Subtle)

- **Intake edge:** Subtle blue tint or border (`--colour-airflow-intake`)
- **Exhaust edge:** Subtle red/orange tint or border (`--colour-airflow-exhaust`)
- **Passive:** No color, just hollow circle icon

#### Dual-View Behavior (Physical Reality)

Airflow indicators differ between front and rear views to show the actual airflow path:

| Airflow Type    | Front View                   | Rear View                    |
| --------------- | ---------------------------- | ---------------------------- |
| `front-to-rear` | Intake arrows (→), blue tint | Exhaust arrows (→), red tint |
| `rear-to-front` | Exhaust arrows (←), red tint | Intake arrows (←), blue tint |
| `left-to-right` | Same on both (lateral flow)  | Same on both                 |
| `right-to-left` | Same on both (lateral flow)  | Same on both                 |
| `side-to-rear`  | Side intake indicator        | Rear exhaust indicator       |
| `passive`       | Hollow circle (○)            | Hollow circle (○)            |

```
FRONT VIEW                         REAR VIEW
┌──────────────────────────┐      ┌──────────────────────────┐
│ →→  Server 1             │      │             Server 1  →→ │
│     (intake, blue)       │      │        (exhaust, red)    │
├──────────────────────────┤      ├──────────────────────────┤
│         Switch  ←←       │      │ ←←  Switch               │
│    (exhaust, red)        │      │     (intake, blue)       │
├──────────────────────────┤      ├──────────────────────────┤
│ ○   Patch Panel          │      │          Patch Panel  ○  │
│     (passive)            │      │          (passive)       │
└──────────────────────────┘      └──────────────────────────┘
```

#### Animation

Subtle "marching dashes" animation to indicate flow direction:

```css
@keyframes airflow-march {
	from {
		stroke-dashoffset: 8;
	}
	to {
		stroke-dashoffset: 0;
	}
}

.airflow-indicator path {
	stroke-dasharray: 4 4;
	animation: airflow-march 0.6s linear infinite;
}

/* Respect user preference for reduced motion */
@media (prefers-reduced-motion: reduce) {
	.airflow-indicator path {
		animation: none;
	}
}
```

Animation runs in the direction of airflow (arrows appear to "flow" toward exhaust).

#### Conflict Indicator

When two adjacent devices (vertically) have opposing primary airflow:

- `front-to-rear` above/below `rear-to-front` = conflict
- Visual: Dashed orange line between the two devices
- Color: `--colour-airflow-conflict` (orange/amber)

```
┌──────────────────────────────────────┐
│ →→  Server 1                         │  front-to-rear
├╌╌╌╌╌╌╌╌╌╌╌╌⚠╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┤  ← conflict indicator
│                         Switch   ←←  │  rear-to-front
├──────────────────────────────────────┤
│ ○   Patch Panel                      │  passive (no conflict)
└──────────────────────────────────────┘
```

**Conflict detection logic:**

- Only check vertically adjacent devices (same rack position ± device height)
- `front-to-rear` conflicts with `rear-to-front`
- `left-to-right` conflicts with `right-to-left`
- `passive` never conflicts
- `side-to-rear` - no conflict detection (complex case, defer)

---

## Design Tokens

Add to `src/lib/styles/tokens.css`:

```css
/* Airflow Visualization */
--colour-airflow-intake: var(--blue-400);
--colour-airflow-exhaust: var(--red-400);
--colour-airflow-passive: var(--neutral-400);
--colour-airflow-conflict: var(--amber-500);
```

---

## Component Changes

### New Components

| Component                 | Purpose                               |
| ------------------------- | ------------------------------------- |
| `AirflowIndicator.svelte` | Renders arrows/icons on device        |
| `AirflowConflict.svelte`  | Renders conflict line between devices |
| `IconWind.svelte`         | Toolbar icon for airflow toggle       |

### Modified Components

| Component                | Changes                                              |
| ------------------------ | ---------------------------------------------------- |
| `Toolbar.svelte`         | Add airflow toggle button                            |
| `ToolbarDrawer.svelte`   | Add airflow toggle to drawer menu                    |
| `AddDeviceForm.svelte`   | Add airflow dropdown field                           |
| `EditPanel.svelte`       | Add airflow field to device edit                     |
| `Device.svelte`          | Render `AirflowIndicator` when mode active           |
| `Rack.svelte`            | Render `AirflowConflict` between conflicting devices |
| `KeyboardHandler.svelte` | Add `A` key binding                                  |

### Store Changes

| Store              | Changes                                            |
| ------------------ | -------------------------------------------------- |
| `ui.svelte.ts`     | Add `airflowMode: boolean`, `toggleAirflowMode()`  |
| `layout.svelte.ts` | Ensure `airflow` field persisted in device library |

---

## Keyboard Shortcuts

| Key | Action                            |
| --- | --------------------------------- |
| `A` | Toggle airflow visualization mode |

Update `KeyboardHandler.svelte` and Help panel.

---

## Export Behavior

When exporting with airflow mode enabled:

- Include airflow arrows in SVG/PNG/PDF export
- Conflict indicators included
- User can toggle off before export if they want clean output

---

## File Format

The `airflow` field is already supported in the YAML schema. Example:

```yaml
device_types:
  - slug: dell-r730
    u_height: 2
    rackarr:
      colour: '#3b82f6'
      category: server
    airflow: front-to-rear

  - slug: patch-panel-24
    u_height: 1
    rackarr:
      colour: '#71717a'
      category: patch-panel
    airflow: passive
```

---

## Migration

- Existing layouts: Devices without `airflow` field default to `passive`
- No migration needed - field is optional
- No breaking changes

---

## Testing Requirements

### Unit Tests

| Test                   | Description                                         |
| ---------------------- | --------------------------------------------------- |
| Airflow field in form  | AddDeviceForm includes airflow dropdown             |
| Default value          | New devices default to 'passive'                    |
| Toggle state           | Airflow mode toggles on/off                         |
| Keyboard shortcut      | 'A' key toggles airflow mode                        |
| Indicator rendering    | Correct arrows for each airflow type                |
| Conflict detection     | Detects front-to-rear vs rear-to-front              |
| No false conflicts     | Passive devices don't trigger conflicts             |
| Export includes arrows | SVG export includes airflow indicators when mode on |

### E2E Tests

| Test                       | Description                                 |
| -------------------------- | ------------------------------------------- |
| Create device with airflow | Set airflow, verify saved                   |
| Toggle airflow mode        | Click button, verify indicators appear      |
| Visual conflict            | Place conflicting devices, verify indicator |

---

## Implementation Order

1. **Schema/Types** - Add `airflow` to `LibraryDevice` internal type
2. **UI Store** - Add `airflowMode` state and toggle
3. **AddDeviceForm** - Add airflow dropdown
4. **Design tokens** - Add airflow colors
5. **IconWind** - Create toolbar icon
6. **Toolbar** - Add toggle button
7. **AirflowIndicator** - Create indicator component
8. **Device** - Render indicator when mode active
9. **Conflict detection** - Logic for adjacent device check
10. **AirflowConflict** - Conflict line component
11. **Rack** - Render conflict indicators
12. **KeyboardHandler** - Add 'A' shortcut
13. **ToolbarDrawer** - Add to hamburger menu
14. **EditPanel** - Add airflow to device edit
15. **Export** - Include indicators in export
16. **Help panel** - Document feature and shortcut

---

## Design Decisions

1. **Arrow style**: SVG chevrons (export-compatible)
2. **Animation**: Subtle CSS "marching dashes" animation, disabled for `prefers-reduced-motion`
3. **Dual-view**: Physical reality - front view shows intake (blue), rear view shows exhaust (red)
4. **Color intensity**: Moderate/subtle - visible but not distracting

---

## Future Considerations

- **Rack accessories** (v0.6.0): Top/bottom exhaust fans as 0U items
- **Power overlay**: Similar toggle pattern for power consumption
- **Network overlay**: Similar toggle pattern for network connectivity
- **Combined view**: Multiple overlays active simultaneously?
