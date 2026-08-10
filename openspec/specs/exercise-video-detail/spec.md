# Exercise Video Detail Specification

## Purpose
Define exercise detail resolution, instructional content, video playback states, and responsive navigation presentation.

## Requirements

### Requirement: Async dynamic exercise resolution
The exercise detail route SHALL resolve its stable route ID through `ExerciseRepository.getExerciseById`, represent loading, success, and error states, and handle a successful `null` result without crashing.

#### Scenario: Detail lookup is pending
- **WHEN** the detail route is waiting for `getExerciseById()` to settle
- **THEN** it displays an accessible repository loading state distinct from video loading

#### Scenario: Exercise ID exists
- **WHEN** `getExerciseById()` resolves with an exercise
- **THEN** the route displays the corresponding exercise detail

#### Scenario: Exercise ID does not exist
- **WHEN** `getExerciseById()` resolves with `null`
- **THEN** the route displays an exercise-not-found state with navigation back to the library

#### Scenario: Detail lookup rejects
- **WHEN** `getExerciseById()` rejects
- **THEN** the route displays an accessible data error with retry and back actions while no player is created

### Requirement: Complete exercise information
The detail screen SHALL continue to present the exercise name, target body area, category, human-readable difficulty, descriptive information, and ordered performance instructions from the typed exercise record. It SHALL resolve and present every required equipment label in declared order when the record contains one or multiple equipment IDs, and a sole `bodyweight` value SHALL retain the exact `Bodyweight / no equipment` presentation.

#### Scenario: User reviews an exercise
- **WHEN** a valid exercise detail is displayed
- **THEN** all existing required information, every required equipment label, and each instruction step are readable

#### Scenario: Exercise requires multiple equipment items
- **WHEN** a valid exercise detail declares more than one equipment ID
- **THEN** the equipment information includes every required item without affecting instructions or video behavior

#### Scenario: Development bodyweight detail is displayed
- **WHEN** Bodyweight Squat or Push-Up detail is displayed
- **THEN** its equipment information uses `Bodyweight / no equipment`

### Requirement: Approved development instruction content
Every local exercise record SHALL provide a concise description and ordered, controlled-movement instructions. Bodyweight Squat and Push-Up SHALL retain their existing approved copy. Each of the 19 added chest records SHALL use original Oscar Fitness copy that is not copied from external fitness websites and SHALL include clear setup, controlled execution, and finish/return guidance without medical claims or load prescriptions.

#### Scenario: Bodyweight Squat detail is displayed
- **WHEN** the Bodyweight Squat detail resolves
- **THEN** it describes a controlled lower-body sit-to-stand pattern and orders the user to set a shoulder-width stance, brace and sit down/back, track knees with toes while heels remain planted, and stand through the whole feet within a controlled pain-free range

#### Scenario: Push-Up detail is displayed
- **WHEN** the Push-Up detail resolves
- **THEN** it describes a bodyweight chest, shoulder, triceps, and trunk press and orders the user to set a straight high plank, brace the abdomen and glutes, lower with elbows near 45 degrees, and press up without hip sag within a controlled pain-free range

#### Scenario: Added chest detail is displayed
- **WHEN** any of the 19 added chest exercises resolves
- **THEN** its original concise description and every ordered instruction step are readable and specific to that movement's setup and controlled execution

### Requirement: Locked development video assignment
Bodyweight Squat and each of the 19 added chest records SHALL use video source `https://www.w3schools.com/html/mov_bbb.mp4`, and each source-backed video region SHALL visibly label it as non-exercise development media. Push-Up SHALL continue to declare no video source. All 19 added records SHALL reuse the bundled Push-Up image source as placeholder thumbnail media with meaningful exercise-specific alternative text, while Bodyweight Squat and Push-Up retain their current thumbnail metadata.

#### Scenario: Bodyweight Squat media is displayed
- **WHEN** the Bodyweight Squat detail enters repository success state
- **THEN** its video region uses the locked URL and displays the non-exercise development-media label

#### Scenario: Added chest media is displayed
- **WHEN** any of the 19 added chest details enters repository success state
- **THEN** its bundled placeholder thumbnail and alternative text are available offline and its video region uses the locked URL with the non-exercise development-media label

#### Scenario: Push-Up media is displayed
- **WHEN** the Push-Up detail enters repository success state
- **THEN** its source-less video region displays the unavailable-video state

### Requirement: User-controlled video playback
When an exercise has a video source, the detail screen SHALL provide inline cross-platform video playback with visible native controls and SHALL not start playback or audio without user action.

#### Scenario: Video is ready
- **WHEN** the configured video source becomes ready to play
- **THEN** the user can start, pause, seek, and use supported fullscreen controls

#### Scenario: Detail screen is left
- **WHEN** the video detail component unmounts
- **THEN** its player resources and active playback are released by the managed player lifecycle

### Requirement: Video loading state
The detail screen SHALL communicate that network video media is loading until the player is ready or its first frame is rendered, independently of repository loading.

#### Scenario: Player is preparing media
- **WHEN** the video player reports an idle or loading status before playback is ready
- **THEN** an accessible loading state is displayed in the video region without hiding the exercise information

### Requirement: Unavailable video state
The detail screen SHALL display a purposeful unavailable-video state when the exercise record has no video source.

#### Scenario: Exercise has no video
- **WHEN** a valid exercise record declares its video unavailable
- **THEN** the video region explains that a demonstration is not available while all textual exercise details remain usable

### Requirement: Recoverable playback error state
The detail screen SHALL handle a player-reported media error without crashing and SHALL offer the user a retry action.

#### Scenario: Player reports an error
- **WHEN** the configured source cannot load or playback fails
- **THEN** the video region displays an accessible error message and retry control while exercise information remains visible

#### Scenario: Device is offline
- **WHEN** Bodyweight Squat detail data is available but its network video cannot load because the device is offline
- **THEN** the bundled thumbnail and textual details remain usable and the video region enters playback-error state

#### Scenario: User retries playback
- **WHEN** the user activates retry after a playback error
- **THEN** the application creates a fresh playback attempt for the same source and returns to loading, ready, or error state

### Requirement: Detail navigation chrome
The exercise detail route SHALL keep the floating Exercises tab visible, use the native stack header for accessible back navigation, and display the large exercise title only as editorial content inside the page.

#### Scenario: User views exercise detail
- **WHEN** a valid exercise detail is displayed
- **THEN** the Exercises tab and native back action remain available and the native header does not duplicate the page's large exercise name

### Requirement: Accessible responsive detail presentation
The exercise detail SHALL preserve light and dark themes, responsive width and video aspect ratio, system safe areas, and floating-tab clearance on Android, iOS, and web.

#### Scenario: Detail viewport changes
- **WHEN** the detail screen is displayed on mobile or web
- **THEN** video, metadata, and instructions fit the viewport without horizontal page overflow or tab-bar obstruction

#### Scenario: Assistive technology inspects media states
- **WHEN** a screen reader encounters loading, unavailable, error, retry, instructions, or playback controls
- **THEN** each state or control has meaningful semantics and text independent of color or imagery
