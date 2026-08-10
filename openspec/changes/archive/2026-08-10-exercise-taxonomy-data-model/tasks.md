## 1. Taxonomy And Model Foundation

- [x] 1.1 Keep the migration limited to domain-model and existing consumer changes; consult the exact Expo SDK 57 documentation only if implementation requires changing an existing Expo API.
- [x] 1.2 Add readonly body-part, difficulty, and equipment taxonomy definitions with the specified stable IDs and labels, exported ID types, and shared ordered label lookup/formatting helpers including exact sole-bodyweight presentation.
- [x] 1.3 Expand `Exercise` with required `primaryBodyPartId`, readonly `secondaryBodyPartIds`, canonical difficulty, non-empty readonly `equipmentIds`, and optional `progressionExerciseId` and `regressionExerciseId`, while retaining all existing identity, content, thumbnail, and nullable video fields and widening presentation-only body-area/category fields beyond current fixture literals.
- [x] 1.4 Add a local catalog assertion/factory that preserves ordered record references while rejecting duplicate exercise IDs, duplicate or primary-repeating secondary IDs, duplicate equipment IDs, self relationships, and relationship IDs absent from the catalog.
- [x] 1.5 Keep taxonomy values and fixture declarations exhaustively checked with strict TypeScript and `satisfies`, and construct the shipped local fixture array through the catalog assertion/factory.

## 2. Fixture Migration And Repository Compatibility

- [x] 2.1 Migrate Bodyweight Squat to `beginner`, primary `quadriceps`, secondary `glutes`, `hamstrings`, and `core`, and equipment `bodyweight`, with progression/regression omitted.
- [x] 2.2 Migrate Push-Up to `beginner`, primary `chest`, secondary `triceps`, `shoulders`, and `core`, and equipment `bodyweight`, with progression/regression omitted.
- [x] 2.3 Verify both fixtures retain their stable IDs, order, names, body areas, category, descriptions, instructions, bundled thumbnails and alt text, and existing Bodyweight Squat/Push-Up video assignments.
- [x] 2.4 Preserve `ExerciseRepository` list and lookup signatures, readonly list behavior, exact stable-ID lookup, successful `null` for unknown IDs, repository injection, and static detail parameter generation.

## 3. Existing Consumer Adaptation

- [x] 3.1 Update existing difficulty filter types, options, labels, session state, and pure matching to use canonical `beginner`, `intermediate`, and `advanced` values while preserving the all-values option, body-area filter, combined matching, reset, and session persistence.
- [x] 3.2 Update exercise cards and accessibility text to render the shared human-readable difficulty label and every equipment label in declared order, preserving exact `Bodyweight / no equipment` fixture copy, the current layout, fields, thumbnail fallback, and stable-ID navigation.
- [x] 3.3 Update exercise detail metadata to render the shared human-readable difficulty label and every equipment label in declared order while preserving exact `Bodyweight / no equipment` fixture copy, descriptions, ordered instructions, thumbnail/video behavior, route states, and navigation chrome.
- [x] 3.4 Confirm no body-part/equipment filter, relationship UI, new route, catalog record, or unrelated visual change is introduced.

## 4. Verification

- [x] 4.1 Run `pnpm exec tsc --noEmit` and `pnpm lint`, fixing only failures caused by the model migration.
- [x] 4.2 Run `pnpm exec expo export --platform web` to verify typed static routes, bundled thumbnails, and library/detail rendering compile with the expanded records.
- [x] 4.3 Verify the local repository still lists exactly Bodyweight Squat then Push-Up, resolves both exact IDs, returns `null` for an unknown ID, and exposes the approved taxonomy assignments; cover the catalog-validator rules with representative invalid in-memory catalogs kept outside the shipped fixture array.
- [x] 4.4 Smoke-test library search, both body-area filters, Beginner/Intermediate/Advanced difficulty choices, combined filters, no-results reset, detail/back persistence, direct details, instructions, and existing available/unavailable video states on narrow and wide layouts.
- [x] 4.5 Temporarily exercise the shared formatters and card/detail presentations with a typed non-repository multi-equipment value, verify every label appears in declared order, then remove that value and confirm the shipped repository still contains exactly two records.
- [x] 4.6 Run strict OpenSpec validation and confirm every scenario in `exercise-taxonomy`, `exercise-library`, and `exercise-video-detail` is covered by implementation or verification evidence.
