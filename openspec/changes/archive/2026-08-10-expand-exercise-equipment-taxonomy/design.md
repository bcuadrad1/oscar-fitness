## Context

The exercise domain currently represents equipment with an explicit closed `ExerciseEquipmentId` union and an exhaustive `EXERCISE_EQUIPMENT` label registry. `Exercise.equipmentIds` is already a readonly non-empty tuple, `getExerciseEquipmentLabel` resolves registry labels, and `formatExerciseEquipment` preserves declared order while special-casing sole `bodyweight` as `Bodyweight / no equipment`. Cards, details, and accessibility copy consume that shared formatter; repository fixtures currently use only `bodyweight`.

The approved canonical exercise manifest requires nine equipment classifications that are absent from the union and registry. This change supplies only those domain values. It must not add manifest exercises, alter fixtures, change repository or route contracts, introduce filters, or redesign presentation.

## Goals / Non-Goals

**Goals:**

- Add the nine exact canonical IDs and labels required by the manifest.
- Preserve every existing equipment ID and label, including `other`.
- Keep the equipment taxonomy closed and enforce union/registry exhaustiveness at compile time.
- Preserve existing label lookup, sole-bodyweight output, declared-order multi-equipment formatting, and all current exercise behavior.
- Verify that every new ID is accepted as a typed value and resolves to its exact label.

**Non-Goals:**

- Adding any canonical exercise record or modifying Bodyweight Squat or Push-Up.
- Changing `Exercise`, the catalog validator, repository interfaces, data hooks, routes, filters, cards, details, accessibility structure, thumbnails, or video behavior.
- Changing body-part or difficulty taxonomies.
- Adding routines, workouts, accounts, persistence, APIs, databases, or test infrastructure.

## Decisions

### Extend the explicit union and exhaustive registry together

Add these literals to `ExerciseEquipmentId` and matching entries to `EXERCISE_EQUIPMENT`:

| ID | Label |
| --- | --- |
| `ab-wheel` | `Ab wheel` |
| `battle-rope` | `Battle rope` |
| `landmine` | `Landmine` |
| `medicine-ball` | `Medicine ball` |
| `platform-box` | `Platform / box` |
| `sled` | `Sled` |
| `stability-ball` | `Stability ball` |
| `suspension-trainer` | `Suspension trainer` |
| `weight-plate` | `Weight plate` |

The additions will appear after the current specific equipment entries and before `other`, preserving the relative order and exact labels of every existing entry while leaving `other` as the final catch-all. The registry remains `satisfies Record<ExerciseEquipmentId, ExerciseTaxonomyEntry>`, so omitting a union member from the registry or adding an untyped registry key fails strict TypeScript checking.

Deriving the union from arbitrary registry strings was rejected because the existing explicit union plus exhaustive `Record` makes the approved stable ID set independently reviewable. Replacing the IDs with free-form strings was rejected because it would remove the closed taxonomy guarantee.

### Reuse existing lookup and formatting paths unchanged

`getExerciseEquipmentLabel` already indexes the exhaustive registry, so adding registry entries automatically gives all nine IDs exact label lookup. `formatExerciseEquipment` already maps the supplied tuple in author-declared order and joins labels with `, `; no registry-order sorting or formatter branch is needed. Its sole-`bodyweight` branch remains exactly unchanged.

Cards, details, and accessibility labels already call the shared formatter, so they need regression verification rather than component changes. Adding special rendering per equipment ID or exposing an equipment filter was rejected as unnecessary and outside scope.

### Preserve fixtures and repository behavior byte-for-byte

Bodyweight Squat and Push-Up retain their current IDs, classifications, `['bodyweight']` equipment, descriptions, instructions, bundled thumbnails, and video assignments. The asynchronous repository contract, original list order and references, exact lookup, unknown-ID `null`, injection boundary, route states, and static route generation do not change.

A demonstration fixture using a new equipment value was rejected because the active library specification requires exactly two approved fixtures and the larger manifest is explicitly out of scope.

### Verify additions with non-shipped typed values

Because the repository has no automated test harness, implementation verification will use compile-time checked, non-shipped in-memory values containing each of the nine new IDs. Direct lookup must produce every exact label, and formatting one ordered tuple containing all nine additions must preserve their declared order. Existing `['bodyweight']` output must remain exactly `Bodyweight / no equipment`, and representative existing/new multi-equipment values must flow through the same card/detail/accessibility formatter path without entering the local repository.

Strict TypeScript, Expo lint, static web export, focused card/detail checks, repository fixture review, and strict OpenSpec validation provide regression coverage without adding dependencies or production records.

## Risks / Trade-offs

- [Union and registry additions drift] -> Add both sets in one edit and retain the exhaustive `Record<ExerciseEquipmentId, ...>` check under strict TypeScript.
- [A label differs in capitalization or punctuation from the manifest] -> Specify and directly verify every exact ID-to-label pair, especially `Platform / box`.
- [Long or multiple equipment labels wrap differently] -> Keep the existing formatter and wrapping layouts, then verify representative card/detail output on narrow and wide web layouts.
- [Taxonomy expansion accidentally changes shipped exercises] -> Review fixture and repository diffs and require the final local catalog to remain exactly Bodyweight Squat and Push-Up with sole `bodyweight` equipment.
- [No durable unit test captures the additions] -> Use strict exhaustive typing plus explicit implementation-time lookup/formatting verification; adding test infrastructure remains outside this narrow change.

## Migration Plan

1. Extend `ExerciseEquipmentId` with the nine approved stable IDs.
2. Add the nine exact labels to the exhaustive equipment registry without modifying existing entries.
3. Run typed lookup/formatting checks and existing static, screen, repository, and OpenSpec verification.

Rollback removes only the nine union members and matching registry entries. No data, route, dependency, fixture, or persistence migration is required because no shipped record uses the additions yet.

## Open Questions

None. Exercise records that consume these values and any future equipment filtering belong to later changes.
