## Why

The shared MVP screen layout does not reliably keep Home content below the iOS status bar and Dynamic Island in dark mode, and its fixed bottom padding does not guarantee that every final card can clear the floating native tab bar. Correcting the shared inset contract now prevents route-specific layout drift while preserving the approved visual identity.

## What Changes

- Correct top safe-area handling so Home, Exercises, Routines, and Admin begin below iOS system UI in both light and dark color schemes.
- Standardize safe-area behavior across all four routes through the shared scrollable screen layout.
- Provide sufficient bottom scroll content inset for each route's final card to move completely above the floating native tab bar.
- Verify top and bottom inset behavior on Android and iOS in both color schemes.
- Preserve all current typography, colors, cards, content, routes, and navigation behavior; add no new functionality.

## Capabilities

### New Capabilities
- `mobile-content-insets`: Safe-area and scroll-clearance behavior for the four scrollable primary sections around system UI and the floating native tab bar.

### Modified Capabilities

None.

## Impact

- Primarily affects the shared `SectionScreen` scroll container and its coordination with native tab inset handling.
- May replace fixed platform tab estimates with layout-aware or explicitly reserved clearance, but introduces no new dependencies or data models.
- Requires Android and iOS visual smoke checks for all routes in light and dark appearance.
- Does not change screen content, visual styling, route structure, static fixtures, or administrative behavior.
