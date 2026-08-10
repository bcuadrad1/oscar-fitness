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

### Requirement: Approved local development catalog
The local repository SHALL contain exactly 21 statically typed exercises in this order: unchanged Bodyweight Squat followed by the 20 approved chest-batch records in canonical manifest order. The chest records SHALL use `Chest / upper body`, category `Strength`, primary body part `chest`, and the exact classifications and optional relationships below. Push-Up SHALL retain stable ID `push-up` rather than being duplicated. A dash denotes an omitted relationship field.

| ID | Name | Secondary body parts | Difficulty | Equipment, declared order | Progression | Regression |
| --- | --- | --- | --- | --- | --- | --- |
| `push-up` | Push-Up | `triceps`, `shoulders`, `core` | `beginner` | `bodyweight` | - | `incline-push-up` |
| `bent-knee-push-up` | Bent-Knee Push-Up | `triceps`, `shoulders`, `core` | `beginner` | `bodyweight` | `push-up` | - |
| `incline-push-up` | Incline Push-Up | `triceps`, `shoulders`, `core` | `beginner` | `bodyweight`, `bench` | `push-up` | - |
| `decline-push-up` | Decline Push-Up | `triceps`, `shoulders`, `core` | `intermediate` | `bodyweight`, `bench` | `weighted-push-up` | `push-up` |
| `weighted-push-up` | Weighted Push-Up | `triceps`, `shoulders`, `core` | `advanced` | `bodyweight`, `weight-plate` | - | `push-up` |
| `barbell-bench-press` | Barbell Bench Press | `triceps`, `shoulders` | `beginner` | `barbell`, `bench` | - | - |
| `dumbbell-bench-press` | Dumbbell Bench Press | `triceps`, `shoulders` | `intermediate` | `dumbbell`, `bench` | - | - |
| `machine-chest-press` | Machine Chest Press | `triceps`, `shoulders` | `beginner` | `machine` | - | - |
| `smith-machine-bench-press` | Smith Machine Bench Press | `triceps`, `shoulders` | `beginner` | `smith-machine`, `bench` | - | - |
| `incline-dumbbell-press` | Incline Dumbbell Press | `shoulders`, `triceps` | `beginner` | `dumbbell`, `bench` | - | - |
| `incline-barbell-bench-press` | Incline Barbell Bench Press | `shoulders`, `triceps` | `intermediate` | `barbell`, `bench` | - | - |
| `incline-machine-chest-press` | Incline Machine Chest Press | `shoulders`, `triceps` | `beginner` | `machine` | - | - |
| `dumbbell-chest-fly` | Dumbbell Chest Fly | `shoulders` | `intermediate` | `dumbbell`, `bench` | - | - |
| `cable-chest-fly` | Cable Chest Fly | `shoulders` | `intermediate` | `cable` | - | - |
| `pec-deck-machine-fly` | Pec Deck / Machine Fly | `shoulders` | `beginner` | `machine` | - | - |
| `cable-crossover` | Cable Crossover | `shoulders` | `intermediate` | `cable` | - | - |
| `chest-dip` | Chest Dip | `triceps`, `shoulders` | `intermediate` | `bodyweight`, `pull-up-dip-station` | - | - |
| `dumbbell-pullover` | Dumbbell Pullover | `back` | `intermediate` | `dumbbell`, `bench` | - | - |
| `decline-barbell-bench-press` | Decline Barbell Bench Press | `triceps`, `shoulders` | `intermediate` | `barbell`, `bench` | - | - |
| `decline-dumbbell-bench-press` | Decline Dumbbell Bench Press | `triceps`, `shoulders` | `intermediate` | `dumbbell`, `bench` | - | - |

No other progression or regression relationship SHALL be populated in this batch. Bodyweight Squat SHALL retain its existing stable ID, classifications, content, media, and omitted relationships. The manifest's unselected records SHALL NOT be added by this change.

#### Scenario: Complete local catalog is listed
- **WHEN** the local repository returns its complete exercise list
- **THEN** it contains exactly 21 unique IDs and names with Bodyweight Squat first and the 20 chest records following in the specified order

#### Scenario: Existing Push-Up is reconciled
- **WHEN** the canonical chest batch is loaded
- **THEN** exactly one record has ID `push-up` and name Push-Up, retains its approved existing content, and references only `incline-push-up` as its regression

#### Scenario: Approved relationships are validated
- **WHEN** the complete local catalog is constructed
- **THEN** every populated progression/regression target resolves within the catalog, no record self-references, and only the six specified relationship fields are populated

