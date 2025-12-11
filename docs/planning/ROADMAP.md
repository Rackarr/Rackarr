---
created: 2025-11-27
updated: 2025-12-02
status: active
---

# Rackarr — Product Roadmap

Single source of truth for version planning.

---

## Version Philosophy

- **Incremental releases** — Each version is usable and complete
- **Scope discipline** — Features stay in their designated version
- **Spec-driven** — No implementation without spec
- **User value** — Each release solves real problems
- **Single rack focus** — One rack per project, no multi-rack complexity
- **Minimalism** — Keep it simple and focused
- **Consistency** — Design and behaviour should be consistent across the app
- **Accessibility** — Ensure usability for all users, including those with disabilities

---

## Outstanding issues (to be addressed before any additional featurework)

# Guidance:

For each of these, we should create a new branch. Then we will write a spec and subsequent prompt plan and todo list in detail to ensure clarity and completeness. We will then, using that output, create test cases to meet the spec and then source code to satisfy the tests.

# Issue list

Work through each top level heading one by one, mark with x only once complete.

[] front / rear / full-depth mounting logic needs audit - [] 0.5 blank item specifically has weird placement behaviour - when placed on rear with a rear mounting or even full depth setting it is still able to move to overlap with front mounted devices and when moved with arrow keys it seems to jump to specific slots. compared to a 1u blank it moves differently which implies there is a logic break there that is unexpected - [] we should be able to permit mounting on front and rear: with a front mounted device, the rear area for that same slot should be mountable and a device placed there should be assumed to be a rear mounted device (should we prompt the user for this?)

[] device library improvements - [] device category for KVM should be all caps "KVM" not "Kvm"

---

## Research

Items requiring investigation and architecture design before implementation.

### Device Category Icons

**Status:** Complete
**Created:** 2025-12-11
**Completed:** 2025-12-11

Implemented Lucide icons for all 12 device categories in `CategoryIcon.svelte`.

| Category           | Lucide Icon            |
| ------------------ | ---------------------- |
| `server`           | `server`               |
| `network`          | `network`              |
| `patch-panel`      | `ethernet-port`        |
| `power`            | `zap`                  |
| `storage`          | `hard-drive`           |
| `kvm`              | `monitor`              |
| `av-media`         | `speaker`              |
| `cooling`          | `fan`                  |
| `shelf`            | `align-end-horizontal` |
| `blank`            | `circle-off`           |
| `cable-management` | `cable`                |
| `other`            | `circle-help`          |

See SPEC.md Section 10 for the full mapping.

---

### Starter Library Rationalization

**Status:** Complete
**Created:** 2025-12-11
**Completed:** 2025-12-11

Rationalized the starter library to 26 device types representing common homelab gear.

- [x] **Research** — Audited existing library, researched common homelab gear, defined target list
- [x] **Implementation** — Updated `starterLibrary.ts` with all changes:
  - Added: 8-Port Switch, 24-Port Switch, 48-Port Switch, 1U Storage, 1U Brush Panel, 1U Cable Management
  - Removed: 4U Shelf, 1U Generic, 2U Generic, 0.5U Blanking Fan
  - Renamed: 1U Switch → 1U Router/Firewall, patch panels get port counts (24/48-Port)
- [x] **Tests updated** — Starter library tests reflect new device list
- [x] **Slug generation verified** — Slugs work correctly for all renamed devices

> See `docs/planning/research/starter-library-rationalization.md` for research documentation.

---

### Device Image System

**Status:** In Progress
**Created:** 2025-12-11

Two-level image system with device type defaults and placement-level overrides.

> **Note:** Implementation will be greenfield — no migration layers, version suffixes, or legacy compatibility code.

#### Phase 1: Architecture Design (Complete)

- [x] **Image inheritance model** — Device type → placement override fallback
- [x] **Storage format** — `assets/device-types/` + `assets/placements/`
- [x] **Image processing** — 400px max WebP, auto-process uploads
- [x] **Licensing** — CC0 1.0 for NetBox images

> See `docs/planning/research/device-images.md` for full research.

#### Phase 2: Bundled Starter Library Images (In Progress)

Bundle ~15 active device images (servers, switches, storage, UPS):

