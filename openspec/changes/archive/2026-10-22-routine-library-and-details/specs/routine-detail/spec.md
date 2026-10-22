## ADDED Requirements

### Requirement: Nested async routine detail resolution
Routine details SHALL use the stable nested route `/routines/<routine-id>` and SHALL resolve the exact route ID asynchronously through `RoutineRepository`. The route SHALL represent loading, error, not-found, and success states; a fulfilled `null` lookup SHALL be treated as not found rather than as an error or crash.

#### Scenario: Routine lookup is pending
- **WHEN** the detail route is waiting for the repository lookup to settle
- **THEN** it displays an accessible routine loading state

#### Scenario: Exact routine ID exists
- **WHEN** an exact default or persisted user routine ID resolves
- **THEN** the route enters success state for that routine

#### Scenario: Routine ID does not exist
- **WHEN** the repository lookup fulfills with `null`
- **THEN** the route displays a routine-not-found state with navigation back to the library

#### Scenario: Routine lookup rejects
- **WHEN** the repository lookup rejects
- **THEN** the route displays an accessible routine-data error with retry and back actions

### Requirement: Canonical exercise resolution without duplication
After a routine resolves, the detail experience SHALL independently resolve every ordered entry's canonical `exerciseId` through `ExerciseRepository` and SHALL project exercise-owned display metadata from those repository results. Routine fixtures and detail presentation MUST NOT maintain duplicated exercise names, classifications, equipment, instructions, thumbnails, or videos. Exercise projection SHALL have loading, error, missing-reference, and success states with retry behavior independent from routine lookup.

#### Scenario: Routine entries resolve successfully
- **WHEN** every ordered exercise reference resolves through `ExerciseRepository`
- **THEN** the detail displays each canonical exercise name with its routine-owned prescription data

#### Scenario: Exercise resolution rejects or returns null
- **WHEN** an exercise lookup rejects or unexpectedly returns `null`
- **THEN** the resolved routine remains available while the detail displays an accessible exercise-data error with a targeted retry without fabricating metadata or refetching the routine

### Requirement: Ordered prescription rows
The successful detail screen SHALL render one row per routine entry in contiguous 1-based order. Every row SHALL show the canonical exercise name, sets, either repetitions or duration according to the prescription discriminator, optional rest when authored, and optional entry notes when authored.

#### Scenario: Repetition entry is displayed
- **WHEN** an ordered entry uses the `reps` prescription
- **THEN** its row shows sets and repetitions and does not show a duration value

#### Scenario: Timed entry is displayed
- **WHEN** an ordered entry uses the `timed` prescription
- **THEN** its row shows sets and a human-readable duration in seconds and does not show repetitions

#### Scenario: Optional rest or notes are omitted
- **WHEN** an entry has no rest or notes
- **THEN** its row remains complete without invented rest, note, or placeholder copy

#### Scenario: Authored rest and notes are present
- **WHEN** an entry contains rest seconds or non-empty notes
- **THEN** the row presents each authored value with a clear label

### Requirement: Stable exercise navigation from routine rows
Every resolved routine exercise row SHALL provide an accessible navigation action to the existing stable route `/exercises/<exercise-id>` using that entry's exact canonical exercise ID.

#### Scenario: Exercise row is activated
- **WHEN** the user activates a resolved exercise row
- **THEN** the application opens the existing exercise detail route for that exact exercise ID

### Requirement: Default copy action and user-copy destination
A default routine detail SHALL provide an accessible copy action backed by the asynchronous persistence-atomic repository copy operation and MUST NOT expose direct editing of the immutable default. While validating and persisting the copy, the action SHALL communicate progress and prevent duplicate activation. Only after persistence succeeds SHALL the application navigate to `/routines/<new-user-routine-id>` for the returned user copy, which SHALL identify itself as user-owned and SHALL provide no editing UI in this change. A user-owned routine detail SHALL not offer the default-copy action, and a validation or persistence failure MUST NOT invalidate the resolved source detail or navigate to an uncommitted copy.

#### Scenario: Default copy succeeds
- **WHEN** the user activates copy on a default and the repository returns a user routine
- **THEN** the application navigates to that copy's stable detail route and the source default remains unchanged

#### Scenario: Copy operation is pending
- **WHEN** a default copy request has not settled
- **THEN** the copy action communicates its busy state and does not issue a second concurrent copy request

#### Scenario: Copy fails
- **WHEN** the copy operation rejects because validation, ID generation, or local persistence fails
- **THEN** the source detail remains displayed with an accessible copy error and retry opportunity

#### Scenario: User copy detail is displayed
- **WHEN** the detail route resolves a user-owned copy
- **THEN** it communicates User ownership without a copy action or routine editing controls

### Requirement: Native routine navigation and accessible presentation
The routine detail route SHALL keep the floating Routines tab visible, use the native stack header for accessible back navigation, preserve light and dark themes, respect Android and iOS safe areas, reserve floating-tab clearance, and fit responsive content without horizontal overflow. Loading, error, not-found, copy, ownership, row, and navigation controls SHALL expose meaningful accessibility semantics and usable touch targets independent of color.

#### Scenario: User views routine detail
- **WHEN** a routine detail state is displayed on Android, iOS, or web
- **THEN** native back navigation, the Routines tab, themed content, safe-area clearance, and responsive layout remain available

#### Scenario: Assistive technology inspects routine detail
- **WHEN** a screen reader encounters detail states, prescription rows, copy controls, or exercise links
- **THEN** each item communicates its purpose and state without relying only on visual styling

### Requirement: Default static pages and runtime-only user routes
Static routine detail parameters SHALL contain each of the exact 24 seeded default routine IDs once and only once, and isolated static export SHALL produce one concrete detail page for every default. No user-owned ID SHALL be statically generated. The dynamic route SHALL remain available for native and client-side navigation inside the running application, including navigation to validated device-local user copies and runtime unknown-ID handling. Because web output is static, direct or reloaded navigation to an arbitrary persisted-user ID is explicitly not guaranteed on a normal static host, and the application MUST NOT claim to render its in-app not-found state when a static host rejects an arbitrary unknown URL before React loads. This change MUST NOT add SSR, backend routing, or a hosting-specific rewrite dependency.

#### Scenario: Static parameters are generated
- **WHEN** static web routine detail parameters are produced from the local default catalog
- **THEN** the result contains exactly the 24 approved default IDs with no duplicate or user ID and static export contains a concrete page for each one

#### Scenario: User copy route is opened at runtime
- **WHEN** native navigation or client-side navigation in the running application targets a persisted user routine ID absent from static parameters
- **THEN** the dynamic route resolves the user detail through `RoutineRepository`

#### Scenario: Unknown runtime route is opened
- **WHEN** navigation inside the running application reaches an ID absent from the repository
- **THEN** the route uses the routine-not-found state

#### Scenario: Arbitrary URL is directly loaded from static hosting
- **WHEN** a browser directly loads or reloads an arbitrary persisted-user or unknown routine URL on a static host that has no matching generated file
- **THEN** host-level handling is outside the application contract and the app does not claim that React can render the user detail or in-app not-found state before the host serves the application
