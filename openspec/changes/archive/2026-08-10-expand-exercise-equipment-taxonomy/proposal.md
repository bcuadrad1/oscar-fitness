## Why

The closed exercise equipment taxonomy lacks nine stable values required by the approved canonical exercise manifest. Adding them now lets future catalog records remain exhaustively typed without using arbitrary strings or changing the existing exercise repository and presentation contracts.

## What Changes

- Add equipment IDs and labels for `ab-wheel` (`Ab wheel`), `battle-rope` (`Battle rope`), `landmine` (`Landmine`), `medicine-ball` (`Medicine ball`), `platform-box` (`Platform / box`), `sled` (`Sled`), `stability-ball` (`Stability ball`), `suspension-trainer` (`Suspension trainer`), and `weight-plate` (`Weight plate`).
- Preserve every existing equipment ID and label, including `other`, in the same closed exhaustive taxonomy.
- Preserve the `Exercise` shape, non-empty ordered `equipmentIds`, shared label lookup and formatting behavior, exact sole-bodyweight presentation, and declared-order multi-equipment output.
- Keep the two current fixtures, repository contracts and behavior, filters, cards, details, accessibility copy, routes, static route generation, thumbnails, and video behavior unchanged.
- Add no canonical exercise records, filter dimensions, UI redesign, routines, workout tracking, accounts, persistence, APIs, or databases.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `exercise-taxonomy`: Expand the canonical multi-equipment taxonomy with the nine manifest-required IDs and exact labels while preserving all existing taxonomy and formatting requirements.

## Impact

- Affected code: only the closed `ExerciseEquipmentId` union and exhaustive `EXERCISE_EQUIPMENT` registry in `src/features/exercises/exercise-types.ts` should require application changes.
- Stable domain values: this is additive; no existing ID, label, formatter rule, or exercise record is migrated or removed.
- Public feature API: `Exercise`, `ExerciseRepository`, route data states, and component props remain unchanged; the equipment ID union accepts nine additional canonical values.
- Dependencies and systems: no package, Expo API, route, backend, persistence layer, or media source changes.
- Verification: strict TypeScript, lint, static web export, representative typed values for all nine additions, formatter/card/detail compatibility checks, and strict OpenSpec validation.
