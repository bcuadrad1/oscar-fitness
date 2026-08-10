## Why

The current `Exercise` type encodes body area, difficulty, and equipment as small display-oriented values that cannot describe a commercial-gym catalog or movement relationships. Oscar Fitness needs a stable, typed taxonomy foundation before catalog expansion or routine features can safely depend on exercise data.

## What Changes

- Add canonical body-part taxonomy entries and require every exercise to identify one primary body part plus zero or more secondary body parts, with local catalog integrity validation.
- Define difficulty as exactly `beginner`, `intermediate`, or `advanced`, with presentation labels kept separate from stored values.
- Add a canonical equipment taxonomy covering bodyweight, dumbbell, barbell, cable, machine, smith machine, kettlebell, resistance band, bench, pull-up/dip station, and other, and allow an exercise to reference multiple equipment entries.
- Add optional `progressionExerciseId` and `regressionExerciseId` references to stable exercise IDs.
- Preserve exercise identity and content fields, the asynchronous repository contract and behavior, existing search/filter/detail flows, thumbnails, instructions, and nullable video metadata; retain current body-area/category copy as presentation data without keeping their current two-value/one-value model restrictions.
- Migrate only the existing Bodyweight Squat and Push-Up fixtures to the new model; do not add catalog records or routine, workout, persistence, account, or new-filter behavior.
- Adapt current card/detail metadata formatting and existing difficulty filtering to the structured values without redesigning either screen.

## Capabilities

### New Capabilities
- `exercise-taxonomy`: Defines canonical body-part, difficulty, and equipment taxonomies, exercise classification cardinality, and optional progression/regression relationships.

### Modified Capabilities
- `exercise-library`: Migrates the approved local fixtures and existing library metadata/filter behavior to the structured model while preserving repository and navigation behavior.
- `exercise-video-detail`: Requires detail presentation to remain compatible with the structured classifications and to present every required equipment item while preserving current instructions and media behavior.

## Impact

- Affected code: `src/features/exercises/exercise-types.ts`, local exercise fixtures/repository, filtering/session types, and exercise card/detail metadata formatting.
- Public feature API: the `Exercise` record shape changes, but `ExerciseRepository.listExercises()` and `ExerciseRepository.getExerciseById()` signatures and async/null/error semantics remain unchanged.
- Fixtures: Bodyweight Squat and Push-Up retain their stable IDs, names, descriptions, instructions, bundled thumbnails, category, and current video assignments.
- Verification: strict TypeScript, local catalog integrity checks, Expo lint, static web export, OpenSpec validation, and focused library/detail checks must pass. The repository currently has no automated test harness, so this change does not add unrelated test infrastructure.
- Dependencies and systems: no new runtime dependency, backend, persistence layer, account system, route, or screen is introduced.
