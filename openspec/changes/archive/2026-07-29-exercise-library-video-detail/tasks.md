## 1. Media And Data Foundation

- [x] 1.1 Install the Expo SDK 57-compatible `expo-video` package with Expo's installer and leave optional background/PiP configuration disabled.
- [x] 1.2 Define the typed `Exercise` model, filter values, bundled-thumbnail metadata, optional video metadata, and shared loading/success/error data-state shape in an exercise-focused module.
- [x] 1.3 Define `ExerciseRepository` with `listExercises(): Promise<readonly Exercise[]>` and `getExerciseById(id: string): Promise<Exercise | null>`.
- [x] 1.4 Add the immediately resolving local repository with exactly the approved Bodyweight Squat and Push-Up classifications, descriptions, ordered safety-conscious instructions, equipment values, and stable IDs.
- [x] 1.5 Add bundled Bodyweight Squat and Push-Up thumbnail assets with alternative text and verify they require no network access.
- [x] 1.6 Assign only Bodyweight Squat the locked W3Schools Bunny URL and explicit non-exercise development-media label; assign Push-Up no video source.
- [x] 1.7 Add pure case-insensitive search/body-area/difficulty filtering without coupling presentation components to the local repository.
- [x] 1.8 Remove the superseded exercise preview type and records from the general MVP content module without changing Home, Routines, or Admin content.

## 2. Exercise Navigation

- [x] 2.1 Convert the Exercises root file into an `exercises` route directory with a nested Expo Router Stack while preserving the existing native and web tab destinations and visible floating tab on detail.
- [x] 2.2 Add an Exercises stack provider that supplies the repository and owns search text, body-area filter, and difficulty filter for the current navigation session.
- [x] 2.3 Add the dynamic `[exerciseId]` route and resolve its parameter asynchronously through `getExerciseById`.
- [x] 2.4 Configure a hidden index header and themed detail native header that provides accessible back navigation without repeating the in-page editorial exercise title or duplicating inset constants.
- [x] 2.5 Add distinct detail repository loading, rejection-with-retry, and successful-null not-found presentations without creating a player before an exercise resolves.

## 3. Browsable Exercise Library

- [x] 3.1 Build an accessible exercise card with responsive bundled thumbnail/fallback, full required summary metadata, existing premium card styling, and one clear activation action.
- [x] 3.2 Build controlled search and wrapping body-area/difficulty filter controls with labels, all-values options, selected-state semantics, and touch-friendly targets.
- [x] 3.3 Load the library through `listExercises` and render distinct repository loading, success, and rejection-with-retry states.
- [x] 3.4 Implement combined search/filter behavior from session-provider state and a responsive one-column/mobile and wider-layout card collection on the Exercises index route.
- [x] 3.5 Add an accessible no-results state that resets persisted query and filters, and route every matching card to its stable dynamic detail URL.
- [x] 3.6 Preserve query, selected filters, and filtered results after opening a detail and returning during the current Exercises navigation session.
- [x] 3.7 Preserve keyboard usability, light/dark theme behavior, maximum content width, top safe area, and final-card floating-tab clearance in every library data state.

## 4. Exercise Detail And Video

- [x] 4.1 Build typed detail presentation for the approved name, target body area, category, difficulty, no-equipment/bodyweight value, description, and ordered instructions.
- [x] 4.2 Build a source-backed `expo-video` player with the locked URL, visible non-exercise label, user-initiated native controls, responsive 16:9 sizing, supported fullscreen controls, managed cleanup, and first-frame/status-driven loading UI.
- [x] 4.3 Add the deterministic Push-Up unavailable-video presentation without creating a player when its source is absent.
- [x] 4.4 Add player-status and offline error presentation plus retry-by-fresh-player behavior while keeping bundled imagery and textual exercise content visible.
- [x] 4.5 Integrate detail content and media states into the dynamic route with themed, responsive, accessible safe-area and floating-tab clearance.

## 5. Verification

- [x] 5.1 Run TypeScript checking and Expo lint, fixing all failures introduced by the change.
- [x] 5.2 Produce a static web export to verify the nested routes, browser bundle, images, and `expo-video` integration compile for web.
- [x] 5.3 Verify list/detail repository loading with a controlled delay, repository rejection and retry, successful results, and successful-null not-found behavior without changing presentational contracts.
- [x] 5.4 Verify the exact two records, bundled offline thumbnails, approved content, default list, name search, each filter, combined filters, reset, and thumbnail fallback.
- [x] 5.5 Verify card navigation, persistence after detail/back, visible floating Exercises tab, native back action, nonduplicated editorial title, direct valid links, and unknown IDs.
- [x] 5.6 Verify the locked URL and visible non-exercise label, ready/loading playback, user controls, Push-Up unavailable video, offline/forced invalid-source error, retry, and player cleanup on Android, iOS, and web; restore the locked source afterward.
- [x] 5.7 Verify narrow and wide responsive layouts, light and dark themes, screen-reader semantics, keyboard navigation where supported, touch targets, system safe areas, and final-content tab clearance across Android, iOS, and web.
- [x] 5.8 Run strict OpenSpec validation and confirm every scenario in both capability specs is covered by implementation or verification evidence.
