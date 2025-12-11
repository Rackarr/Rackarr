# Device Image System Research

**Created:** 2025-12-11
**Status:** In Progress

---

## 1. NetBox Device Type Library Analysis

### Repository Overview

- **URL:** https://github.com/netbox-community/devicetype-library
- **License:** CC0 1.0 Universal (Public Domain)
- **Elevation Images Location:** `/elevation-images/`
- **Total Manufacturers:** 103 vendor directories

### License Implications (CC0 1.0)

CC0 is the most permissive license available - effectively public domain:

| Concern                       | Status                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------- |
| Can bundle images in Rackarr? | **Yes** - no restrictions                                                        |
| Attribution required?         | **No** - but good practice to credit                                             |
| Can modify images?            | **Yes** - unrestricted                                                           |
| Commercial use?               | **Yes** - unrestricted                                                           |
| Trademark concerns?           | Separate from copyright - manufacturer logos/names may have trademark protection |

**Recommendation:** Include a note in Help/About crediting the NetBox community library as image source. No legal obligation, but good community citizenship.

### Directory Structure

```
elevation-images/
├── APC/
│   ├── apc-smt1500rmi2uc.front.png
│   ├── apc-smt1500rmi2uc.rear.png
│   └── ...
├── Dell/
│   ├── dell-poweredge-r630.front.png
│   ├── dell-poweredge-r630.rear.png
│   └── ...
├── Ubiquiti/
│   ├── ubiquiti-unifi-switch-24.front.png
│   └── ...
└── [100+ more manufacturers...]
```

### Naming Convention

Pattern: `{manufacturer-slug}-{model-slug}.{face}.{format}`

- Face: `front` or `rear`
- Formats: PNG, JPG, JPEG (mixed usage)
- Slug format: lowercase, hyphenated

### File Sizes (Sample)

| Image                  | Size   |
| ---------------------- | ------ |
| APC UPS (PNG)          | ~320KB |
| APC PDU (JPG)          | ~34KB  |
| Dell R630 front (PNG)  | ~14KB  |
| Dell R630 rear (PNG)   | ~27KB  |
| Dell R750 front (PNG)  | ~15KB  |
| Synology RS1221 (JPEG) | ~40KB  |

**Observations:**

- Significant variance in file sizes (14KB - 320KB)
- PNGs tend to be larger but not always
- Most homelab-relevant devices: 15-50KB typical
- Some high-detail images: 200-400KB

### Homelab-Relevant Manufacturers

Based on the 103 manufacturers, key homelab vendors with images:

| Manufacturer | Image Count | Notes                       |
| ------------ | ----------- | --------------------------- |
| Ubiquiti     | 89          | Switches, APs, NVRs         |
| Dell         | 53          | PowerEdge servers, switches |
| Synology     | 20          | NAS units (DS, RS series)   |
| APC          | 55          | UPS, PDUs                   |
| Cisco        | Present     | Switches, routers           |
| Supermicro   | Present     | Servers                     |
| HPE          | Present     | Servers                     |
| QNAP         | Present     | NAS units                   |
| MikroTik     | Present     | Routers, switches           |
| Netgear      | Present     | Switches                    |

---

## 2. Current Rackarr Image Architecture

### Image Storage (`src/lib/stores/images.svelte.ts`)

```typescript
// Current: keyed by device slug only
const images = new SvelteMap<string, DeviceImageData>();

interface DeviceImageData {
	front?: ImageData;
	rear?: ImageData;
}
```

**Limitation:** No support for per-placement overrides - all instances of a device type share the same image.

### Archive Format (`src/lib/utils/archive.ts`)

```
layout-name/
├── layout-name.yaml
└── assets/
    └── {device-slug}/
        ├── front.{ext}
        └── rear.{ext}
```

**Limitation:** Only stores device type level images, not placement overrides.

### Image Lookup (`src/lib/components/RackDevice.svelte`)

```typescript
// Current: looks up by device slug
const deviceImage = $derived.by(() => {
	const face = rackView === 'rear' ? 'rear' : 'front';
	return imageStore.getDeviceImage(device.slug, face);
});
```

---

## 3. Proposed Two-Level Image Architecture

### Design Goals

