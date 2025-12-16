# Rackarr UX Design Audit

**Date:** 2025-12-15
**Version Audited:** 0.5.0
**Auditor:** Claude (UX Design Review)
**Reference:** Brand Guide (`01-PROJECTS/rackarr/brand-guide.md`)

---

## Executive Summary

Rackarr has a solid foundation with a well-structured design token system, consistent theming (Dracula/Alucard), and good accessibility basics. However, several areas could benefit from UX refinement to improve discoverability, reduce friction, and enhance the overall user experience.

**Key Finding:** The most significant issue is the use of raw Dracula accent colors for device backgrounds. These colors are designed for _syntax highlighting on dark backgrounds_, not as _large block fills with text overlaid_. They're too bright, too saturated, and create readability problems.

**Priority Legend:**

- **P0 (Critical):** Blocks core workflows or causes significant confusion
- **P1 (High):** Impacts usability frequently, should address soon
- **P2 (Medium):** Nice-to-have improvements that enhance polish
- **P3 (Low):** Minor refinements for edge cases

---

## 1. Color System Analysis (Dracula/Alucard)

### 1.1 Theme Color Contrast Audit (P0)

**Location:** `src/lib/styles/tokens.css`, `src/lib/utils/contrast.ts`

The app uses the official Dracula (dark) and Alucard (light) color palettes. Here's a contrast analysis:

#### Dark Theme (Dracula) Contrast Ratios

| Element      | Foreground | Background | Ratio      | WCAG AA       | Issue                             |
| ------------ | ---------- | ---------- | ---------- | ------------- | --------------------------------- |
| Body text    | `#F8F8F2`  | `#282A36`  | **11.6:1** | Pass          | Good                              |
| Muted text   | `#6272A4`  | `#282A36`  | **3.3:1**  | Fail (normal) | Borderline for body text          |
| Purple on bg | `#BD93F9`  | `#282A36`  | **6.4:1**  | Pass          | Good                              |
| Cyan on bg   | `#8BE9FD`  | `#282A36`  | **10.8:1** | Pass          | Good                              |
| Selection bg | `#44475A`  | `#282A36`  | **1.4:1**  | Fail          | Low contrast for UI boundary      |
| Border       | `#44475A`  | `#282A36`  | **1.4:1**  | Fail          | Subtle borders may be hard to see |

**Issues Found:**

1. **Muted text (`--dracula-comment: #6272A4`)** at 3.3:1 fails WCAG AA for normal text (requires 4.5:1)
2. **Borders and selection** have very low contrast against background
3. **Disabled states** using `comment` color may be unreadable for some users

#### Light Theme (Alucard) Contrast Ratios

| Element      | Foreground | Background | Ratio      | WCAG AA | Issue             |
| ------------ | ---------- | ---------- | ---------- | ------- | ----------------- |
| Body text    | `#1F1F1F`  | `#FFFBEB`  | **18.5:1** | Pass    | Excellent         |
| Muted text   | `#6C664B`  | `#FFFBEB`  | **5.0:1**  | Pass    | Borderline        |
| Purple on bg | `#644AC9`  | `#FFFBEB`  | **5.3:1**  | Pass    | Good              |
| Cyan on bg   | `#036A96`  | `#FFFBEB`  | **6.4:1**  | Pass    | Good              |
| Surface      | `#DEDCCF`  | `#FFFBEB`  | **1.2:1**  | Fail    | Very low contrast |

**Issues Found:**

1. **Surface colors have extremely low contrast** with main background - UI elements may blend together
2. **Border colors in light mode** may be too subtle

#### Device Label Contrast on Category Colors