- [ ] Create directory structure and processing script
- [ ] Download representative images from NetBox
- [ ] Process to 400px max WebP
- [ ] Create bundled image manifest (`src/lib/data/bundledImages.ts`)
- [ ] Load bundled images on app initialization

#### Phase 3: Placement Image Overrides (Planned)

Per-placement image overrides with stable IDs:

- [ ] Add `id: string` (UUID) field to PlacedDevice type
- [ ] Generate UUID on device placement
- [ ] Refactor ImageStore for two-level storage
- [ ] Update archive format for device-types/ + placements/
- [ ] Add image override UI to EditPanel
- [ ] Auto-process user uploads (400px + WebP)

---

## Released

### v0.4.9 — Airflow Visualization

**Status:** Complete
**Released:** 2025-12-09

Visual overlay for device airflow direction with conflict detection:

| Feature            | Description                                                  |
| ------------------ | ------------------------------------------------------------ |
| Simplified types   | 4 types: passive, front-to-rear, rear-to-front, side-to-rear |
| Toggle             | Toolbar button + `A` keyboard shortcut                       |
| Edge stripe design | 4px colored stripe on device edge (blue=intake, red=exhaust) |
| Animated arrows    | Small chevron with marching animation                        |
| Conflict detection | Orange border on devices with airflow conflicts              |
| Export support     | Airflow indicators included in image/PDF exports             |
| Selection bug fix  | Fixed multi-device selection highlighting issue              |

---

### v0.4.0 — Code Audit & Legacy Cleanup

**Status:** Complete
**Breaking Change:** Dropped v0.1/v0.2 format support

| Area               | Status   |
| ------------------ | -------- |
| Legacy Removal     | Complete |
| Dead Code (Source) | Complete |
| Dead Code (Tests)  | Complete |
| CSS Cleanup        | Complete |
| Dependencies       | Complete |
| Config             | Clean    |
| Documentation      | Complete |

**Spec:** `docs/planning/v0.4.0-code-audit-spec.md`

---

## Medium-Term Responsive (before v1.0)

The following responsive improvements are planned for implementation before v1.0:

### Tab-Based Mobile Layout (<768px)

For phone screens, switch to a tab-based interface:

- Bottom tab bar: `Library | Canvas | Edit`
- Only one view visible at a time
- Device library becomes full-screen overlay
- Edit panel becomes full-screen overlay
- Canvas takes full width when active

### Bottom Sheet Patterns

Mobile-friendly UI patterns:

- Bottom sheet for device library (swipe up to reveal)
- Bottom sheet for edit panel
- Two-tap device placement: tap device → tap rack slot
- Gesture-based interactions

### Min-Width Warning

For unsupported narrow viewports:

- Display warning banner at <500px viewport
- Suggest rotating to landscape or using larger device
- Graceful degradation rather than broken layout

---

## Future Roadmap

Priority order for future development:

### 1. Mobile & PWA

- Full mobile phone support (create/edit layouts)
- Two-tap device placement (tap library → tap rack)
- Bottom sheet UI for device library and edit panel
- Pinch-to-zoom with native touch events
- Progressive Web App (installable, offline)
- Service worker for offline capability
- Touch-friendly targets (48px minimum)

**Primary Targets:** iPhone SE, iPhone 14, Pixel 7

---

### ~~2. Undo/Redo~~ ✅ Complete (v0.3.1)

- ~~Undo/redo system (command pattern)~~
- ~~History stack with configurable depth~~
- ~~Keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z)~~

---

### ~~3. Airflow Visualization~~ ✅ Complete (v0.4.9)

- ~~Visual indicators for device airflow direction~~
- ~~Hot/cold aisle awareness~~
- ~~Conflict detection (opposing airflow)~~

---

### 4. Cable Routing

- Visual cable path representation
- Port/connection definitions on devices
- Cable type metadata

---

### 5. Weight/Load Calculations

- Device weight metadata
- Per-U load calculations
- Rack weight capacity warnings

---

### 6. Basic Power Consumption

