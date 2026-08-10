## MODIFIED Requirements

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
