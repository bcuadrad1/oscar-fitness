# Mobile Content Insets Specification

## Purpose
Define consistent safe-area and navigation clearance behavior for the app's primary mobile sections while preserving their visual identity.

## Requirements

### Requirement: Initial content respects system safe areas
Each primary section SHALL position its initial scroll content below the iOS status bar and Dynamic Island and within the applicable Android and iOS safe-area boundaries.

#### Scenario: Route opens in light appearance
- **WHEN** Home, Exercises, Routines, or Admin is opened in light appearance
- **THEN** its header begins below system status UI without overlap

#### Scenario: Route opens in dark appearance
- **WHEN** Home, Exercises, Routines, or Admin is opened in dark appearance
- **THEN** its header begins below system status UI without overlap

#### Scenario: Appearance changes while the app is open
- **WHEN** the device changes between light and dark appearance while a primary section is visible
- **THEN** that section continues to respect the same safe-area boundaries

### Requirement: Final card clears primary navigation
Every scrollable primary section SHALL reserve enough effective bottom inset for its final card to scroll completely above the floating native tab bar.

#### Scenario: User reaches the end of a section
- **WHEN** the user scrolls Home, Exercises, Routines, or Admin to its maximum offset
- **THEN** the complete final card is visible above the tab bar with trailing content space below it

#### Scenario: Native tab bar geometry differs by platform
- **WHEN** the native tab bar uses its Android or iOS platform height and safe-area geometry
- **THEN** end-of-content clearance is derived without allowing the tab bar to obscure the final card

### Requirement: Shared inset behavior
The four primary sections SHALL use one shared inset strategy so top and bottom clearance does not vary by route content or color scheme.

#### Scenario: User compares primary sections
- **WHEN** the user moves among Home, Exercises, Routines, and Admin on the same device
- **THEN** each section applies consistent top spacing and end-of-scroll clearance

### Requirement: Visual identity is preserved
The inset correction SHALL preserve the existing screen typography, colors, card presentation, copy, and navigation destinations.

#### Scenario: Corrected screen is displayed
- **WHEN** a primary section renders with corrected insets
- **THEN** only its safe-area and scroll-clearance behavior differs from the current MVP presentation
