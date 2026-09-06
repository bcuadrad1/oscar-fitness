# Exercise Library Specification

## Purpose
Define the exercise catalog, discovery controls, repository states, and navigation behavior for the Exercises library.

## Requirements

### Requirement: Async repository-backed exercise catalog
The application SHALL access exercise data through an `ExerciseRepository` contract with `listExercises(): Promise<readonly Exercise[]>` and `getExerciseById(id: string): Promise<Exercise | null>`, and route consumers SHALL represent loading, success, and error states without requiring a backend, database, authentication, or membership state.

#### Scenario: Exercise list is pending
- **WHEN** the library route is waiting for `listExercises()` to settle
- **THEN** it displays an accessible repository loading state

#### Scenario: Local exercise list resolves
- **WHEN** the immediate local repository fulfills `listExercises()`
- **THEN** the library enters success state with its readonly typed exercise records

#### Scenario: Exercise list rejects
- **WHEN** `listExercises()` rejects
- **THEN** the library displays an accessible data error with a retry action instead of exercise or media error UI

#### Scenario: Repository implementation changes
- **WHEN** a future asynchronous API repository replaces the local repository at the Exercises composition boundary
- **THEN** route data-state and presentation component contracts remain unchanged

### Requirement: Exact stable-ID repository lookup
The local `ExerciseRepository` SHALL retain immediate asynchronous behavior, SHALL return the canonical record for an exact stable-ID lookup, and SHALL return `null` for an unknown or case-mismatched ID without changing its interface.

#### Scenario: Every canonical stable ID is requested
- **WHEN** each of the 216 manifest stable IDs is passed to `getExerciseById`
- **THEN** each promise resolves to the one catalog record with that exact ID

#### Scenario: Unknown stable ID is requested
- **WHEN** an ID outside the manifest or a case-mismatched canonical ID is passed to `getExerciseById`
- **THEN** the promise resolves to `null`

### Requirement: Approved local development catalog
The local repository SHALL contain exactly the 216 canonical exercises from `docs/exercise-canonical-manifest.json`. The final manifest ID set and catalog ID set SHALL be equal, every canonical ID and name SHALL occur exactly once, and no exercise outside the approved manifest SHALL be present. The current 21 records SHALL retain their stable IDs and authored content without duplication; Bodyweight Squat SHALL retain its existing classifications and media while adding only its manifest-approved progression to `goblet-squat`. Every manifest-owned classification and relationship field SHALL exactly match the corresponding manifest record, including declared array order and null/omitted relationship semantics.

#### Scenario: Complete local catalog is listed
- **WHEN** the local repository returns its complete exercise list
- **THEN** it contains exactly 216 records with ID and canonical-name sets equal to the manifest and no extra or duplicate record

#### Scenario: Missing set is derived before authoring
- **WHEN** the 21 shipped stable IDs are compared programmatically with the 216 manifest stable IDs
- **THEN** the difference contains exactly the 195 IDs documented in this change's design and all 195 are added exactly once

#### Scenario: Existing canonical records are reconciled
- **WHEN** the completed catalog is constructed
- **THEN** Bodyweight Squat and the 20 seeded chest records retain their IDs, copy, classifications, and media except that Bodyweight Squat now references its manifest progression `goblet-squat`

#### Scenario: Manifest classifications are compared
- **WHEN** each final catalog record is normalized and compared by stable ID with the manifest
- **THEN** name, primary body part, ordered secondary body parts, difficulty, ordered equipment, progression, and regression match exactly for all 216 records

#### Scenario: Static detail parameters are generated
- **WHEN** static web detail parameters are produced from the local repository
- **THEN** they contain each of the 216 canonical stable IDs exactly once and the dynamic route fallback remains available

### Requirement: Deterministic generated catalog source
The checked-in TypeScript modules containing the 195 newly generated exercise records SHALL be produced by a deterministic, idempotent authoring-time generator using only the repository's existing Node and toolchain capabilities. Every generated module SHALL begin with a clear generated-source header identifying the generator and prohibiting manual edits. With unchanged manifest and authored-content inputs, rerunning generation SHALL produce byte-for-byte identical output, and non-writing check mode SHALL fail when checked-in generated output is missing, extra, or stale.

#### Scenario: Generated module is inspected
- **WHEN** a checked-in generated catalog module is opened
- **THEN** its header clearly identifies it as generated source, names the generator, and states that it must not be manually edited

#### Scenario: Generation is repeated with unchanged inputs
- **WHEN** generation runs more than once with identical manifest and authored-content inputs
- **THEN** every generated output file is byte-for-byte identical across runs

#### Scenario: Checked-in output is current
- **WHEN** non-writing check mode renders expected output from unchanged inputs
- **THEN** it succeeds only when every checked-in generated file matches the expected bytes exactly

#### Scenario: Checked-in output is stale
- **WHEN** a generated file is changed, omitted, or no longer corresponds to the current inputs
- **THEN** non-writing check mode fails without silently rewriting the checked-in output

#### Scenario: Generator dependencies are inspected
- **WHEN** the authoring pipeline is reviewed
- **THEN** it introduces no npm, runtime, or code-generation dependency and uses only existing repository Node/toolchain capabilities

### Requirement: Offline library assets and content
Each development exercise SHALL use a bundled local thumbnail with alternative text so catalog cards and textual exercise data do not require network access.

#### Scenario: Device is offline
- **WHEN** the local repository resolves while network access is unavailable
- **THEN** both exercise cards, bundled thumbnails, metadata, search, and filters remain usable

