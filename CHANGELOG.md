# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-11-30

### Added

- Front/rear rack view toggle with device face filtering
- Device face assignment (front, rear, or both)
- Fit All zoom button with F keyboard shortcut
- Rack duplication with Ctrl/Cmd+D shortcut
- Device library import from JSON files
- Layout migration from v0.1 to v0.2

### Changed

- Device Library toggle button replaces branding in toolbar
- Rack titles now positioned above racks (not below)
- Device icons vertically centered in rack slots
- Help panel shows only GitHub link

### Fixed

- Coordinate calculations now use getScreenCTM() for better zoom/pan handling
- Drag-and-drop works correctly at all zoom levels and pan positions

### Technical

- Integrated panzoom library for smooth canvas zoom/pan
- Added comprehensive test coverage (793 tests)

## [0.1.1] - 2025-12-01

### Changed

- Rescoped to single-rack editing for v0.1 stability
- Multi-rack support deferred to v0.3
- Removed rack reordering UI (drag handles)
- Simplified canvas layout for single rack (centered)

### Added

- Save-first confirmation dialog when replacing rack
- Warning toast when loading multi-rack files
- E2E tests for single-rack behavior

### Removed

- Multi-rack canvas display (deferred to v0.3)
- Cross-rack device moves (deferred to v0.3)
- Rack reordering controls (deferred to v0.3)

## [0.1.0] - 2025-11-28

### Added

- Initial release of Rackarr
- Visual rack editor with SVG rendering
- Support for up to 6 racks (1U-100U height)
- Drag-and-drop device placement from palette
- Device movement within and between racks
- Collision detection and prevention
- Starter device library with 23 common devices
- Custom device creation with category colors
- Edit panel for rack and device properties
- Dark and light theme support
- Keyboard shortcuts for all actions
- Save/load layouts as JSON files
- Export to PNG, JPEG, SVG, and PDF
- Session auto-save to browser storage
- Help panel with keyboard shortcuts reference
- Docker deployment configuration
- Comprehensive test suite (unit, component, E2E)