#### Scenario: Catalog batch boundary is inspected
- **WHEN** the chest batch is compared with the 216-record manifest
- **THEN** no unselected manifest record is added by this change, preserved Bodyweight Squat remains the only non-chest record, and no selected exercise is duplicated under another body part

#### Scenario: Static detail parameters are generated
- **WHEN** static web detail parameters are produced from the local repository
- **THEN** they contain each of the 21 stable IDs exactly once

### Requirement: Offline library assets and content
Each development exercise SHALL use a bundled local thumbnail with alternative text so catalog cards and textual exercise data do not require network access.

#### Scenario: Device is offline
- **WHEN** the local repository resolves while network access is unavailable
- **THEN** both exercise cards, bundled thumbnails, metadata, search, and filters remain usable

### Requirement: Exercise summary cards
The Exercises section SHALL display a browsable card for every matching exercise with a thumbnail, exercise name, target body area, category, human-readable difficulty level, and every required equipment label resolved in declared order from the structured exercise record. A fixture whose sole equipment ID is `bodyweight` SHALL retain the exact `Bodyweight / no equipment` presentation.

#### Scenario: User opens the exercise library
- **WHEN** no search or restrictive filter is active
- **THEN** every local sample exercise is represented by a card containing all required summary fields and readable taxonomy labels

#### Scenario: Exercise requires multiple equipment items
- **WHEN** a matching exercise record declares more than one equipment ID
- **THEN** its card presents every required equipment label without changing navigation behavior

#### Scenario: Development bodyweight card is displayed
- **WHEN** Bodyweight Squat or Push-Up is represented by a library card
- **THEN** its equipment metadata and accessibility copy use `Bodyweight / no equipment`

#### Scenario: Bundled thumbnail cannot render
- **WHEN** a bundled exercise thumbnail unexpectedly fails to render
- **THEN** the card retains its readable exercise information and an intentional visual fallback

### Requirement: Search by exercise name
The library SHALL let the user search exercise names using case-insensitive, trimmed text matching across the complete local catalog.

#### Scenario: Name contains the query
- **WHEN** the user enters text contained in an exercise name
- **THEN** matching exercise cards remain visible and nonmatching cards are excluded

#### Scenario: Representative chest names are searched
- **WHEN** the user searches representative terms such as `push-up`, `bench press`, `chest fly`, `crossover`, `dip`, or `pullover`
- **THEN** the corresponding canonical chest records are discoverable without searching descriptions, body parts, or equipment

#### Scenario: Search is cleared
- **WHEN** the user clears the search text
- **THEN** name search no longer excludes exercise cards

### Requirement: Body area and difficulty filters
The library SHALL preserve its independently selectable body-area and difficulty filters, including an all-values option for each dimension. Difficulty selection SHALL continue to use canonical `beginner`, `intermediate`, and `advanced` values with human-readable labels, and this change SHALL NOT add body-part or equipment filter dimensions.

#### Scenario: All body areas are selected
- **WHEN** no restrictive body-area or difficulty filter is active
- **THEN** all 21 local exercises are visible

#### Scenario: Body area is selected
- **WHEN** the user selects a body-area value
- **THEN** only exercises assigned to that existing body area remain visible

#### Scenario: Chest body area is selected
- **WHEN** the user selects `Chest / upper body`
- **THEN** exactly the 20 approved chest-batch exercises remain visible

#### Scenario: Lower body area is selected
- **WHEN** the user selects `Lower body`
- **THEN** only Bodyweight Squat remains visible

#### Scenario: Difficulty is selected
- **WHEN** the user selects Beginner, Intermediate, or Advanced
- **THEN** only exercises assigned to the corresponding canonical difficulty remain visible

#### Scenario: Beginner difficulty is selected
- **WHEN** the user selects Beginner without a restrictive body-area filter
- **THEN** the 9 beginner chest records and Bodyweight Squat remain visible

#### Scenario: Intermediate difficulty is selected
- **WHEN** the user selects Intermediate without a restrictive body-area filter
- **THEN** exactly the 10 intermediate chest records remain visible

#### Scenario: Advanced difficulty is selected
- **WHEN** the user selects Advanced without a restrictive body-area filter
- **THEN** only Weighted Push-Up remains visible

#### Scenario: Search and filters are combined
- **WHEN** search text, a body-area filter, and a difficulty filter are active together
- **THEN** only exercises satisfying every active condition remain visible

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
