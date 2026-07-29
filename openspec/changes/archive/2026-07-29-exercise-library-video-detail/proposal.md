## Why

The Exercises tab currently communicates future intent but does not let users discover movements or learn how to perform one. A small, realistic local library with resilient video detail establishes the first useful fitness workflow while introducing an asynchronous repository and route-state contract that a later API can implement without redesigning the interface.

## What Changes

- Replace the static Exercises placeholder list with responsive, accessible exercise cards showing a thumbnail, name, target body area, category, difficulty, and equipment.
- Add exercise-name search, body-area filtering, difficulty filtering, combined-filter behavior, a clear no-results state, and session persistence when visiting details and returning.
- Introduce an asynchronous `ExerciseRepository` contract whose list and stable-ID lookup methods return promises, plus loading, success, and error route states with retry behavior.
- Provide exactly two typed local development records: a beginner Bodyweight Squat for lower body and an intermediate Push-Up for chest/upper body, both requiring no equipment.
- Use bundled local thumbnails so the library and textual exercise content remain usable without network access.
- Add an Exercises stack with a dynamic detail route while keeping the floating Exercises tab visible; use the native detail header for back navigation and retain the large editorial exercise title only inside the page.
- Add a responsive exercise-detail presentation with video playback, exercise information, equipment, difficulty, and ordered instructions.
- Assign the locked W3Schools Bunny progressive MP4 to only Bodyweight Squat, visibly label it as non-exercise development media, and leave Push-Up without video.
- Represent video loading, unavailable-video, offline/playback-error, and retry states with accessible status and recovery UI while documenting that playback requires network access.
- Add the Expo SDK 57 `expo-video` dependency; do not enable background playback, picture-in-picture configuration, uploads, or media persistence.
- Preserve the existing visual identity, light/dark themes, responsive width constraints, mobile safe areas, and floating-tab content clearance.

## Capabilities

### New Capabilities
- `exercise-library`: Async repository-backed browsing, route data states, session-persistent searching and filtering, empty results, typed exercise summaries, offline thumbnails, and detail navigation.
- `exercise-video-detail`: Async detail resolution, responsive network video playback, instructional content, visible tab/back behavior, unavailable and error handling, retry, and accessible cross-platform presentation.

### Modified Capabilities

None.

## Impact

- Reorganizes the current Exercises route into a nested Expo Router stack with an index and `[exerciseId]` detail route.
- Replaces the exercise preview fixtures with a richer domain model, an async repository interface, an immediately resolving local implementation, and route-level data states while leaving Home, Routines, and Admin data intact.
- Adds exercise-specific card, filter, detail, and video-state components that consume typed props rather than importing the data source directly.
- Adds two bundled thumbnail assets and session-scoped Exercises state shared by the nested index and detail routes.
- Adds `expo-video`; no backend, authentication, membership, upload, routine execution, favorites, tracking, or analytics dependencies are introduced.
- Requires Android, iOS, and web verification for search, filters, routing, media states, accessibility, responsive layout, themes, and existing inset behavior.
