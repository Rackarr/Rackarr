# Data Format Decision: YAML Adoption Strategy

## The Two Data Concerns

Rackarr has two distinct data storage needs that should be evaluated separately:

### 1. Equipment Definitions (Device Types)

**What:** Templates for equipment — manufacturer, model, dimensions, weight, images
**NetBox equivalent:** Device Type Library (`devicetype-library` repository)
**Frequency:** Read often, write rarely (library building)

### 2. Project Files (Rack Layouts)

**What:** User's rack configuration — rack properties, placed equipment, positions
**NetBox equivalent:** None — NetBox stores this in a database, not files
**Frequency:** Read/write frequently (active design work)

---

## Equipment Definitions: Adopt NetBox Format

**Recommendation:** Yes, adopt NetBox YAML schema (subset)

### NetBox Device Type Schema (Relevant Fields)

```yaml
# Full NetBox schema
manufacturer: Synology
model: DS920+
slug: synology-ds920-plus
part_number: DS920+
u_height: 2
is_full_depth: true
airflow: front-to-rear
weight: 2.34
weight_unit: kg
front_image: true
rear_image: true
comments: '4-bay NAS, Intel Celeron J4125'

# Fields we'd SKIP (enterprise/networking specific)
subdevice_role: parent|child
interfaces: [...]
console-ports: [...]
power-ports: [...]
power-outlets: [...]
module-bays: [...]
device-bays: [...]
```

### Rackarr Subset Schema

```yaml
# What Rackarr would use
manufacturer: Synology
model: DS920+
slug: synology-ds920-plus # For deduplication
u_height: 2
is_full_depth: true
airflow: front-to-rear # v0.2+
weight: 2.34 # v0.4+
weight_unit: kg # v0.4+
front_image: true # Future
rear_image: true # Future
comments: '4-bay NAS'

# Rackarr-specific additions (if needed)
rackarr:
  colour: '#3b82f6' # Display colour
  category: storage # For filtering
  tags: [nas, synology] # User organization
```

### Benefits of Adoption

1. **Instant library access**
   - 1000+ device definitions ready to import
   - Maintained by active community
   - Covers major homelab brands (Ubiquiti, Synology, QNAP, etc.)

2. **No translation overhead**
   - Parse once, use directly
   - No schema mapping bugs
   - Updates flow through naturally

3. **Contribution path**
   - Rackarr users can submit to NetBox library
   - Improvements benefit both ecosystems
   - Community goodwill

4. **Familiarity**
   - Homelabbers using NetBox already know the format
   - Documentation exists
   - Tooling exists (validators, linters)

### Implementation Approach

```
v0.1: Manual equipment entry (no library)
      └── Store as JSON internally for simplicity

v0.2: Introduce YAML parsing
      └── Add js-yaml dependency
      └── Parse NetBox device type files
      └── Store parsed data in internal format (JSON or keep as-is)

v0.3: Full library integration
      └── Browse/import from device type library
      └── User equipment saved in NetBox-compatible YAML
```

---

## Project Files: Format Options

NetBox doesn't have project files — racks are database objects. We need our own format.

### Option A: JSON (Current Assumption)

```json
{
	"version": "0.1.0",
	"name": "My Homelab Rack",
	"rack": {
		"height": 42,
		"unitNumbering": "ascending",
		"formFactor": "4-post-cabinet"
	},
	"equipment": [
		{
			"id": "uuid-here",
			"name": "TrueNAS Server",
			"type": "synology-ds920-plus",
			"position": 10,
			"face": "front"
		}
	]
}
```

**Pros:**

- Native to JavaScript (no parsing library)
- Svelte ecosystem standard
- Simpler programmatic manipulation

**Cons:**

- No comments (users can't annotate)
- Less human-readable
- Inconsistent with equipment library

### Option B: YAML (For Consistency)

```yaml
version: '0.1.0'
name: My Homelab Rack

# Rack configuration
rack:
  height: 42
  unitNumbering: ascending
  formFactor: 4-post-cabinet

# Placed equipment
equipment:
  - id: uuid-here
    name: TrueNAS Server
    type: synology-ds920-plus # References library
    position: 10
    face: front
    # User can add notes!
    notes: |
      Primary storage server
      Last upgraded: 2025-01
```

**Pros:**

- Consistent with equipment library
- Comments supported (users love this)
- More readable in version control diffs
- Single parsing library for everything

**Cons:**

- Requires js-yaml dependency
- Slightly more complex save/load
- Less familiar to pure frontend devs

### Option C: Hybrid

- Equipment library: YAML (NetBox compatible)
- Project files: JSON (native browser)

**Pros:**

- Best tool for each job
- No YAML dependency for v0.1

**Cons:**

- Two formats to document
- Inconsistent user experience
- Still need YAML parser for v0.2+

---

## Recommendation

### For Equipment Library

**Use NetBox-compatible YAML** — This is nearly a no-brainer. The ecosystem benefits are too significant.

### For Project Files

**Start with JSON for v0.1, evaluate YAML for v0.2+**

Rationale:

- v0.1 doesn't need equipment library import (no YAML parser yet)
- JSON is simpler for MVP
- When we add YAML parsing for equipment (v0.2), reassess project format
- User feedback on v0.1 may inform this decision

If we do switch to YAML for projects:

- Provide migration tool for existing JSON saves
- Or support both formats for reading (YAML preferred for writing)

---

## Questions to Resolve

## Decision: YAML for Everything

**Decided:** 2025-11-27

### Equipment Library

**Format:** NetBox-compatible YAML (subset)

- Import directly from `netbox-community/devicetype-library`
- Use only dimension/weight fields, ignore networking specifics
- Arr spirit: pillage their library, don't worry about export compatibility

### Project Files

**Format:** YAML

**Rationale:**

1. **Homelabbers will hand-edit** — They're tinkerers. Comments and readability matter.
2. **Version control** — Homelab repos are common. YAML diffs cleanly.
3. **Consistency** — One format, one parser, one set of docs.
4. **No export concern** — We're pillaging NetBox's library, not building a two-way bridge.

### Implementation

```
v0.1: Add js-yaml dependency from the start
      └── Project files in YAML
      └── Manual equipment entry stored as YAML
      └── No library import yet (but format ready)

v0.2: Equipment library import
      └── Parse NetBox device type YAML directly
      └── Merge into local library (also YAML)

v0.3: Full library management
      └── User equipment saved in compatible format
      └── Could theoretically contribute back (but not our problem)
```

### File Extensions

- `.rackarr.yaml` — Project files
- Equipment library: Match NetBox convention (manufacturer folders, `model.yaml`)

### Schema Approach

- **Loose parsing** for NetBox imports (ignore unknown fields)
- **Strict schema** for Rackarr project files (validate on save)

---

## Resolved Questions

1. **Store imported equipment as YAML or convert?**
   → Keep as YAML. Simpler, and we're not optimizing for milliseconds.

2. **Hand-edit save files?**
   → Yes, homelabbers will. YAML's comments are valuable.

3. **Version control use case?**
   → Yes, big plus. YAML diffs better than JSON.

4. **Full NetBox compatibility?**
   → No. One-way pillage only. Arr spirit. 🏴‍☠️

## Related

- [[netbox-research]] — Full NetBox analysis
- [[roadmap]] — Version planning
- [[spec]] — Technical specification (when created)