1. Device type images as defaults (from library or user-uploaded)
2. Per-placement overrides (individual rack instances can have different images)
3. Backward compatible archive format
4. Efficient storage (don't duplicate images unnecessarily)

### Key Design Decision: Image Key Scheme

**Option A: Single store, composite keys**

```typescript
// Device type: "dell-r630"
// Placement: "dell-r630:0", "dell-r630:1"
const images = new SvelteMap<string, DeviceImageData>();
```

**Option B: Separate stores**

```typescript
const deviceTypeImages = new SvelteMap<string, DeviceImageData>();
const placementImages = new SvelteMap<string, DeviceImageData>(); // key: "{slug}:{index}"
```

**Option C: Nested structure**

```typescript
interface ImageStoreData {
	deviceType: DeviceImageData; // default
	placements: Map<number, DeviceImageData>; // overrides by index
}
const images = new SvelteMap<string, ImageStoreData>();
```

**Recommendation:** Option B (separate stores)

- Cleaner separation of concerns
- Simpler lookup logic
- Easier to understand archive structure

### Proposed Archive Structure

```
layout-name/
├── layout-name.yaml
└── assets/
    ├── device-types/           # Device type defaults
    │   └── {slug}/
    │       ├── front.{ext}
    │       └── rear.{ext}
    └── placements/             # Per-placement overrides
        └── {slug}/
            └── {index}/
                ├── front.{ext}
                └── rear.{ext}
```

### Image Lookup Logic (Pseudocode)

```typescript
function getImageForPlacement(slug: string, index: number, face: 'front' | 'rear') {
	// 1. Check for placement override
	const placementKey = `${slug}:${index}`;
	const override = placementImages.get(placementKey)?.[face];
	if (override) return override;

	// 2. Fall back to device type default
	const typeDefault = deviceTypeImages.get(slug)?.[face];
	if (typeDefault) return typeDefault;

	// 3. No image available
	return null;
}
```

### UI Implications

**EditPanel additions:**

- Image upload for current placement
- "Using default" / "Custom image" indicator
- "Reset to default" button when override exists

**Device Library:**

- Thumbnail preview of device type image (optional, future)
- Ability to set/change device type default image

---

## 4. NetBox Integration Approaches

### Approach Comparison

| Approach            | Bundle Size | Offline | Latency | Complexity |
| ------------------- | ----------- | ------- | ------- | ---------- |
| **On-demand fetch** | 0           | No      | ~200ms  | Medium     |
| **Curated bundle**  | 500KB-2MB   | Yes     | 0       | Low        |
| **Hybrid**          | 200KB-500KB | Partial | 0-200ms | High       |
| **External tool**   | 0           | N/A     | N/A     | Low        |

### On-Demand Fetch Considerations

**CORS:** GitHub raw URLs (`raw.githubusercontent.com`) allow cross-origin requests.

**URL Pattern:**

```
https://raw.githubusercontent.com/netbox-community/devicetype-library/master/elevation-images/{Manufacturer}/{slug}.{face}.{ext}
```

**Challenges:**

- Need to know exact filename (format varies: png, jpg, jpeg)
- Need to match user's device type to NetBox naming
- Network dependency

### Curated Bundle Considerations

**Candidate devices (top 30 homelab):**

- Ubiquiti: USW-Pro-24-POE, USW-Pro-48, UDM-Pro, US-8-150W
- Synology: RS1221+, DS920+, DS1621+
- Dell: R620, R630, R720, R730
- APC: SMT1500RM2U, AP7900B
- Supermicro: Common 1U/2U chassis
- Cisco: Catalyst 2960, 3560

**Estimated size:** ~500KB-1MB compressed (assuming 30 devices × 2 faces × 20KB average)

### Matching Strategy

To fetch images, need to match Rackarr device types to NetBox:

1. **Exact slug match** - if user creates device with matching slug
2. **Manufacturer + model lookup** - search by manufacturer and model fields
3. **User-initiated search** - let user browse/search NetBox library

---

## 5. Implementation Phases

### Phase 1: Architecture (Current)

- [x] Research NetBox library structure
- [x] Research licensing
- [ ] Finalize two-level storage design
- [ ] Document archive format changes
- [ ] Get user sign-off on approach

### Phase 2: Placement Overrides

- [ ] Refactor image stores (separate device type / placement stores)
- [ ] Update archive save/load
- [ ] Add EditPanel image UI
- [ ] Update RackDevice lookup logic
- [ ] Tests

### Phase 3: NetBox Integration

- [ ] Decide on approach (fetch vs bundle vs hybrid)
- [ ] Implement chosen approach
- [ ] Add UI for browsing/fetching NetBox images
- [ ] Tests

---

## 6. Decisions

1. **Stable placement IDs:** PlacedDevice will get an `id` field (UUID or incrementing ID) to support stable image override keys that survive reordering.
   - **Decision:** Add `id` field to PlacedDevice
   - Placement image keys: `{slug}:{id}` instead of `{slug}:{index}`

2. **Starter library first:** Rationalize the starter library to contain ~20-30 representative common homelab devices before implementing images. Generic placeholders → specific popular gear.

3. **Image dimensions:** Standardize during curation, not at runtime. Process NetBox images once when building the starter library bundle.

4. **Image storage location:** Two locations - originals for reprocessing, optimized for bundling.

   ```
   /
   ├── src/lib/assets/device-images/    # Optimized, bundled (400px WebP)
   │   ├── dell/
   │   │   └── poweredge-r720.front.webp
   │   └── ...
   │
   └── assets-source/device-images/     # Originals, git-tracked but not bundled
       ├── dell/
       │   └── poweredge-r720.front.png  # Original from NetBox
       └── ...
   ```

   - `src/lib/assets/` — Vite bundles these, works offline, imports via `$lib/assets`
   - `assets-source/` — Outside build path, preserves originals for reprocessing
   - Estimated bundled size: ~1MB total (20-30 devices × 2 faces × ~15KB)
   - Can add `npm run process-images` script to regenerate optimized from originals

5. **Target image dimensions:** 400px max width for optimized images.
   - 2x retina density for typical 150-300px device slots
   - Good balance of quality and file size
   - Can reprocess from originals if needs change

6. **User-uploaded images:** Auto-process uploads for consistency.
   - Resize to 400px max width if image exceeds that
   - Convert to WebP
   - Keeps archives lean and consistent with bundled defaults
   - Small images (<400px) left untouched

## 7. Open Questions

None currently - all major decisions resolved.

---

## References

- [NetBox Device Type Library](https://github.com/netbox-community/devicetype-library)
- [CC0 1.0 Universal License](https://creativecommons.org/publicdomain/zero/1.0/)
- Current implementation: `src/lib/stores/images.svelte.ts`
- Archive format: `src/lib/utils/archive.ts`
