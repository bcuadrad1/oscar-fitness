## ADDED Requirements

### Requirement: Async repository-backed routine library
The Routines library SHALL replace the static placeholder preview with `RoutineRepository` data and SHALL represent loading, success, and error states, including repository storage initialization. A rejected list or initialization operation SHALL produce an accessible routine-data error with retry, while a successful operation SHALL render the returned ownership-aware routines without requiring a backend, account, login, or network request.

#### Scenario: Routine list is pending
- **WHEN** the library is waiting for the repository list operation to settle
- **THEN** it displays an accessible loading state instead of placeholder routine cards

#### Scenario: Routine list resolves
- **WHEN** the repository list operation succeeds
- **THEN** the library renders cards from the returned routine records

#### Scenario: Routine list rejects
- **WHEN** the repository list operation rejects
- **THEN** the library displays an accessible routine-data error with a retry action

### Requirement: Bundled defaults and persisted user copies
The first successful library load with empty user storage SHALL contain exactly the 24 immutable default routines from the approved catalog. A successful persisted default copy SHALL appear in subsequent library results as an additional user-owned routine without replacing, editing, hiding, or persisting its source default, and it SHALL remain present after the repository or application is reconstructed.

#### Scenario: Library opens before a copy
- **WHEN** no persisted user routine exists on the local device
- **THEN** exactly 24 default routine cards are available

#### Scenario: User copy is created
- **WHEN** a default copy succeeds and the library next consumes repository results
- **THEN** the new user routine card appears in addition to all 24 unchanged defaults

#### Scenario: Library reopens after a copy
- **WHEN** the repository or application is reconstructed after a user copy was persisted
- **THEN** the copied routine card reappears with the same identity and ownership alongside the 24 unchanged defaults

### Requirement: Focus and level filtering only
The library SHALL provide independently selectable focus and routine-level filters with an `All` choice for each dimension. Focus choices SHALL cover `All`, Chest, Back, Shoulders, Biceps, Triceps, Legs, Glutes, Core, and Full Body, and level choices SHALL cover `All`, Beginner, Intermediate, Advanced, and Experienced. Active restrictive focus and level predicates SHALL use exact-match AND semantics while preserving repository order. This change MUST NOT add routine search, sorting controls, pagination, goal filters, equipment filters, or other discovery dimensions.

#### Scenario: Both filters are All
- **WHEN** focus and level are both set to `All`
- **THEN** no routine is excluded by filtering and repository order is preserved

#### Scenario: Focus and level are combined
- **WHEN** the user selects a restrictive focus and a restrictive level
- **THEN** only routines matching both exact values remain visible in repository order

#### Scenario: One filter is All
- **WHEN** one filter is `All` and the other is restrictive
- **THEN** only the restrictive dimension excludes routines

### Requirement: Empty filtered routine results
The library SHALL display an accessible no-results state when no routine satisfies the active focus and level combination and SHALL provide a reset action that restores both filters to `All`.

#### Scenario: No routine matches
- **WHEN** the active focus and level combination produces no routines
- **THEN** the user sees a clear no-results message and an accessible reset action

#### Scenario: No-results filters are reset
- **WHEN** the user activates the no-results reset action
- **THEN** both filters return to `All` and all repository routines are eligible for display

### Requirement: Routine summary cards
Every matching routine SHALL be represented by a card showing its name, human-readable focus, human-readable routine level, exercise count, and a clear Default or User ownership indicator. A card SHALL show estimated duration when `estimatedDurationMinutes` is present and MUST NOT synthesize a duration when it is absent.

#### Scenario: Default routine card is displayed
- **WHEN** a matching default routine has an estimate
- **THEN** its card shows name, focus, level, exercise count, Default ownership, and estimated duration

#### Scenario: User routine without estimate is displayed
- **WHEN** a matching user routine omits an estimate
- **THEN** its card shows name, focus, level, exercise count, and User ownership without placeholder duration

### Requirement: Session-persistent routine filters
The current Routines navigation session SHALL retain selected focus and level filters while the user navigates from the library to a routine detail and back. An explicit reset action SHALL restore both filters to `All`, and a newly created Routines navigation session SHALL begin with both filters at `All`.

#### Scenario: User returns from routine detail
- **WHEN** the user opens a routine card and navigates back during the current Routines navigation session
- **THEN** the previous focus, level, and resulting filtered list are restored

#### Scenario: User explicitly resets filters
- **WHEN** the user activates the library reset action
- **THEN** the session's focus and level filters both become `All`

#### Scenario: New routine session begins
- **WHEN** a new Routines navigation session is created
- **THEN** neither focus nor level restricts the repository result

### Requirement: Stable routine card navigation
Each routine card SHALL expose one stable navigation action to `/routines/<routine-id>` using that card's exact repository ID, including stable IDs restored for persisted user copies.

#### Scenario: Default card is activated
- **WHEN** the user activates a default routine card
- **THEN** the application opens the nested detail route for that exact default routine ID

#### Scenario: User card is activated
- **WHEN** the user activates a persisted user routine card
- **THEN** the application opens the same nested route shape using that copy's exact stable ID

### Requirement: Accessible responsive routine library
The routine library SHALL preserve the application's existing typography, card treatment, light and dark themes, responsive content width, system safe areas, and floating-tab clearance. Cards SHALL use one column on narrow mobile viewports and two columns when the available width supports them without horizontal page overflow. Filters, reset actions, state controls, and cards SHALL expose accessible names, roles, selected states where applicable, and usable touch targets without relying only on color.

#### Scenario: Library viewport changes
- **WHEN** the library is displayed on a narrow mobile viewport or a wider viewport
- **THEN** controls and cards remain readable in one or two columns respectively without horizontal overflow or tab-bar obstruction

#### Scenario: Assistive technology inspects the library
- **WHEN** a screen reader focuses a filter choice, reset action, retry action, ownership indicator, or routine card
- **THEN** its purpose, value, state, and navigation target are communicated independently of color
