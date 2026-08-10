## 1. Closed Equipment Taxonomy Expansion

- [x] 1.1 Add `ab-wheel`, `battle-rope`, `landmine`, `medicine-ball`, `platform-box`, `sled`, `stability-ball`, `suspension-trainer`, and `weight-plate` to the explicit `ExerciseEquipmentId` union without renaming or removing any existing ID.
- [x] 1.2 Add the exact labels `Ab wheel`, `Battle rope`, `Landmine`, `Medicine ball`, `Platform / box`, `Sled`, `Stability ball`, `Suspension trainer`, and `Weight plate` to `EXERCISE_EQUIPMENT`, preserving all existing labels and retaining `other` as the final catch-all entry.
- [x] 1.3 Retain the exhaustive `satisfies Record<ExerciseEquipmentId, ExerciseTaxonomyEntry>` check and confirm arbitrary equipment strings remain rejected by strict TypeScript.
- [x] 1.4 Confirm the final implementation changes no `Exercise` field, formatter algorithm, catalog validator, repository contract, fixture, filter, component, route, media source, dependency, or Expo API.

## 2. Taxonomy And Behavior Verification

- [x] 2.1 Use compile-time checked non-shipped values containing each new equipment ID and verify `getExerciseEquipmentLabel` returns every exact approved label.
- [x] 2.2 Verify `formatExerciseEquipment` preserves the declared order of an all-new-equipment tuple and representative existing/new multi-equipment tuples, and verify sole `bodyweight` remains exactly `Bodyweight / no equipment`.
- [x] 2.3 Exercise existing card, detail, and accessibility formatting with a typed non-repository multi-equipment value containing new IDs on narrow and wide web layouts, then confirm no verification value enters the shipped fixture catalog.
- [x] 2.4 Verify the repository still lists exactly unchanged Bodyweight Squat and Push-Up fixtures in order, both retain sole `bodyweight`, exact lookup and unknown-ID `null` behavior remain unchanged, and static detail parameters still contain only their stable IDs.
- [x] 2.5 Run `pnpm exec tsc --noEmit` and `pnpm lint`, fixing only failures introduced by the taxonomy additions.
- [x] 2.6 Run `pnpm exec expo export --platform web` and confirm the existing library and both static detail routes compile without route, media, or presentation regressions.
- [x] 2.7 Run strict OpenSpec validation and confirm the modified `exercise-taxonomy` requirement and all preserved active specifications remain valid.
