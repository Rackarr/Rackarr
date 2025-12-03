# Data Schema Discrepancies

Audit of implementation against `docs/planning/data-schema.md` reference document.

**Audit Date:** 2025-12-03

---

## 1. File Format

### Reference Document

- **Project files**: `.rackarr.yaml` (YAML format)
- **Equipment library**: NetBox-compatible YAML
- **Decision**: "YAML for Everything"

### Current Implementation

- **Project files**: `.rackarr.zip` (ZIP archive containing `layout.json`)
- **Legacy support**: `.rackarr.json`
- **Internal format**: JSON throughout

### Discrepancy

**MAJOR**: The document explicitly decided on YAML for project files to support:

- Hand-editing with comments
- Version control diffs
- Consistency with equipment library

The implementation uses JSON inside a ZIP archive instead.

---

## 2. Terminology: Equipment vs Device

### Reference Document

Uses "Equipment" terminology:

```yaml
equipment:
  - id: uuid-here
    name: TrueNAS Server
    type: synology-ds920-plus
```

### Current Implementation

Uses "Device" terminology:

- TypeScript interface: `Device`
- Array field: `deviceLibrary`
- Placed items: `PlacedDevice`

### Discrepancy

**MINOR**: Naming inconsistency. Both refer to the same concept but document uses "equipment" while code uses "device".

---

## 3. Device Identifier Field

### Reference Document

Uses `slug` for unique identification (NetBox-compatible):

```yaml
slug: synology-ds920-plus # For deduplication
```

### Current Implementation

**TypeScript Interface** (`types/index.ts`):

```typescript
interface Device {
	id: string; // UUID
	// ...
}
```

**Zod Schema** (`schemas/device.ts`):

```typescript
DeviceSchema = z.object({
	slug: z.string().regex(/^[-a-z0-9_]+$/)
	// ...
});
```

### Discrepancy

**MAJOR**: Two different identifiers:

- Runtime uses `id` (UUID)
- Schema validation uses `slug`

The TypeScript interface and Zod schema are incompatible.

---

## 4. Device Height Field Naming

### Reference Document

Uses `u_height` (NetBox-compatible):

```yaml
u_height: 2
```

### Current Implementation

**TypeScript Interface**:

```typescript
height: number; // Not u_height
```

**Zod Schema**:

```typescript
u_height: z.number(); // Correct
```

### Discrepancy

**MAJOR**: Field name mismatch between TypeScript interface (`height`) and Zod schema (`u_height`).

---

## 5. PlacedDevice Reference Field

### Reference Document

Uses `type` to reference equipment:

```yaml
equipment:
  - type: synology-ds920-plus # References library
```

### Current Implementation

**TypeScript Interface**:

```typescript
interface PlacedDevice {
	libraryId: string; // UUID reference
}
```

**Zod Schema**:

```typescript
PlacedDeviceSchema = z.object({
	slug: z.string() // Slug reference
});
```

### Discrepancy

**MAJOR**: Three different naming conventions:

- Document: `type`
- TypeScript: `libraryId`
- Zod Schema: `slug`

---

## 6. Project Structure Field Names

### Reference Document

```yaml
rack:
  height: 42
  unitNumbering: ascending
  formFactor: 4-post-cabinet

equipment:
  - position: 10
    face: front
```

### Current Implementation

```typescript
interface Layout {
	racks: Rack[]; // 'racks' not 'rack'
	deviceLibrary: Device[]; // 'deviceLibrary' not equipment library
}

interface Rack {
	desc_units?: boolean; // Not 'unitNumbering'
	form_factor?: FormFactor; // snake_case not camelCase
}
```

### Discrepancy

**MINOR**: Naming conventions differ:

- `unitNumbering: ascending` vs `desc_units: boolean`
- `formFactor` (camelCase) vs `form_factor` (snake_case)
- `equipment` vs `deviceLibrary`

---

## 7. Rack Fields Missing from Schema

### TypeScript Interface has but Zod Schema lacks:

- `view: RackView` - Current view state
- `position: number` - Order in layout

### Discrepancy

**MINOR**: Schema doesn't validate all runtime fields. These may be intentionally runtime-only.

---

## 8. Archive Internal Structure

### Reference Document

Not specified (assumed YAML files)

### Current Implementation

```
my-layout.rackarr.zip
├── layout.json      # JSON, not YAML
└── images/
    ├── device-abc-front.png
    └── device-abc-rear.jpg
```

### Discrepancy

**MODERATE**: Archive uses `layout.json` not `layout.yaml` or `project.yaml`.

---

## 9. NetBox Compatibility Fields

### Reference Document

Planned NetBox-compatible fields:

```yaml
manufacturer: Synology
model: DS920+
slug: synology-ds920-plus
```

### Current Implementation

TypeScript interface includes these as optional:

```typescript
manufacturer?: string;
model?: string;
// But NO slug field (uses id instead)
```

### Discrepancy

**MODERATE**: No `slug` field in TypeScript interface despite being in Zod schema and document.

---

## Summary

| Category         | Discrepancy                     | Severity |
| ---------------- | ------------------------------- | -------- |
| File Format      | JSON/ZIP instead of YAML        | MAJOR    |
| Device ID        | `id` vs `slug` mismatch         | MAJOR    |
| Height Field     | `height` vs `u_height`          | MAJOR    |
| PlacedDevice Ref | `libraryId` vs `slug` vs `type` | MAJOR    |
| Terminology      | "Device" vs "Equipment"         | MINOR    |
| Field Names      | camelCase vs snake_case         | MINOR    |
| Missing Fields   | Schema lacks runtime fields     | MINOR    |
| Archive Format   | JSON inside ZIP                 | MODERATE |
| NetBox Compat    | Missing slug in interface       | MODERATE |

---

## Recommendations

1. **Decide on identifier strategy**: UUID (`id`) or slug-based identification
2. **Align TypeScript interfaces with Zod schemas**: Especially `height`/`u_height` and `id`/`slug`
3. **Consider YAML format**: If hand-editing and VCS diffs are important use cases
4. **Update document or implementation**: Bring them into alignment
5. **Add migration path**: If changing field names in existing saves
