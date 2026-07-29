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
The detail screen SHALL present the exercise name, target body area, category, difficulty, equipment, descriptive information, and ordered performance instructions from the typed exercise record.

#### Scenario: User reviews an exercise
- **WHEN** a valid exercise detail is displayed
- **THEN** all required information and each instruction step are readable

### Requirement: Approved development instruction content
The two development records SHALL provide concise descriptions and ordered, controlled-movement instructions, including direction to reduce range or stop if form breaks or pain occurs.

#### Scenario: Bodyweight Squat detail is displayed
- **WHEN** the Bodyweight Squat detail resolves
- **THEN** it describes a controlled lower-body sit-to-stand pattern and orders the user to set a shoulder-width stance, brace and sit down/back, track knees with toes while heels remain planted, and stand through the whole feet within a controlled pain-free range

#### Scenario: Push-Up detail is displayed
- **WHEN** the Push-Up detail resolves
- **THEN** it describes a bodyweight chest, shoulder, triceps, and trunk press and orders the user to set a straight high plank, brace the abdomen and glutes, lower with elbows near 45 degrees, and press up without hip sag within a controlled pain-free range

### Requirement: Locked development video assignment
Bodyweight Squat SHALL be the only development exercise with video source `https://www.w3schools.com/html/mov_bbb.mp4`, and the video region SHALL visibly label it as non-exercise development media. Push-Up SHALL declare no video source.

#### Scenario: Bodyweight Squat media is displayed
- **WHEN** the Bodyweight Squat detail enters repository success state
- **THEN** its video region uses the locked URL and displays the non-exercise development-media label

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
