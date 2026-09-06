## Why

The shipped local catalog contains 21 of the 216 approved canonical exercises, leaving 195 manifest records unavailable through the exercise library. Completing the catalog from the approved stable-ID manifest provides the intended local exercise coverage without changing repository, route, discovery, or presentation contracts.

## What Changes

- Derive the exact missing set by comparing shipped catalog IDs with `docs/exercise-canonical-manifest.json`, then add the 195 missing canonical records exactly once.
- Make the final shipped catalog ID set exactly equal to the 216-record manifest, with unique IDs and canonical names and no unapproved records.
- Preserve the existing Bodyweight Squat and seeded chest records, stable IDs, authored content, and media behavior while reconciling their progression/regression fields with the now-complete manifest relationship graph.
- Copy every manifest-owned classification field exactly, including ordered secondary body parts, difficulty, ordered equipment, progression, and regression.
- Add original Oscar Fitness descriptions, ordered instructions, exercise-specific placeholder alt text, and exercise-specific bunny-video accessibility labels for the 195 additions while retaining the visible non-exercise media label.
- Keep the catalog typed and bundled separately from repository mechanics, with `defineExerciseCatalog` as the final integrity boundary and no runtime dependency on the planning JSON.
- Preserve current asynchronous repository behavior, search, body-area and difficulty filters, cards, details, accessibility, navigation, playback, and route contracts while expanding static detail generation to all 216 IDs.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `exercise-library`: Replace the 21-record development-catalog contract with exact 216-record manifest coverage and corresponding search, filtering, lookup, and static-route expectations.
- `exercise-taxonomy`: Require catalog-wide unique canonical names and exact manifest-approved classification and relationship data while retaining the existing taxonomy and integrity boundary.
- `exercise-video-detail`: Extend original instructional content and the existing placeholder/bunny media strategy to every newly added canonical exercise without changing detail or player behavior.

## Impact

- Exercise catalog data and its maintainable source organization under `src/features/exercises/`.
- Catalog integrity validation and verification tooling for manifest parity.
- Existing exercise library, detail, repository, and static-route tests or verification coverage.
- No new runtime dependency, taxonomy value, route shape, repository interface, asset, backend, persistence layer, or product feature.
