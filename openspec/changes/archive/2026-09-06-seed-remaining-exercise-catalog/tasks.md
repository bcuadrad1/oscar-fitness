## 1. Baseline And Authoring Pipeline

- [x] 1.1 Read the exact Expo SDK 57 documentation relevant to Expo Router static rendering/export, bundled images, and `expo-video` before changing application code, then confirm the existing route/media approach remains supported.
- [x] 1.2 Re-run the stable-ID comparison between `docs/exercise-canonical-manifest.json` and the shipped `LOCAL_EXERCISES`, recording 216 manifest IDs, 21 shipped IDs, 0 extras/duplicates, and the exact 195-ID difference documented in `design.md` before generating records.
- [x] 1.3 Introduce a maintainable catalog-data module layout that preserves the current 21 records and their order separately from repository mechanics, without changing `ExerciseRepository`, its promise-returning methods, injection, hooks, or route contracts.
- [x] 1.4 Add a deterministic, idempotent Node authoring/generation tool that derives the missing set by stable ID, copies manifest-owned fields exactly, joins stable-ID-keyed Oscar Fitness content, emits checked-in typed TypeScript in practical groups with fixed ordering/formatting/line endings, and supports a non-writing stale-output check without a runtime manifest dependency.
- [x] 1.5 Put a clear generated-source header naming the generator and stating `DO NOT EDIT` at the start of every emitted catalog module, and document regeneration as the only supported way to change generated records.
- [x] 1.6 Require exactly one explicit authored-content entry for every one of the 195 missing IDs and make generation fail for missing keys, extra keys, duplicate IDs/names, a derived count other than 195, unsupported taxonomy values, empty descriptions, or empty instruction lists without synthesizing fallback/template prose.
- [x] 1.7 Implement generation using only the repository's existing Node/TypeScript toolchain capabilities and confirm no npm, runtime, or code-generation dependency is added.
- [x] 1.8 Extend `defineExerciseCatalog` to reject duplicate canonical exercise names while preserving all existing integrity checks, tuple-preserving return behavior, and its role as the one final catalog boundary.

## 2. Original Exercise Content

- [x] 2.1 Author and review concise original descriptions and ordered instructions for the first 12 missing back exercises, from Seated Lat Pulldown through Barbell Bent-Over Row, keyed only by manifest stable ID.
- [x] 2.2 Author and review content for the remaining 12 missing back exercises, from Smith Machine Bent-Over Row through TRX Row.
- [x] 2.3 Author and review content for the 2 missing chest exercises, Medicine Ball Chest Pass and TRX Chest Press.
- [x] 2.4 Author and review content for the first 10 missing quadriceps exercises, from Goblet Squat through Leg Extension.
- [x] 2.5 Author and review content for the remaining 9 missing quadriceps exercises, from Bulgarian Split Squat through TRX Squat.
- [x] 2.6 Author and review content for all 7 hamstring exercises and all 6 glute exercises.
- [x] 2.7 Author and review content for all 4 hip-abductor/adductor exercises and all 6 calf exercises.
- [x] 2.8 Author and review content for the first 15 shoulder exercises, from Cable Reverse Fly through Dumbbell Front Raise.
- [x] 2.9 Author and review content for the remaining 14 shoulder exercises, from Cable Front Raise through Kettlebell Halo.
- [x] 2.10 Author and review content for all 16 biceps exercises.
- [x] 2.11 Author and review content for the first 9 triceps exercises, from Cable Triceps Pushdown through Lying Barbell Triceps Extension / Skull Crusher.
- [x] 2.12 Author and review content for the remaining 8 triceps exercises, from Dumbbell Skull Crusher through Diamond Push-Up.
- [x] 2.13 Author and review content for all 8 forearm exercises.
- [x] 2.14 Author and review content for the first 18 core exercises, from Crunch through Hanging Knee Raise.
- [x] 2.15 Author and review content for the remaining 17 core exercises, from Hanging Leg Raise through TRX Fallout.
- [x] 2.16 Author and review content for the first 11 full-body exercises, from Farmers Carry through Kettlebell Figure Eight.
- [x] 2.17 Author and review content for the remaining 11 full-body exercises, from Landmine Thruster through Sled Pull.
- [x] 2.18 Review all 195 explicit descriptions and instruction sequences together for movement-specific setup, controlled execution, finish/return guidance, concise original wording, no external-site phrasing, no medical claims, and no load or distance prescriptions; allow appropriate shared terminology but reject generic fallback/template sequences.

## 3. Generated Catalog Composition

- [x] 3.1 Generate the 195 typed records with exact manifest `id`, `name`, primary body part, ordered secondary body parts, difficulty, ordered equipment, progression, and regression values, omitting optional relationship properties only where the manifest value is null and marking every output module with the generated/do-not-edit header.
- [x] 3.2 Assign generated display metadata deterministically: category `Strength`; `Lower body` for lower-body primary parts, `Chest / upper body` for upper-body primary parts, `Core` for core, and `Full body` for full-body, without expanding existing filter options.
- [x] 3.3 Reuse the bundled Push-Up placeholder for every new record with meaningful exercise-specific alt text, and reuse the bunny development URL with the exact visible non-exercise label and exercise-specific accessibility label.
- [x] 3.4 Preserve Bodyweight Squat, Push-Up, and all 19 previously added chest records without unnecessary rewrites; keep all existing IDs/copy/media/classifications and add only Bodyweight Squat's manifest-approved `progressionExerciseId: 'goblet-squat'` reconciliation.
- [x] 3.5 Append the generated records in manifest order after the preserved 21-record prefix and pass the complete readonly 216-record composition through `defineExerciseCatalog` exactly once.
- [x] 3.6 Confirm no application module loads the JSON planning manifest or authoring inputs at runtime, no new dependency was added, and the local repository continues to expose only bundled typed catalog data asynchronously.