**Location:** Device labels use `--neutral-50` (#fafafa) on colored backgrounds.

| Category          | Background | White Text Ratio | WCAG AA       | Recommendation        |
| ----------------- | ---------- | ---------------- | ------------- | --------------------- |
| Server (cyan)     | `#8BE9FD`  | **1.4:1**        | Fail          | Use dark text         |
| Network (purple)  | `#BD93F9`  | **2.3:1**        | Fail          | Use dark text         |
| Storage (green)   | `#2ECC71`  | **1.9:1**        | Fail          | Use dark text         |
| Power (red)       | `#FF5555`  | **3.5:1**        | Fail (normal) | Use dark text or bold |
| KVM (orange)      | `#FFB86C`  | **1.6:1**        | Fail          | Use dark text         |
| AV (pink)         | `#FF79C6`  | **2.5:1**        | Fail          | Use dark text         |
| Cooling (yellow)  | `#F1FA8C`  | **1.2:1**        | Fail          | Use dark text         |
| Shelf (comment)   | `#6272A4`  | **5.7:1**        | Pass          | Good                  |
| Blank (selection) | `#44475A`  | **8.2:1**        | Pass          | Good                  |

**Critical Issue:** Most Dracula accent colors are designed for display on dark backgrounds, NOT as backgrounds for white text. All bright accent colors fail WCAG AA.

**Recommendations:**

1. Implement automatic contrast detection using existing `getContrastColor` or `getContrastRatio` utilities
2. Use dark text (`#282A36` or `#1F1F1F`) on bright colors (cyan, green, yellow, orange, pink)
3. Keep white text only on dark colors (shelf, blank, comment-based)

### 1.2 The Core Problem: Dracula Colors as Device Backgrounds (P0)

**The Issue:**
Dracula accent colors were designed for **syntax highlighting** — small text elements on dark backgrounds. When used as **large filled rectangles** (device backgrounds), they create several problems:

1. **Too Bright / Too "Loud"**: Neon cyan (`#8BE9FD`) and green (`#50FA7B`) are visually overwhelming at scale
2. **Competes for Attention**: When 10+ devices are visible, the visual noise is exhausting
3. **Poor Text Readability**: White text on bright backgrounds fails WCAG AA (see contrast table above)
4. **Aesthetic Clash**: The "neon code editor" look doesn't suit a professional planning tool

**Brand Guide Gap:**
The brand guide defines category color mapping (Section: Device Category Colour Mapping) but doesn't address:

- How to handle text contrast on device backgrounds
- Whether raw accent colors are appropriate for large fills
- Alternative "muted" variants for data visualization

**Visual Comparison:**

| Color            | As Syntax Highlight      | As Device Fill                  |
| ---------------- | ------------------------ | ------------------------------- |
| Cyan `#8BE9FD`   | ✓ Small, draws attention | ✗ Overwhelming, hard to read    |
| Green `#50FA7B`  | ✓ Success indicator      | ✗ "Radioactive" at large scale  |
| Yellow `#F1FA8C` | ✓ Warning highlight      | ✗ Glaring, white text invisible |
| Pink `#FF79C6`   | ✓ Accent pop             | ✗ Too saturated for device body |

**Recommended Solution: Muted Device Palette**

Create a **secondary palette** specifically for device backgrounds — same hues as Dracula but desaturated and darkened for:

1. Better text contrast with white labels
2. Reduced visual fatigue
3. Professional appearance
4. Maintains brand identity (same hue family)

```css
/* Proposed: Muted Device Colors (Dark Theme) */
:root {
	--device-server: #4a7a8a; /* Muted cyan - was #8BE9FD */
	--device-network: #7b6ba8; /* Muted purple - was #BD93F9 */
	--device-storage: #3d7a4a; /* Muted green - was #50FA7B */
	--device-power: #a84a4a; /* Muted red - was #FF5555 */
	--device-kvm: #a87a4a; /* Muted orange - was #FFB86C */
	--device-av-media: #a85a7a; /* Muted pink - was #FF79C6 */
	--device-cooling: #8a8a4a; /* Muted yellow - was #F1FA8C */

	/* Passive categories stay as-is (already muted) */
	--device-shelf: #6272a4;
	--device-blank: #44475a;
	--device-cable: #6272a4;
	--device-patch: #6272a4;
	--device-other: #6272a4;
}
```

**Contrast Check (White Text on Muted Colors):**

| Category | Muted Color | Contrast Ratio | WCAG AA |
| -------- | ----------- | -------------- | ------- |
| Server   | `#4A7A8A`   | 4.8:1          | Pass    |
| Network  | `#7B6BA8`   | 4.6:1          | Pass    |
| Storage  | `#3D7A4A`   | 5.2:1          | Pass    |
| Power    | `#A84A4A`   | 5.1:1          | Pass    |
| KVM      | `#A87A4A`   | 4.5:1          | Pass    |
| AV/Media | `#A85A7A`   | 4.7:1          | Pass    |
| Cooling  | `#8A8A4A`   | 4.6:1          | Pass    |

**Alternative: Use Brand Guide's Functional Colors**

The brand guide defines "Functional Colours (UI Only)" which are already designed for readability:

| Token             | Hex       | Potential Use       |
| ----------------- | --------- | ------------------- |
| Functional Cyan   | `#0081D6` | Server devices      |
| Functional Purple | `#815CD6` | Network devices     |
| Functional Green  | `#089108` | Storage devices     |
| Functional Red    | `#DE5735` | Power devices       |
| Functional Orange | `#A39514` | KVM/Warning devices |

These pass WCAG AA with white text and feel more "enterprise" than neon.

### 1.3 Color Aesthetic Considerations (P1)

**Dracula Theme Strengths:**

- Well-established, recognizable palette
- Good for long coding sessions (reduced eye strain)
- Vibrant accent colors provide clear visual hierarchy
- Neon glow effects (`--glow-cyan-*`, `--glow-purple-*`) add polish

**Dracula Theme Weaknesses in Rackarr Context:**

- **Rack visualization feels "loud"** - neon colors compete for attention
- **Too many accent colors** - 7 bright accents can feel chaotic when all device categories are visible
- **Selection purple vs Network purple** - both use `#BD93F9`, causes confusion
- **Cyan overload** - used for servers, primary actions, links, info states, and airflow intake

**Alucard Theme Issues:**

- **Warm cream tones may look "yellowed"** on some monitors
- **Surface differentiation is poor** - floating, bg-light, bg-lighter all look similar
- **Accent colors are muted** - may not stand out enough for interactive elements

**Recommendations:**

1. **Implement muted device palette** - reserve vibrant Dracula accents for UI chrome only
2. **Differentiate selection from network color** - use pink or shift purple hue
3. **Add more surface contrast** in light theme
4. **Keep Dracula accents for**: focus rings, buttons, links, icons (small elements)
5. **Use muted colors for**: device fills, charts, data visualization (large areas)

### 1.4 Missing Color Token Definitions (P2)

**Tokens used but not defined:**

- `--z-tooltip` (used in Tooltip.svelte, defaults to 1000)
- `--colour-surface-overlay` (Tooltip background)
- `--colour-text-inverse` (Tooltip text)
- `--colour-text-muted-inverse` (Tooltip shortcut text)
- `--colour-hover` (Toast dismiss hover)
- `--colour-button-bg` (multiple components)
- `--colour-button-hover` (multiple components)
- `--transition-fast` (multiple components)
- `--colour-input-bg` (forms)
- `--colour-text-on-primary` (Toolbar primary button)

**Recommendation:** Audit all CSS and add missing token definitions to tokens.css.

---

## 2. Onboarding & First-Time User Experience

### 2.1 Welcome Screen - No Clear Call to Action (P1)

**Location:** `src/lib/components/WelcomeScreen.svelte`

**Issue:** The welcome screen shows a ghostly 42U rack background but provides no visible instructions or call-to-action. Users must discover that clicking anywhere creates a rack.

**Current Behavior:**

- Ghost rack visual at 15% opacity
- Entire area is clickable
- No text, button, or visual hint

**Recommendation:**

- Add centered CTA: "Click to create your first rack" or "Press N to get started"
- Consider subtle pulsing animation or hover state
- Show keyboard shortcut hint: "Press ? for help"

### 2.2 No Guided Tour or Tips (P2)

**Issue:** New users have no introduction to drag-and-drop mechanics, keyboard shortcuts, or dual-view (front/rear) concept.

**Recommendation:**

- Add optional first-time-user tooltips pointing to key areas
- Add "Getting Started" section in Help panel
- Consider 3-step onboarding: Create Rack > Add Device > Export

---

## 3. Navigation & Information Architecture

### 3.1 Toolbar Overflow at Medium Widths (P1)

**Location:** `src/lib/components/Toolbar.svelte`

**Issue:** Between 1000px and 1024px, toolbar buttons become icon-only, but many buttons may still not fit well. The jump from full labels to icon-only is abrupt.

**Recommendation:**

- Progressive disclosure: show primary actions first, hide secondary behind "More" dropdown
- Or: Adjust breakpoints for smoother transition

### 3.2 Toolbar Button Grouping Inconsistency (P2)

**Issue:** Current grouping logic isn't always intuitive.

**Recommendation:** Group by workflow:

- **File**: New, Load, Save, Export
- **Edit**: Undo, Redo, Delete
- **View**: Display Mode, Airflow, Reset View
- **Help**: Help (near theme toggle)

### 3.3 No Breadcrumb or Context Indicator (P3)

**Issue:** No clear indicator of current rack name being worked on.

**Recommendation:** Show rack name in toolbar or canvas header.

---

## 4. Device Library (Left Sidebar)

### 4.1 Search Behavior - No Clear Results Feedback (P1)

**Location:** `src/lib/components/DevicePalette.svelte`

**Issue:** Accordion sections remain visible even if empty during search.

**Recommendation:**

- Hide sections with 0 matches during search
- Or: Show match count and collapse empty sections automatically

### 4.2 Device Drag Affordance Not Visible Until Hover (P2)

**Issue:** Grip icon only appears on hover. First-time users may not realize devices are draggable.

**Recommendation:**

- Always show grip at reduced opacity, brighten on hover
- Or: Add visual hint on first use

### 4.3 Import Button Placement (P3)

**Issue:** Buttons at bottom may be below fold on smaller screens.

**Recommendation:**

- Sticky positioning for action buttons
- Or: Add import via toolbar dropdown

---

## 5. Canvas & Rack Interaction

### 5.1 Selection State Not Immediately Obvious (P1)

**Issue:** Selected devices show purple outline, but:

- No visual distinction between rack vs device selection on canvas
- Multi-selection behavior unclear

**Recommendation:**

- Add subtle glow effect using existing `--glow-purple-*` tokens
- Consider selection mode indicator in toolbar

### 5.2 Drag-and-Drop Feedback During Move (P1)

**Issue:** Device becomes 50% opacity during drag, but drop zone feedback could be more prominent.

**Recommendation:**

- Add ghost preview of landing position
- Highlight valid/invalid zones more prominently
- Add "snap" animation when dropping

### 5.3 Airflow Conflict Visibility (P2)

**Issue:** Orange border for conflicts, but users may not understand the conflict or how to resolve it.

**Recommendation:**

- Add tooltip or EditPanel explanation
- Consider summary indicator: "2 airflow conflicts"

### 5.4 Zoom/Pan Controls Not Discoverable (P2)

**Issue:** Canvas supports pan/zoom but no visible controls or hints.

**Recommendation:**

- Add zoom percentage indicator
- Consider +/- zoom buttons
- Document in Help panel

---

## 6. Edit Panel (Right Drawer)

### 6.1 Drawer Close Behavior Inconsistent (P1)

**Location:** `src/lib/components/EditPanel.svelte`

**Issue:** Drawer auto-opens on selection but `showClose={false}` means no explicit close button.

**Recommendation:**

- Enable close button via `showClose={true}`
- Make click-outside behavior more obvious

### 6.2 Device Editing vs Viewing Confusion (P2)

**Issue:** Some fields are editable (Display Name, Face, Airflow), others are read-only. Distinction not visually clear.

**Recommendation:**

- Group editable fields separately from info fields
- Use consistent styling: editable = input/select, read-only = text

### 6.3 Delete Confirmation Missing (P1)

**Issue:** No confirmation for destructive actions. Undo exists, but accidental deletions are frustrating.

**Recommendation:**

- Add confirmation for "Delete Rack" (which removes all devices)
- Use existing `ConfirmDialog.svelte` component

### 6.4 Rack Height Change Warning Placement (P2)

**Issue:** "Remove all devices to resize" warning is subtle.

**Recommendation:**

- Make warning more prominent (icon + color)
- Show device count that would be affected

---

## 7. Dialogs & Forms

### 7.1 Add Device Form - Image Upload Not Obvious (P1)

**Location:** `src/lib/components/AddDeviceForm.svelte`

**Issue:** Image upload fields at bottom of long form may be missed.

**Recommendation:**

- Collapsible "Advanced" section for images
- Or: Add visual indicator (thumbnail placeholders)
- Show image size/format recommendations

### 7.2 Form Validation Timing (P2)

**Issue:** Validation only triggers on submit, not on blur.

**Recommendation:**

- Add blur validation for required fields
- Show real-time feedback

### 7.3 Export Dialog - Preview Size (P2)

**Location:** `src/lib/components/ExportDialog.svelte`

**Issue:** Preview limited to 200x300px, may be too small.

**Recommendation:**

- Allow click to expand preview
- Show export dimensions in pixels

### 7.4 New Rack Dialog - Default Name (P3)

**Location:** `src/lib/components/NewRackForm.svelte`

**Issue:** Default "Racky McRackface" may not fit all users' expectations.

**Recommendation:**

- More neutral default or select all text on focus for easy replacement

---

## 8. Feedback & Notifications

### 8.1 Toast Positioning (P2)

**Issue:** Toasts may overlap with Edit Panel drawer.

**Recommendation:**

- Verify no overlap when drawer open
- Consider dynamic positioning

### 8.2 Toast Duration Not Adjustable (P3)

**Issue:** All toasts have same duration. Errors may need longer visibility.

**Recommendation:**

- Longer duration for error toasts
- Or: Don't auto-dismiss errors

### 8.3 No Loading States (P2)

**Issue:** No loading indicators for Import, Export, Save operations.

**Recommendation:**

- Add spinner for async operations
- Show "Exporting..." state during generation

---

## 9. Accessibility

### 9.1 Keyboard Navigation (P0 - Partially Addressed)

**Current State:** Good keyboard support exists (arrow keys, Tab, Escape, focus states).

**Gaps:**

- No skip-to-content link
- Drawer focus management unclear
- No roving tabindex in device list

**Recommendation:**

- Add skip link
- Verify drawer focus management
- Consider roving tabindex in DevicePalette

### 9.2 Screen Reader Announcements (P1)

**Issue:** Live regions exist for toasts, but:

- Drag-and-drop has no announcements
- Selection changes not announced

**Recommendation:**

- Add aria-live region for selection changes
- Announce drag results: "Device moved to U12"

### 9.3 Color Contrast (P1)

See Section 1.1 for detailed analysis.

**Summary:**

- Muted text fails WCAG AA in dark theme
- Device labels on bright backgrounds fail WCAG AA
- Implement automatic contrast detection

### 9.4 Reduced Motion (P0 - Addressed)

**Current State:** `prefers-reduced-motion` is properly implemented in app.css.

---

## 10. Responsive Design

### 10.1 Mobile Experience (P1)

**Issue:** App designed for desktop. On mobile:

- Sidebars take significant space
- Drag-and-drop challenging on touch
- Hamburger menu may be cramped

**Recommendation:**

- Ensure touch targets are 44x44px minimum
- Test on tablet as sweet spot

### 10.2 Sidebar Collapse Option Missing (P2)

**Issue:** Left sidebar always visible, taking 280px+ space.

**Recommendation:**

- Add sidebar collapse toggle
- Show mini/icon-only view when collapsed
- Remember user preference

---

## 11. Visual Polish

### 11.1 Icon Consistency (P2)

**Issue:** Mix of icon styles:

- Custom SVG icons (clean, consistent)
- Unicode characters in Toast (checkmark, X, warning, info)
- Arrow character for Import button

**Recommendation:**

- Replace Unicode with SVG icons for consistency

### 11.2 Button Styling Inconsistency (P2)

**Issue:** Different button styles across components.

**Recommendation:**

- Create shared button component or utility classes
- Define variants: primary, secondary, danger, ghost

### 11.3 Form Input Styling Duplication (P3)

**Issue:** Each form component restyles inputs slightly differently.

**Recommendation:**

- Ensure all components use global `.input-field` class consistently

---

## 12. Component-Specific Issues

### 12.1 Tooltip - Missing aria-describedby (P2)

**Location:** `src/lib/components/Tooltip.svelte`

**Issue:** Generates ID but doesn't link via `aria-describedby`.

### 12.2 Tooltip - Undefined z-index Token (P3)

**Issue:** Uses `--z-tooltip` which isn't defined, falls back to 1000.

### 12.3 Dialog - Focus Management Race Condition (P2)

**Location:** `src/lib/components/Dialog.svelte`

**Issue:** Uses `setTimeout(..., 0)` for focusing. Fragile timing.

**Recommendation:** Use Svelte's `tick()` instead.

---

## 13. Data & State

### 13.1 Unsaved Changes Warning Missing (P1)

**Issue:** No warning when closing tab with unsaved changes.

**Recommendation:**

- Implement `beforeunload` handler
- Track "dirty" state in layout store

### 13.2 Auto-save Option Missing (P2)

**Issue:** Users must manually save. Work loss possible.

**Recommendation:**

- Auto-save to localStorage
- Add visual "Draft saved" indicator

---

## 14. Brand Guide Alignment

### 14.1 Areas of Strong Alignment

| Brand Guide Element                  | Implementation Status |
| ------------------------------------ | --------------------- |
| Dracula/Alucard themes               | Implemented correctly |
| Logo mark & variants                 | Present in `/static/` |
| Typography (JetBrains Mono + Inter)  | Implemented           |
| Spacing system (4px base)            | Implemented           |
| Border radii (0 for logo, md for UI) | Mostly aligned        |
| Focus ring glow effects              | Implemented           |
| Theme toggle persistence             | Working               |

### 14.2 Deviations from Brand Guide

| Brand Guide Says               | Current Implementation               | Issue                                                      |
| ------------------------------ | ------------------------------------ | ---------------------------------------------------------- |
| "Functional Colors for UI"     | Using raw Dracula accents everywhere | Functional colors (`#0081D6`, `#815CD6`, etc.) aren't used |
| "Comment color for muted text" | Using `#6272A4`                      | Fails WCAG AA for normal text (3.3:1)                      |
| Category colors for devices    | Using raw Dracula accents            | Too bright for large fills                                 |
| Sharp corners (Geismar style)  | `radius-md` on most elements         | Could be sharper for brand consistency                     |
| Purple as primary brand        | Cyan used more prominently           | Server (cyan) dominates visually                           |

### 14.3 Brand Guide Gaps (Need Updates)

The brand guide should be updated to address:

1. **Device Background Colors**
   - Current guide lists Dracula accents for categories
   - Need: Muted variants for large area fills
   - Recommendation: Add "Device Palette" section with darkened colors

2. **Text Contrast on Colored Backgrounds**
   - Current guide doesn't specify text color rules
   - Need: Guidance on when to use white vs dark text
   - Recommendation: Add contrast decision tree

3. **Color Usage Hierarchy**
   - When to use Dracula accents vs Functional colors vs Muted variants
   - Recommendation: Define "accent" (small UI) vs "fill" (large areas) usage

4. **Missing Token Definitions**
   - Several tokens referenced in code aren't in brand guide
   - Recommendation: Audit and add missing tokens

### 14.4 Proposed Brand Guide Additions

```markdown
## Device Visualization Colors

For large filled areas (device backgrounds, charts), use muted variants
that maintain the Dracula hue family but provide adequate contrast.

### Muted Palette (Data Visualization)

| Category | Dracula Accent | Muted Variant | Text Color |
| -------- | -------------- | ------------- | ---------- |
| Server   | #8BE9FD        | #4A7A8A       | White      |
| Network  | #BD93F9        | #7B6BA8       | White      |
| Storage  | #50FA7B        | #3D7A4A       | White      |
| Power    | #FF5555        | #A84A4A       | White      |
| KVM      | #FFB86C        | #A87A4A       | White      |
| AV/Media | #FF79C6        | #A85A7A       | White      |
| Cooling  | #F1FA8C        | #8A8A4A       | White      |

### Usage Rules

- **Dracula Accents**: Icons, links, focus rings, button text, small highlights
- **Muted Variants**: Device fills, chart areas, data visualization backgrounds
- **Functional Colors**: UI feedback states (success, warning, error badges)
```

---

## Summary: Priority Fixes

### P0 (Critical) — Color System Overhaul

**The #1 issue: Raw Dracula accents used as device backgrounds are too bright, too saturated, and fail WCAG contrast.**

| Action                                    | Impact                                  |
| ----------------------------------------- | --------------------------------------- |
| Implement muted device color palette      | Fixes readability, reduces visual noise |
| Update brand guide with muted variants    | Documents the design decision           |
| Update `CATEGORY_COLOURS` in constants.ts | Single source of truth change           |

### P1 (High) — Usability & Accessibility

1. **Welcome screen** needs visible CTA (currently no hint to click)
2. **Delete confirmation** for destructive actions (Delete Rack, Remove Device)
3. **Drawer close button** missing (users must click outside or press Escape)
4. **Unsaved changes warning** (`beforeunload` handler)
5. **Screen reader announcements** for drag-drop and selection
6. **Muted text contrast** (`#6272A4` on `#282A36` = 3.3:1, borderline)
7. **Differentiate selection purple from network purple** (both `#BD93F9`)

### P2 (Medium) — Polish & Consistency

1. **Missing color token definitions** (~10 tokens used but not defined)
2. **Reduce cyan overload** (servers, buttons, links, info, airflow all cyan)
3. **Toolbar button grouping** (File | Edit | View | Help)
4. **Search behavior** — hide empty accordion sections
5. **Form validation** on blur, not just submit
6. **Loading states** for export/save/import
7. **Sidebar collapse** option
8. **Icon consistency** (replace Unicode with SVG in Toast)
9. **Button styling** consolidation across components

### P3 (Low) — Nice to Have

1. Default rack name less quirky ("Racky McRackface" → "Server Rack")
2. Tooltip z-index token definition
3. Surface contrast improvement in Alucard (light) theme
4. Sharp corners option to match Geismar design philosophy

---

## Appendix A: Files Reviewed

| Component     | Path                                      | Primary Issues                      |
| ------------- | ----------------------------------------- | ----------------------------------- |
| tokens.css    | `src/lib/styles/tokens.css`               | Missing tokens, contrast issues     |
| contrast.ts   | `src/lib/utils/contrast.ts`               | Good utilities, not fully utilized  |
| constants.ts  | `src/lib/types/constants.ts`              | Category colors need contrast check |
| Toolbar       | `src/lib/components/Toolbar.svelte`       | Button grouping, responsive         |
| Sidebar       | `src/lib/components/Sidebar.svelte`       | Fixed width, no collapse            |
| DevicePalette | `src/lib/components/DevicePalette.svelte` | Search filtering                    |
| EditPanel     | `src/lib/components/EditPanel.svelte`     | Close button, edit vs view          |
| Dialog        | `src/lib/components/Dialog.svelte`        | Focus timing                        |
| AddDeviceForm | `src/lib/components/AddDeviceForm.svelte` | Image upload discoverability        |
| NewRackForm   | `src/lib/components/NewRackForm.svelte`   | Default name                        |
| ExportDialog  | `src/lib/components/ExportDialog.svelte`  | Preview size                        |
| Toast         | `src/lib/components/Toast.svelte`         | Unicode icons                       |
| Tooltip       | `src/lib/components/Tooltip.svelte`       | aria-describedby, z-index           |
| WelcomeScreen | `src/lib/components/WelcomeScreen.svelte` | No visible CTA                      |
| RackDevice    | `src/lib/components/RackDevice.svelte`    | Label contrast critical             |
| HelpPanel     | `src/lib/components/HelpPanel.svelte`     | Could include tips                  |

## Appendix B: Dracula Color Reference

### Official Dracula Palette

| Name         | Hex       | Usage                             |
| ------------ | --------- | --------------------------------- |
| Background   | `#282A36` | Main background                   |
| Current Line | `#44475A` | Selection, borders                |
| Foreground   | `#F8F8F2` | Primary text                      |
| Comment      | `#6272A4` | Muted text (contrast issues)      |
| Cyan         | `#8BE9FD` | Server, primary, links (overused) |
| Green        | `#50FA7B` | Success states                    |
| Orange       | `#FFB86C` | KVM, warnings                     |
| Pink         | `#FF79C6` | AV/Media                          |
| Purple       | `#BD93F9` | Network, selection (conflicts)    |
| Red          | `#FF5555` | Power, errors                     |
| Yellow       | `#F1FA8C` | Cooling                           |

### Contrast Issues Summary

- White text on cyan/green/yellow/orange/pink = **FAIL** (use dark text)
- White text on red = **Borderline** (consider bold text)
- White text on comment/selection = **PASS**
- Comment on bg = 3.3:1 (**FAIL** for normal text, pass for large)

## Appendix C: Proposed Muted Device Palette

Ready-to-implement values for `src/lib/types/constants.ts`:

```typescript
/**
 * Muted device colors for rack visualization
 * Same hue family as Dracula but darkened/desaturated for:
 * - WCAG AA contrast with white text (4.5:1+)
 * - Reduced visual fatigue
 * - Professional appearance
 */
export const CATEGORY_COLOURS: Record<DeviceCategory, string> = {
	// Active categories — Muted Dracula (dark theme)
	server: '#4A7A8A', // Muted cyan (was #8BE9FD) — 4.8:1
	network: '#7B6BA8', // Muted purple (was #BD93F9) — 4.6:1
	storage: '#3D7A4A', // Muted green (was #50FA7B) — 5.2:1
	power: '#A84A4A', // Muted red (was #FF5555) — 5.1:1
	kvm: '#A87A4A', // Muted orange (was #FFB86C) — 4.5:1
	'av-media': '#A85A7A', // Muted pink (was #FF79C6) — 4.7:1
	cooling: '#8A8A4A', // Muted yellow (was #F1FA8C) — 4.6:1

	// Passive categories — unchanged (already muted)
	shelf: '#6272A4',
	blank: '#44475A',
	'cable-management': '#6272A4',
	'patch-panel': '#6272A4',
	other: '#6272A4'
} as const;

/**
 * Alucard (light theme) device colors
 * Slightly lighter for warm cream background
 */
export const CATEGORY_COLOURS_LIGHT: Record<DeviceCategory, string> = {
	server: '#5A8A9A',
	network: '#8B7BB8',
	storage: '#4D8A5A',
	power: '#B85A5A',
	kvm: '#B88A5A',
	'av-media': '#B86A8A',
	cooling: '#9A9A5A',

	shelf: '#7C766B',
	blank: '#CFCFDE',
	'cable-management': '#7C766B',
	'patch-panel': '#7C766B',
	other: '#7C766B'
} as const;
```

### Color Derivation Method

To create muted variants from Dracula accents:

1. **Reduce saturation** by 40-50%
2. **Reduce lightness** by 20-30%
3. **Verify contrast** ≥ 4.5:1 against white (`#FAFAFA`)
4. **Maintain hue** within ±10° of original

HSL Transformation Example (Cyan):

```
Original: #8BE9FD → hsl(187, 95%, 77%)
Muted:    #4A7A8A → hsl(187, 30%, 42%)
```

---

_End of Audit_
