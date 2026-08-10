## 1. Catalog Data Structure And Existing Fixture Preservation

- [x] 1.1 Add an exercise-focused local catalog module, move the existing Bodyweight Squat and Push-Up record data into it, and confirm their order, IDs, classifications, copy, thumbnail metadata, and video assignments remain unchanged before chest additions.
- [x] 1.2 Add private reusable placeholder-thumbnail and development-video metadata helpers for new records using the bundled Push-Up image and locked bunny URL, while preserving meaningful per-exercise alt/accessibility text and the visible non-exercise media label.
- [x] 1.3 Keep `ExerciseRepository`, immediate asynchronous list/exact-ID lookup behavior, repository injection, data-state hooks, and route adapters unchanged while switching the local repository to the validated catalog export.

## 2. Canonical Chest Record Authoring

- [x] 2.1 Reconcile the existing Push-Up as the sole canonical `push-up` record, preserve all existing content/media, and add only `regressionExerciseId: 'incline-push-up'`.
- [x] 2.2 Add Bent-Knee Push-Up, Incline Push-Up, Decline Push-Up, and Weighted Push-Up with exact manifest classifications/relationships plus original concise descriptions and ordered instructions.
- [x] 2.3 Add Barbell Bench Press, Dumbbell Bench Press, Machine Chest Press, and Smith Machine Bench Press with exact manifest classifications, no relationships, original concise descriptions, and ordered instructions.
- [x] 2.4 Add Incline Dumbbell Press, Incline Barbell Bench Press, and Incline Machine Chest Press with exact manifest classifications, no relationships, original concise descriptions, and ordered instructions.
- [x] 2.5 Add Dumbbell Chest Fly, Cable Chest Fly, Pec Deck / Machine Fly, and Cable Crossover with exact manifest classifications, no relationships, original concise descriptions, and ordered instructions.
- [x] 2.6 Add Chest Dip, Dumbbell Pullover, Decline Barbell Bench Press, and Decline Dumbbell Bench Press with exact manifest classifications, no relationships, original concise descriptions, and ordered instructions.
- [x] 2.7 Construct the final readonly array through `defineExerciseCatalog` in Bodyweight Squat plus canonical chest-manifest order, and confirm no relationship beyond the six approved fields and no unselected manifest record is added by this change.

## 3. Static And Domain Verification

- [x] 3.1 Compare the implemented chest records programmatically with the first 20 JSON/CSV manifest rows for exact IDs, names, primary/secondary body-part order, difficulty, equipment order, and relationships.
- [x] 3.2 Verify exactly 21 total records, exactly 20 primary-chest records, unique stable IDs and names, unchanged Bodyweight Squat, one preserved `push-up`, 9 beginner chest records, 10 intermediate chest records, and 1 advanced chest record.
- [x] 3.3 Verify catalog construction succeeds; every relationship target resolves and is non-self; the exact six approved relationship fields are populated; exact lookup returns every selected record; and unknown/case-mismatched IDs return `null`.
- [x] 3.4 Run `pnpm exec tsc --noEmit` and `pnpm lint`, fixing only failures introduced by the chest catalog batch.

## 4. Library, Detail, Media, And Route Verification

- [x] 4.1 Verify representative name searches for push-ups, bench presses, chest flies, crossover, dip, and pullover plus combined search/filter and reset behavior.
- [x] 4.2 Verify `All` returns 21 records, `Chest / upper body` returns 20, `Lower body` returns only Bodyweight Squat, and Beginner/Intermediate/Advanced return 10/10/1 records under the all-body-area filter.
- [x] 4.3 Verify card/detail/accessibility rendering for bodyweight, barbell+bench, dumbbell+bench, cable, machine, smith-machine+bench, bodyweight+pull-up/dip-station, and bodyweight+weight-plate records on narrow and wide layouts without changing UI components.
- [x] 4.4 Review all 19 new descriptions/instruction sequences for original concise movement-specific setup/execution/finish guidance, and verify all details remain readable through the existing ordered instruction presentation.
- [x] 4.5 Verify every added record uses the bundled placeholder thumbnail with meaningful exercise-specific alternative text and the locked bunny source/non-exercise label; verify Bodyweight Squat media remains unchanged and Push-Up still renders the unavailable-video state.
- [x] 4.6 Run `pnpm exec expo export --platform web` and confirm exactly 21 concrete stable-ID detail pages plus the existing dynamic fallback compile without route or media errors.
- [x] 4.7 Run strict OpenSpec validation and confirm every modified `exercise-library` and `exercise-video-detail` scenario is covered by implementation or verification evidence.