## 4. Programmatic Catalog Verification

- [x] 4.1 Add and run a deterministic final-catalog parity check that proves count 216, exact equality of manifest/catalog stable-ID sets, unique IDs, unique canonical names, no outside-manifest record, and exactly one record for every previously shipped stable ID.
- [x] 4.2 Compare every final record by stable ID for exact name, primary body part, ordered secondary body parts, difficulty, ordered equipment, normalized progression, and normalized regression parity with the JSON manifest.
- [x] 4.3 Verify only approved taxonomy values occur and final difficulty counts are exactly 100 beginner, 97 intermediate, and 19 advanced.
- [x] 4.4 Verify catalog construction succeeds and all 29 manifest-approved progression/regression fields are present exactly once, resolve within the final catalog, are non-self-referential, and no additional relationship field exists.
- [x] 4.5 Exercise `defineExerciseCatalog` failure paths for duplicate IDs, duplicate canonical names, duplicate/repeated body parts, duplicate equipment, self relationships, and missing relationship targets while confirming the valid final catalog succeeds.
- [x] 4.6 Verify `getExerciseById` resolves every one of the 216 exact stable IDs to its canonical record and resolves unknown and case-mismatched IDs to `null`, with `listExercises` and both methods retaining asynchronous contracts.
- [x] 4.7 Run generation repeatedly with unchanged manifest/authored-content inputs and prove every generated module is byte-for-byte identical across runs, with the second run producing no working-tree diff.
- [x] 4.8 Run non-writing check mode against current generated files and confirm success, then use a temporary fixture or reversible local perturbation to prove it fails for missing, extra, or stale generated output without silently rewriting files.
- [x] 4.9 Exercise generation failure cases for a missing content key, extra content key, empty description, and empty instruction list, confirming no case receives synthesized fallback/template content or accepted output.
- [x] 4.10 Confirm every generated module has the generated/do-not-edit header and the package/dependency manifests contain no new npm, runtime, or code-generation dependency.

## 5. Discovery And Presentation Verification

- [x] 5.1 Verify trimmed case-insensitive name search with representative records for chest, back, quadriceps, hamstrings, glutes, shoulders, biceps, triceps, forearms, core, calves, and full body, plus clearing, no-results/reset, and combined-filter behavior.
- [x] 5.2 Verify difficulty filtering returns exactly 100 beginner, 97 intermediate, and 19 advanced records and retains input order and existing AND semantics with search/body-area filters.
- [x] 5.3 Verify the existing body-area options and exact-match behavior remain unchanged: `All` returns 216, `Lower body` returns the 43 lower-area records, `Chest / upper body` returns the 116 upper-area records, and core/full-body records remain discoverable through `All` and search without new filter choices.
- [x] 5.4 Verify representative cards and details across every manifest-used equipment category, including sole bodyweight and ordered multi-equipment combinations, with readable labels, original descriptions, ordered instructions, stable-ID navigation, thumbnail fallback, and narrow/wide responsive behavior.
- [x] 5.5 Verify all 195 new thumbnails use the bundled placeholder with meaningful exercise-specific alt text and all new videos use the locked bunny URL, exact visible non-exercise label, exercise-specific accessibility labels, native controls, no autoplay, and existing loading/error/retry behavior.
- [x] 5.6 Verify Bodyweight Squat media/detail behavior is unchanged, all 19 seeded chest source-backed media fixtures are unchanged, Push-Up remains the sole unavailable-video fixture, and offline text/thumbnail behavior remains usable.
- [x] 5.7 Verify accessible search/filter states, card actions, detail metadata/instructions, media states, retry/back controls, safe areas, tab clearance, and existing Exercises navigation/session-state behavior with representative completed-catalog records.
- [x] 5.8 Verify static parameter generation returns all 216 stable IDs exactly once and preserves the dynamic fallback and unknown-ID not-found route behavior.

## 6. Required Final Checks

- [x] 6.1 Run `pnpm exec tsc --noEmit` and fix only failures introduced by this change.
- [x] 6.2 Run `pnpm lint` and fix only failures introduced by this change.
- [x] 6.3 Run `pnpm exec expo export --platform web` and confirm all 216 concrete stable-ID detail pages plus the dynamic fallback export without route, catalog, image, or video errors.
- [x] 6.4 Run `git diff --check` and resolve whitespace errors introduced by this change.
- [x] 6.5 Run strict OpenSpec validation for `seed-remaining-exercise-catalog` and confirm every proposal, design, spec, and task artifact remains coherent with the implemented and verified behavior.