- Basic device power requirements (# of plugs on PDU, device powered y/n)

### 7. Basic Network connectivity requirements

- Basic device network requirements (# of ports on patch panel, device networked y/n)

---

## Backlog (Unscheduled)

Features explicitly deferred with no priority assigned:

| Feature                     | Notes                                       |
| --------------------------- | ------------------------------------------- |
| Custom device categories    | Allow user-defined categories               |
| 3D visualization            | Three.js rack view                          |
| Cloud sync / accounts       | User accounts, cloud storage                |
| Collaborative editing       | Real-time multi-user                        |
| Tablet-optimised layout     | Enhanced tablet experience                  |
| Device templates/presets    | Common device configurations                |
| Import from CSV/spreadsheet | Bulk device import                          |
| NetBox device type import   | Import from community library               |
| Export both rack views      | Front + rear in single export               |
| Device library export       | Save library to file                        |
| 0U vertical PDU support     | Rail-mounted PDUs (left/right rails)        |
| Screen reader improvements  | Live region announcements for state changes |
| Rack Power management       | - Device power draw metadata                |

                              - Total rack power calculation
                              - PDU capacity planning                        |

for future planning:

---

## Out of Scope

Features that will **not** be implemented:

- Multiple racks per project
- Backend/database
- User accounts (without cloud sync feature)
- Internet Explorer support
- Native mobile apps

---

## Considerations but Not Doing

Features that were considered but explicitly deferred or rejected.

### NetBox On-Demand Fetch (Deferred)

Fetch device images on-demand from the NetBox Device Type Library:

- Search/browse UI for NetBox library
- Fetch from `raw.githubusercontent.com` (CORS-friendly)
- Cache fetched images locally
- Assign fetched images to device types or placements

**Reason for deferral:** The bundled images + user upload approach covers immediate user needs without network dependency. On-demand fetch adds complexity (UI for search/browse, network error handling, caching) that can be evaluated later based on user feedback. May revisit if users frequently request specific device images not in the starter library.

---

## Process

### Adding Features to Roadmap

1. Add to **Backlog** with brief description
2. When prioritizing, assign a priority number in Future Roadmap
3. Before implementation, update spec-combined.md
4. Implement following TDD methodology

### Version Graduation

```
Backlog → Future Roadmap → Planned (current) → Released
```

---

## Changelog

| Date       | Change                                                             |
| ---------- | ------------------------------------------------------------------ |
| 2025-11-27 | Initial roadmap created                                            |
| 2025-11-27 | v0.1 development started                                           |
| 2025-11-28 | v0.1 released                                                      |
| 2025-11-28 | v0.2 spec created                                                  |
| 2025-11-29 | Added panzoom library to v0.2 scope                                |
| 2025-11-30 | v0.2.0 released                                                    |
| 2025-12-01 | v0.2.1 released (accessibility & design polish)                    |
| 2025-12-02 | Consolidated spec; single-rack permanent scope                     |
| 2025-12-03 | v0.3.0 released (YAML archive format)                              |
| 2025-12-05 | Responsive quick-wins implemented                                  |
| 2025-12-06 | v0.3.4 released (responsive quick-wins)                            |
| 2025-12-07 | v0.4.0 released (breaking: removed legacy format support)          |
| 2025-12-07 | v0.4.2 released (toolbar responsiveness, hamburger menu)           |
| 2025-12-08 | v0.4.3 released (PDF export)                                       |
| 2025-12-08 | v0.4.4 released (Docker build fix)                                 |
| 2025-12-08 | v0.4.5 released (toolbar polish, file picker fix)                  |
| 2025-12-08 | v0.4.6 released (fix 0.5U device schema validation)                |
| 2025-12-08 | v0.4.7 released (reset view after layout load)                     |
| 2025-12-08 | v0.4.8 released (toolbar drawer fix, z-index tokens)               |
| 2025-12-08 | v0.4.9 spec ready (airflow visualization)                          |
| 2025-12-09 | v0.4.9 released (airflow visualization, selection bug fix)         |
| 2025-12-10 | Type system consolidation: unified on DeviceType/PlacedDevice      |
| 2025-12-11 | Added Research section: Starter Library & Device Image System      |
| 2025-12-11 | Device category icons: selected Lucide icons for all 12 categories |
| 2025-12-11 | Device Image System: spec complete, Phase 4 deferred               |

---

_This file is the source of truth for Rackarr versioning._
