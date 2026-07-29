## Context

Oscar Fitness currently exposes Exercises as a root native-tab route backed by a small `ExercisePreview` array in the general MVP content module. The route renders generic preview cards inside the shared `SectionScreen`; there is no nested navigation, search state, exercise detail, or media dependency. The application already has a responsive themed UI, Expo Router typed routes, `expo-image`, and a verified safe-area/floating-tab inset strategy.

Expo SDK 57 provides `expo-video` for Android, iOS, web, and Expo Go. Its managed `useVideoPlayer` hook owns player cleanup, `VideoView` supplies native controls, and `statusChange` events expose loading and error state. This change remains local-data-only, but route consumers must use an asynchronous repository and explicit loading/success/error states so an API-backed implementation can replace local storage without changing presentational contracts.

## Goals / Non-Goals

**Goals:**

- Turn Exercises into a useful, searchable, filterable library with exactly two approved development records and bundled thumbnails.
- Add stable dynamic detail URLs under the existing Exercises tab.
- Present exercise instructions and resilient, user-controlled sample video playback.
- Keep data access, route data states, filtering, cards, detail content, and media states independently replaceable and testable.
- Preserve search and selected filters while users visit a detail and return during the current Exercises navigation session.
- Preserve existing visual language, responsive behavior, themes, accessibility, safe areas, and floating-tab clearance.

**Non-Goals:**

- Authentication, memberships, entitlements, backend APIs, databases, or persistence.
- Admin authoring, video upload, media processing, or content moderation.
- Routine execution, favorites, progress tracking, or analytics.
- Background playback, picture-in-picture configuration, autoplay, or video caching policy.
- Treating development fixture URLs or sample media as production content.

## Decisions

### Nest an Exercises stack under the primary tab

The existing `src/app/exercises.tsx` route will become `src/app/exercises/index.tsx`, with `src/app/exercises/_layout.tsx` rendering an Expo Router `Stack` and `src/app/exercises/[exerciseId].tsx` resolving details. The root `NativeTabs.Trigger name="exercises"` and web `/exercises` tab link remain unchanged, and the floating Exercises tab remains visible on the detail route. Library and detail therefore share Exercises tab history and native back behavior. The index stack header remains hidden to preserve the current section header. The detail uses a themed native header only for back navigation; it does not repeat the exercise name, which remains the large editorial title inside the page.

Keeping the detail as another root sibling was rejected because a dynamic route could be treated as root navigator surface and would not clearly belong to the Exercises flow. A modal was rejected because exercise detail is durable, directly addressable content rather than a transient action.

### Define a feature domain model behind an async repository

A focused exercise module defines stable unions for body area, category, and difficulty plus `Exercise`, bundled thumbnail, and optional video metadata. Records include summary and detail fields: ID, name, body area, target text, category, difficulty, equipment, description, ordered instructions, thumbnail source/alternative text, and optional video source/label.

All route data access depends on this contract:

```ts
interface ExerciseRepository {
  listExercises(): Promise<readonly Exercise[]>;
  getExerciseById(id: string): Promise<Exercise | null>;
}
```

The initial `LocalExerciseRepository` resolves those promises immediately from a readonly array. Library and detail route adapters expose a discriminated loading/success/error data state to their presentational content; repository rejection produces an accessible data error and retry action, while a successful `null` detail result produces the separate not-found state. The Exercises stack provider supplies the repository instance, so a future API repository can be substituted at that composition boundary.

Route screens are adapters: they obtain repository results and pass typed data states, values, and callbacks into presentational components. `ExerciseCard`, library controls, empty state, detail content, and video presentation do not import fixture storage. A future API maps responses into the same `Exercise` model and repository contract without redesigning those interfaces.

Leaving exercise records inside the route was rejected because it couples storage to UI and duplicates detail lookup. Synchronous list/lookup functions were rejected because they would force route data contracts to change when an API is introduced. A general application-wide data framework remains unnecessary; the repository and state provider are scoped to the Exercises stack.

### Use the two approved development records

The local repository contains exactly these records:

- **Bodyweight Squat**: lower body, strength, beginner, no equipment (`Bodyweight`). Description: "A controlled lower-body pattern for practicing a stable sit-to-stand movement." Instructions: (1) Stand with feet about shoulder-width apart and toes turned out slightly. (2) Brace the trunk, keep the chest tall, and send the hips down and back. (3) Let the knees track with the toes and lower only while the heels stay planted and movement remains controlled. (4) Press through the whole feet to stand; reduce the range or stop if form breaks or pain occurs.
- **Push-Up**: chest/upper body, strength, intermediate, no equipment (`Bodyweight`). Description: "A bodyweight press for the chest, shoulders, triceps, and trunk." Instructions: (1) Start in a high plank with hands slightly wider than the shoulders and the body in one line. (2) Brace the abdomen and glutes while keeping the shoulders away from the ears. (3) Bend the elbows about 45 degrees and lower only as far as control and comfort allow. (4) Press the floor away to return without letting the hips sag; reduce the range or stop if form breaks or pain occurs.

Each record references a bundled thumbnail such as `assets/images/exercises/bodyweight-squat.png` or `assets/images/exercises/push-up.png`, with alternative text. The catalog, thumbnails, search/filter behavior, and textual details therefore remain usable offline. Bodyweight Squat alone receives the locked network video; Push-Up declares no video for deterministic unavailable-state coverage.

Other exercise identities or classifications are rejected for this development change. Assigning a deliberately broken source to a normal exercise is also rejected because error behavior should be tested without making the default experience fail.