### Requirement: Exercise summary cards
The Exercises section SHALL display a browsable card for every matching exercise with a thumbnail, exercise name, target body area, category, human-readable difficulty level, and every required equipment label resolved in declared order from the structured exercise record. A record whose sole equipment ID is `bodyweight` SHALL retain the exact `Bodyweight / no equipment` presentation, and the completed catalog SHALL remain renderable through the existing card contract for every approved equipment category.

#### Scenario: User opens the exercise library
- **WHEN** no search or restrictive filter is active
- **THEN** every one of the 216 local exercises is represented by a card containing all required summary fields and readable taxonomy labels

#### Scenario: Exercise requires multiple equipment items
- **WHEN** a matching exercise record declares more than one equipment ID
- **THEN** its card presents every required equipment label in declared order without changing navigation behavior

#### Scenario: Bodyweight-only card is displayed
- **WHEN** an exercise declares only `bodyweight`
- **THEN** its equipment metadata and accessibility copy use `Bodyweight / no equipment`

#### Scenario: Approved equipment categories are represented
- **WHEN** representative cards are rendered across all approved equipment IDs used by the manifest
- **THEN** each card resolves every equipment label, thumbnail alternative text, accessible action name, and stable-ID navigation target through existing presentation contracts

#### Scenario: Bundled thumbnail cannot render
- **WHEN** a bundled exercise thumbnail unexpectedly fails to render
- **THEN** the card retains its readable exercise information and an intentional visual fallback

### Requirement: Search by exercise name
The library SHALL let the user search exercise names using case-insensitive, trimmed text matching across the complete 216-record local catalog without searching descriptions, body parts, or equipment.

#### Scenario: Name contains the query
- **WHEN** the user enters text contained in an exercise name
- **THEN** matching exercise cards remain visible and nonmatching cards are excluded

#### Scenario: Representative body-part names are searched
- **WHEN** searches target representative chest, back, quadriceps, hamstrings, glutes, shoulders, biceps, triceps, forearms, core, calves, and full-body exercise names
- **THEN** the corresponding canonical records are discoverable by name

#### Scenario: Search is cleared
- **WHEN** the user clears the search text
- **THEN** name search no longer excludes exercise cards

### Requirement: Body area and difficulty filters
The library SHALL preserve its independently selectable body-area and difficulty filters, including an all-values option for each dimension. The existing body-area choices and exact-match behavior SHALL remain `All`, `Lower body`, and `Chest / upper body`; the change SHALL NOT add core, full-body, body-part, or equipment filter choices. Difficulty selection SHALL continue to use canonical `beginner`, `intermediate`, and `advanced` values with human-readable labels. Search, body-area, and difficulty predicates SHALL retain AND semantics and preserve catalog order.

#### Scenario: All body areas are selected
- **WHEN** no restrictive body-area or difficulty filter is active
- **THEN** all 216 canonical exercises are visible

#### Scenario: Lower body area is selected
- **WHEN** the user selects `Lower body` without another restriction
- **THEN** the 43 exercises assigned to the existing lower-body area remain visible, including Bodyweight Squat

#### Scenario: Chest and upper body area is selected
- **WHEN** the user selects `Chest / upper body` without another restriction
- **THEN** the 116 exercises assigned to the existing chest-and-upper-body area remain visible, including all 22 primary-chest exercises

#### Scenario: Core and full-body records use existing discovery
- **WHEN** a core or full-body exercise is sought
- **THEN** it remains available through `All` and name search without adding a body-area filter choice

#### Scenario: Beginner difficulty is selected
- **WHEN** the user selects Beginner without another restriction
- **THEN** exactly the manifest's 100 beginner exercises remain visible

#### Scenario: Intermediate difficulty is selected
- **WHEN** the user selects Intermediate without another restriction
- **THEN** exactly the manifest's 97 intermediate exercises remain visible

#### Scenario: Advanced difficulty is selected
- **WHEN** the user selects Advanced without another restriction
- **THEN** exactly the manifest's 19 advanced exercises remain visible

#### Scenario: Search and filters are combined
- **WHEN** search text, a body-area filter, and a difficulty filter are active together
- **THEN** only exercises satisfying every active condition remain visible in catalog order

### Requirement: Empty filtered results
The library SHALL display an accessible no-results state when no exercise satisfies the active search and filters.

#### Scenario: No record matches
- **WHEN** the active search and filter combination returns no exercises
- **THEN** the user sees a clear no-results message and a way to reset the search and filters

### Requirement: Session-persistent discovery state
The Exercises navigation session SHALL retain search text, selected body area, and selected difficulty while the user navigates from the library to an exercise detail and back.

#### Scenario: User returns from exercise detail
- **WHEN** the user activates a card and then navigates back to the library during the current Exercises navigation session
- **THEN** the prior search text, selected filters, and resulting exercise list are restored

#### Scenario: User resets discovery state
- **WHEN** the user activates the no-results reset action
- **THEN** the persisted search text and both persisted filters return to their default all-values state

### Requirement: Exercise detail navigation
Each exercise card SHALL navigate to a dynamic detail route identified by that exercise's stable ID.

#### Scenario: User selects an exercise card
- **WHEN** the user activates an exercise card
- **THEN** the application opens `/exercises/<exercise-id>` for that exercise within the Exercises navigation flow

### Requirement: Accessible responsive library presentation
The exercise library SHALL preserve the existing themes, responsive content width, system safe areas, and tab-bar clearance, and its interactive controls SHALL expose accessible names, roles, selected states, and usable touch targets.

#### Scenario: Library width changes
- **WHEN** the library is displayed on a narrow mobile viewport or wider web viewport
- **THEN** search, filters, thumbnails, cards, and metadata remain readable without horizontal page overflow

#### Scenario: Assistive technology inspects controls
- **WHEN** a screen reader focuses search, a filter option, reset action, or exercise card
- **THEN** the control communicates its purpose and current state without relying only on color
