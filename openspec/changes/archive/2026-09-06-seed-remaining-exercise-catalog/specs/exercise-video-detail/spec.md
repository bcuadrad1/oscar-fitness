## MODIFIED Requirements

### Requirement: Async dynamic exercise resolution
The exercise detail route SHALL resolve its stable route ID through `ExerciseRepository.getExerciseById`, represent loading, success, and error states, and handle a successful `null` result without crashing. Completing the catalog SHALL NOT change the route shape, repository interface, retry behavior, or not-found contract.

#### Scenario: Detail lookup is pending
- **WHEN** the detail route is waiting for `getExerciseById()` to settle
- **THEN** it displays an accessible repository loading state distinct from video loading

#### Scenario: Canonical exercise ID exists
- **WHEN** any of the 216 exact canonical stable IDs is resolved
- **THEN** the route displays the corresponding exercise detail

#### Scenario: Exercise ID does not exist
- **WHEN** `getExerciseById()` resolves with `null`
- **THEN** the route displays an exercise-not-found state with navigation back to the library

#### Scenario: Detail lookup rejects
- **WHEN** `getExerciseById()` rejects
- **THEN** the route displays an accessible data error with retry and back actions while no player is created

### Requirement: Complete exercise information
The detail screen SHALL continue to present the exercise name, target body area, category, human-readable difficulty, original descriptive information, and ordered performance instructions from the typed exercise record. It SHALL resolve and present every required equipment label in declared order when the record contains one or multiple equipment IDs, and a sole `bodyweight` value SHALL retain the exact `Bodyweight / no equipment` presentation across the completed catalog.

#### Scenario: User reviews an exercise
- **WHEN** any valid canonical exercise detail is displayed
- **THEN** all required information, every required equipment label, and each instruction step are readable

#### Scenario: Exercise requires multiple equipment items
- **WHEN** a valid exercise detail declares more than one equipment ID
- **THEN** the equipment information includes every required item in declared order without affecting instructions or video behavior

#### Scenario: Bodyweight-only detail is displayed
- **WHEN** a valid exercise detail declares only `bodyweight`
- **THEN** its equipment information uses `Bodyweight / no equipment`

#### Scenario: Equipment categories are represented in details
- **WHEN** representative details across every equipment ID used by the manifest are displayed
- **THEN** metadata, ordered instructions, thumbnail semantics, video labeling, and navigation remain readable and accessible through existing contracts

### Requirement: Approved development instruction content
Every local exercise record SHALL provide a concise original Oscar Fitness description and ordered, controlled-movement instructions. Bodyweight Squat, Push-Up, and the 19 previously added chest records SHALL retain their approved copy. Each of the 195 newly added stable IDs SHALL have one explicit authored-content entry with a non-empty description and non-empty ordered instruction list that provides movement-specific setup, controlled execution, and finish/return guidance without medical claims or load prescriptions and without copying or closely paraphrasing external fitness websites. Generation SHALL fail for missing keys, extra keys, empty descriptions, or empty instruction lists and SHALL NOT synthesize generic fallback or template content. Similar exercises MAY share appropriate terminology, but each instruction sequence SHALL remain specific to its movement.

#### Scenario: Existing approved detail is displayed
- **WHEN** Bodyweight Squat, Push-Up, or one of the 19 seeded chest exercise details resolves
- **THEN** its existing approved description and ordered instructions remain unchanged and readable

#### Scenario: Newly added detail is displayed
- **WHEN** any of the 195 newly added exercise details resolves
- **THEN** its concise original description and ordered exercise-specific instruction steps are readable

#### Scenario: Authored content set is verified
- **WHEN** generated catalog data is checked before completion
- **THEN** every one of the 195 missing stable IDs has exactly one explicit non-empty description and one explicit non-empty ordered instruction sequence with no extra content key

#### Scenario: Authored content is incomplete or mis-keyed
- **WHEN** an authored-content key is missing or extra, a description is empty, or an instruction list is empty
- **THEN** generation fails before emitting accepted catalog output

#### Scenario: Authored content is absent
- **WHEN** a missing stable ID has no explicit authored description or instruction list
- **THEN** generation fails without synthesizing generic fallback or template prose

#### Scenario: Similar exercises use shared terminology
- **WHEN** related movements appropriately use common setup or execution terms
- **THEN** each exercise still has an explicit movement-specific instruction sequence

### Requirement: Locked development video assignment
Bodyweight Squat, the 19 previously added chest records, and all 195 newly added records SHALL use video source `https://www.w3schools.com/html/mov_bbb.mp4`, and each source-backed video region SHALL visibly retain `Development playback sample - non-exercise media`. Push-Up SHALL continue to declare no video source. Every newly added record SHALL reuse the bundled Push-Up image source as placeholder thumbnail media with meaningful exercise-specific alternative text and SHALL use an exercise-specific video accessibility label. Bodyweight Squat, Push-Up, and the seeded chest records SHALL retain their current thumbnail and video metadata.

#### Scenario: Existing media fixture is displayed
- **WHEN** Bodyweight Squat, Push-Up, or a seeded chest detail enters repository success state
- **THEN** its existing thumbnail, alternative text, video assignment, and accessibility behavior remain unchanged

#### Scenario: Newly added media is displayed
- **WHEN** any of the 195 newly added details enters repository success state
- **THEN** its bundled placeholder thumbnail is available offline and its video region uses the locked URL, exact visible non-exercise label, and exercise-specific accessibility text

#### Scenario: Push-Up media is displayed
- **WHEN** Push-Up detail enters repository success state
- **THEN** its source-less video region displays the existing unavailable-video state

#### Scenario: Completed media assignments are counted
- **WHEN** the final 216-record catalog media fields are inspected
- **THEN** Push-Up is the sole null-video record, all other records use the locked development URL, and no newly added record claims exercise-specific image or video media
