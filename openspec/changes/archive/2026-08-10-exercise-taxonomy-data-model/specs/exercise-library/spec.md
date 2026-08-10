## MODIFIED Requirements

### Requirement: Approved local development catalog
The local repository SHALL continue to contain exactly Bodyweight Squat and Push-Up as statically typed development exercises. Bodyweight Squat SHALL retain lower body and strength classifications, use canonical `beginner` difficulty, primary `quadriceps`, secondary `glutes`, `hamstrings`, and `core`, and equipment `bodyweight`. Push-Up SHALL retain chest/upper body and strength classifications, use canonical `beginner` difficulty, primary `chest`, secondary `triceps`, `shoulders`, and `core`, and equipment `bodyweight`. Both records SHALL omit progression and regression relationships because the two movements are not related variations.

#### Scenario: Development catalog is listed
- **WHEN** the local repository returns its complete exercise list
- **THEN** it contains exactly Bodyweight Squat and Push-Up with the approved stable IDs, structured classifications, and no progression or regression links

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

### Requirement: Body area and difficulty filters
The library SHALL preserve its independently selectable body-area and difficulty filters, including an all-values option for each dimension. Difficulty selection SHALL use the canonical `beginner`, `intermediate`, and `advanced` values while presenting human-readable labels, and this change SHALL NOT add body-part or equipment filter dimensions.

#### Scenario: Body area is selected
- **WHEN** the user selects a body-area value
- **THEN** only exercises assigned to that existing body area remain visible

#### Scenario: Difficulty is selected
- **WHEN** the user selects Beginner, Intermediate, or Advanced
- **THEN** only exercises assigned to the corresponding canonical difficulty remain visible

#### Scenario: Advanced has no development fixture
- **WHEN** the user selects Advanced while neither development record has advanced difficulty
- **THEN** the existing accessible no-results and reset behavior is used

#### Scenario: Search and filters are combined
- **WHEN** search text, a body-area filter, and a difficulty filter are active together
- **THEN** only exercises satisfying every active condition remain visible
