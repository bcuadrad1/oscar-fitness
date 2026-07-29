## ADDED Requirements

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
The initial local repository SHALL contain exactly Bodyweight Squat and Push-Up as statically typed development exercises. Bodyweight Squat SHALL be lower body, strength, beginner, and bodyweight with no equipment; Push-Up SHALL be chest/upper body, strength, intermediate, and bodyweight with no equipment.

#### Scenario: Development catalog is listed
- **WHEN** the local repository returns its complete exercise list
- **THEN** it contains exactly Bodyweight Squat and Push-Up with the approved body areas, category, difficulties, and equipment values

### Requirement: Offline library assets and content
Each development exercise SHALL use a bundled local thumbnail with alternative text so catalog cards and textual exercise data do not require network access.

#### Scenario: Device is offline
- **WHEN** the local repository resolves while network access is unavailable
- **THEN** both exercise cards, bundled thumbnails, metadata, search, and filters remain usable

### Requirement: Exercise summary cards
The Exercises section SHALL display a browsable card for every matching exercise with a thumbnail, exercise name, target body area, category, difficulty level, and equipment.

#### Scenario: User opens the exercise library
- **WHEN** no search or restrictive filter is active
- **THEN** every local sample exercise is represented by a card containing all required summary fields

#### Scenario: Bundled thumbnail cannot render
- **WHEN** a bundled exercise thumbnail unexpectedly fails to render
- **THEN** the card retains its readable exercise information and an intentional visual fallback

### Requirement: Search by exercise name
The library SHALL let the user search exercise names using case-insensitive, trimmed text matching.

#### Scenario: Name contains the query
- **WHEN** the user enters text contained in an exercise name
- **THEN** matching exercise cards remain visible and nonmatching cards are excluded

#### Scenario: Search is cleared
- **WHEN** the user clears the search text
- **THEN** name search no longer excludes exercise cards

### Requirement: Body area and difficulty filters
The library SHALL provide independently selectable body-area and difficulty filters, including an all-values option for each dimension.

#### Scenario: Body area is selected
- **WHEN** the user selects a body-area value
- **THEN** only exercises assigned to that body area remain visible

#### Scenario: Difficulty is selected
- **WHEN** the user selects a difficulty value
- **THEN** only exercises assigned to that difficulty remain visible

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