### Keep search and filters local and composable

An `ExerciseSessionProvider` in `exercises/_layout.tsx` owns controlled search text, selected body area, and selected difficulty for the lifetime of the current Exercises navigator. The index route reads and updates this state, so pushing a detail and navigating back restores the same query and filters. A pure selector trims and lowercases the name query and applies all active predicates with AND semantics. Filter controls expose an `All` option, wrap responsively, and report selected state to assistive technology. A no-results component resets all controls.

Application-global state and URL query parameters were rejected because no other section consumes these transient controls and cross-session/shareable filtering is out of scope. Index-local state was rejected because persistence across nested navigation would depend on mounting behavior rather than an explicit contract. Debouncing was rejected because two local records can be filtered synchronously without perceptible cost.

### Use a dedicated card rather than extending generic preview cards

`ExerciseCard` accepts an exercise summary and activation callback, renders its bundled thumbnail through `expo-image` with a fixed responsive aspect ratio, and lays out all required metadata in the existing bordered-card visual language. Card collections can wrap into a wider-layout grid while remaining one column on mobile. The entire card has one clear accessible action rather than nested links. A themed fallback still protects against an unexpected bundled-asset rendering failure.

Adding thumbnail and navigation concerns to `PreviewCard` was rejected because that component remains appropriate for static Home, Routine, and Admin previews and would gain unrelated optional props.

### Encapsulate media states behind one exercise video component

`ExerciseVideo` accepts optional video metadata. A source-less record renders unavailable UI without creating a player. A source-backed child uses `useVideoPlayer` so player lifecycle cleanup is automatic, listens to SDK 57 `statusChange` events, and uses `onFirstFrameRender` to resolve its loading cover. Native controls and supported fullscreen behavior remain enabled; playback does not start during setup.

Loading, unavailable, and error states occupy the same 16:9 media frame to prevent layout shifts. Error retry remounts the managed player child with a new key, producing a fresh player without manual release or synchronous source replacement. Text details remain rendered independently of video state.

Building custom playback controls was rejected because native controls are more consistent and accessible across platforms. A web-only HTML video path was rejected because `expo-video` already provides one cross-platform API. Background playback and picture-in-picture are omitted, so no `expo-video` config plugin settings are needed.

### Lock network media and label it as development-only

Bodyweight Squat uses exactly `https://www.w3schools.com/html/mov_bbb.mp4`. Its media metadata and video region visibly identify it as "Development playback sample - non-exercise media" so it cannot be mistaken for squat instruction. Push-Up has no video source and exercises unavailable behavior. The originally approved Google Storage URL was replaced because it returned `403 AccessDenied`; the subsequent W3C Bunny candidate was replaced because Android could not load it. The final W3Schools source was verified on Android, iOS, and web.

The MP4 is remote and requires network access. Offline loading can report a player error; the existing playback-error and retry UI handles that outcome while bundled thumbnails and textual instructions remain available. Playback-error verification temporarily substitutes an invalid URL and restores the locked URL before completion.

Bundling a large video asset was rejected because it would add repository weight. Depending on an unlicensed fitness clip was rejected because a known development sample has clearer usage intent.

### Preserve shared inset and theme ownership

Library and detail scroll content continue through the established section layout or a feature wrapper that applies the same `contentInsetAdjustmentBehavior`, platform padding, maximum width, and final-card clearance. The nested stack header uses current theme colors. Video and thumbnail dimensions use aspect ratios and maximum widths rather than fixed device dimensions.

Duplicating per-route safe-area constants was rejected because the main `mobile-content-insets` capability already defines shared behavior.

## Risks / Trade-offs

- [Development video is not actual exercise instruction] -> Display the approved non-exercise label adjacent to the player and rely on the approved textual instructions; production media replaces the URI later.
- [Network video is unavailable offline or the public host changes] -> Keep bundled thumbnails and text independent, document network dependence, and preserve loading/error/retry media states.
- [Async local repository resolves too quickly to observe loading] -> Keep loading as a real route state and verify it with a controlled delayed test repository during development.
- [Nested Stack and NativeTabs can combine insets or headers differently by platform] -> Keep automatic inset ownership unchanged and smoke-test library/detail top and bottom states on Android and iOS.
- [Two records make search/filter behavior easy to overlook] -> Choose records with distinct body areas and difficulties and verify each filter plus combined and empty results.
- [Player errors differ across native and web implementations] -> Derive UI from SDK status events, avoid matching platform error strings, and test invalid-source recovery on all targets.
- [Native media controls have platform-specific appearance] -> Treat control parity as functional rather than pixel-identical while preserving the surrounding Oscar Fitness frame.

## Migration Plan

1. Install SDK-compatible `expo-video` without enabling optional background or picture-in-picture configuration.
2. Add the exercise domain, async repository contract, immediate local repository, exact fixtures, bundled thumbnails, and filter module; remove exercise records from the general MVP fixture module.
3. Convert Exercises into a nested stack, add the session/repository provider and library/detail route data states, and preserve the visible tab and back-only detail header.
4. Add presentational loading/error, library, filter, card, detail, and video-state components using existing theme and inset primitives.
5. Run static checks and verify library behavior, routes, all video states, themes, responsiveness, accessibility, safe areas, and final-content clearance on Android, iOS, and web.

Rollback removes the nested Exercises directory and `expo-video`, restores the single placeholder route and preview data, and requires no persisted-data migration.

## Open Questions

None. Production exercise media, API transport, caching, and entitlement policy remain future decisions.
