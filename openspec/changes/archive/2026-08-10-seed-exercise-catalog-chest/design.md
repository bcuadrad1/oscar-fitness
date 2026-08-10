## Context

Oscar Fitness currently constructs a two-record local catalog directly inside `exercise-repository.ts`: Bodyweight Squat followed by Push-Up. The catalog is statically typed, validated at module initialization by `defineExerciseCatalog`, returned through asynchronous list/exact-ID lookup methods, and enumerated for static detail routes. Search is name-only; existing body-area and difficulty filters compare canonical record values; cards and details format ordered equipment through shared taxonomy helpers.

The approved planning manifest at `docs/exercise-canonical-manifest.json` contains 216 records. This change intentionally seeds only the 20 records explicitly selected by the user from the start of that manifest, all primary `chest`. The manifest also contains `medicine-ball-chest-pass` and `trx-chest-press` as chest-primary records later in the file; they are not part of this batch and must not be added here. Bodyweight Squat remains unchanged, so the final local catalog contains 20 chest records and 21 total records.

## Goals / Non-Goals

**Goals:**

- Reconcile existing `push-up` with the approved canonical record and add the other 19 selected chest records exactly once.
- Preserve manifest IDs, names, ordered body-part/equipment classifications, difficulty, and only the approved relationships.
- Add concise original descriptions and ordered instructions for every added record.
- Reuse bundled placeholder imagery and the current non-exercise bunny video without changing presentation or player behavior.
- Preserve repository, discovery, card, detail, accessibility, route, and static-export contracts.
- Keep the entire local catalog validated through `defineExerciseCatalog`.

**Non-Goals:**

- Seeding any other manifest record, including the two later chest-primary records not selected for this batch.
- Changing body-part, difficulty, or equipment taxonomies; adding category or body-area taxonomies.
- Adding filters, sorting, pagination, virtualization, relationship UI, or a UI redesign.
- Sourcing real exercise thumbnails/videos or copying external exercise prose.
- Adding routines, workouts, tracking, accounts, persistence, APIs, databases, or test infrastructure.

## Decisions

### Treat the JSON manifest as the record-classification source of truth

The JSON and CSV formats agree on the selected records. Implementation will transcribe the following exact manifest data; all records use `targetBodyArea: 'Chest / upper body'`, `category: 'Strength'`, and primary body part `chest`:

| ID | Name | Secondary body parts | Difficulty | Equipment, declared order | Progression | Regression |
| --- | --- | --- | --- | --- | --- | --- |
| `push-up` | Push-Up | `triceps`, `shoulders`, `core` | `beginner` | `bodyweight` | - | `incline-push-up` |
| `bent-knee-push-up` | Bent-Knee Push-Up | `triceps`, `shoulders`, `core` | `beginner` | `bodyweight` | `push-up` | - |
| `incline-push-up` | Incline Push-Up | `triceps`, `shoulders`, `core` | `beginner` | `bodyweight`, `bench` | `push-up` | - |
| `decline-push-up` | Decline Push-Up | `triceps`, `shoulders`, `core` | `intermediate` | `bodyweight`, `bench` | `weighted-push-up` | `push-up` |
| `weighted-push-up` | Weighted Push-Up | `triceps`, `shoulders`, `core` | `advanced` | `bodyweight`, `weight-plate` | - | `push-up` |
| `barbell-bench-press` | Barbell Bench Press | `triceps`, `shoulders` | `beginner` | `barbell`, `bench` | - | - |
| `dumbbell-bench-press` | Dumbbell Bench Press | `triceps`, `shoulders` | `intermediate` | `dumbbell`, `bench` | - | - |
| `machine-chest-press` | Machine Chest Press | `triceps`, `shoulders` | `beginner` | `machine` | - | - |
| `smith-machine-bench-press` | Smith Machine Bench Press | `triceps`, `shoulders` | `beginner` | `smith-machine`, `bench` | - | - |
| `incline-dumbbell-press` | Incline Dumbbell Press | `shoulders`, `triceps` | `beginner` | `dumbbell`, `bench` | - | - |
| `incline-barbell-bench-press` | Incline Barbell Bench Press | `shoulders`, `triceps` | `intermediate` | `barbell`, `bench` | - | - |
| `incline-machine-chest-press` | Incline Machine Chest Press | `shoulders`, `triceps` | `beginner` | `machine` | - | - |
| `dumbbell-chest-fly` | Dumbbell Chest Fly | `shoulders` | `intermediate` | `dumbbell`, `bench` | - | - |
| `cable-chest-fly` | Cable Chest Fly | `shoulders` | `intermediate` | `cable` | - | - |
| `pec-deck-machine-fly` | Pec Deck / Machine Fly | `shoulders` | `beginner` | `machine` | - | - |
| `cable-crossover` | Cable Crossover | `shoulders` | `intermediate` | `cable` | - | - |
| `chest-dip` | Chest Dip | `triceps`, `shoulders` | `intermediate` | `bodyweight`, `pull-up-dip-station` | - | - |
| `dumbbell-pullover` | Dumbbell Pullover | `back` | `intermediate` | `dumbbell`, `bench` | - | - |
| `decline-barbell-bench-press` | Decline Barbell Bench Press | `triceps`, `shoulders` | `intermediate` | `barbell`, `bench` | - | - |
| `decline-dumbbell-bench-press` | Decline Dumbbell Bench Press | `triceps`, `shoulders` | `intermediate` | `dumbbell`, `bench` | - | - |

No relationship is inferred from naming, equipment, or difficulty. The six populated fields in the table are the complete relationship set for this batch. Relationship targets all exist within the selected chest records, allowing the existing two-pass catalog validator to accept forward references.

Using the manifest's entire `primaryBodyPartId === 'chest'` set was rejected because it would add two records the user explicitly omitted. Assigning Bodyweight Squat its manifest progression to Goblet Squat was rejected because the target belongs to a later legs batch and would violate this scope and current same-catalog reference validation.

### Separate authored catalog data from repository mechanics

Move the local record array and development-media constants into an exercise-focused `exercise-catalog.ts` module exporting one validated readonly catalog. `exercise-repository.ts` will retain the unchanged interface and immediate asynchronous list/exact-ID lookup implementation, importing that catalog rather than owning hundreds of lines of authored content.

This separation is warranted by 21 records with descriptions/instructions and keeps future body-part batches from obscuring repository behavior. Introducing a generic storage framework, generated source file, or runtime JSON loader was rejected because the catalog must remain locally typed, bundled, and validated without a backend or parsing layer.

Catalog order will be Bodyweight Squat first, preserving the current first record, followed by the selected 20 chest records in manifest order. Push-Up therefore remains second and keeps its stable route.

### Preserve existing fixtures while reconciling Push-Up

Bodyweight Squat remains byte-for-byte equivalent in identity, classifications, copy, thumbnail, and video metadata, with no progression/regression added. Push-Up retains its current ID, classifications, description, ordered instructions, thumbnail/alt text, and `video: null`; only `regressionExerciseId: 'incline-push-up'` is added from the approved manifest.

Creating a second canonical Push-Up was rejected because IDs/names must be unique and exercises appear once across batches. Rewriting Push-Up content or assigning it the bunny source was rejected because the request preserves existing detail behavior and applies the shared source to new exercises.

### Author original structured content for the 19 additions

Each added record will have one concise original description and an ordered set of concise instructions authored for Oscar Fitness, not copied or closely paraphrased from external websites. Instructions will cover setup, controlled execution, return/finish, and a brief form/range safety cue where relevant. Copy will avoid load prescriptions, medical claims, and unsupported coaching precision.

Content remains directly on typed records because descriptions and instructions are required domain data consumed by the existing detail component. Deferring prose to blank placeholders was rejected because it would produce incomplete detail screens; importing external text was rejected by requirement and provenance risk.

### Reuse bundled placeholder and development-video media deliberately

All 19 added records will reference the existing bundled Push-Up image source as a temporary local placeholder. Each record receives meaningful alternative text that identifies the image as a placeholder for that exercise rather than falsely describing an exact depiction. Push-Up and Bodyweight Squat retain their current thumbnail objects exactly.

All 19 added records use the existing `https://www.w3schools.com/html/mov_bbb.mp4` source, visible `Development playback sample - non-exercise media` label, and an exercise-specific accessibility label. Bodyweight Squat retains the same source/metadata and Push-Up remains `video: null`, preserving deterministic source-backed and unavailable states. Shared private helpers/constants may remove repeated source metadata without changing the `Exercise` model or player API.

Adding image/video assets, autoplay, exercise-specific media claims, or changing player behavior was rejected as out of scope.

### Preserve current discovery and rendering contracts

No filter or component contract changes. The expanded data produces these expected current behaviors:

- `All` shows 21 records; `Chest / upper body` shows 20; `Lower body` shows only Bodyweight Squat.
- Difficulty counts under `All` are 10 beginner, 10 intermediate, and 1 advanced; the chest-only counts are 9 beginner, 10 intermediate, and 1 advanced.
- Name search remains trimmed, case-insensitive substring matching and can find representative press, fly, crossover, dip, pullover, and push-up records.
- Shared equipment formatting covers bodyweight, barbell/bench, dumbbell/bench, cable, machine, smith-machine/bench, bodyweight/pull-up-dip-station, and bodyweight/weight-plate combinations in declared order.
- Existing cards/details render all 21 records; normalized body parts and relationships remain domain-only and are not added to the UI.
- `generateStaticParams` enumerates all 21 stable IDs while unknown lookup still resolves to `null` and the not-found screen.

Adding equipment/body-part filters, relationship links, catalog sorting, or a virtualized list was rejected because current eager rendering of 21 records remains acceptable for this bounded batch and those changes require separate design.

## Risks / Trade-offs

- [A transcription differs from the approved manifest] -> Use the JSON as source of truth, cross-check against CSV, and verify every selected classification/order field programmatically.
- [One invalid relationship prevents module import and static export] -> Verify the exact six populated fields and run the catalog factory plus static export before completion.
- [Large hand-authored fixture data becomes hard to review] -> Isolate it from repository mechanics, group records in manifest order, and verify counts/unique fields/classification snapshots.
- [Shared Push-Up imagery can misrepresent equipment movements] -> Use explicit placeholder alt text and keep dedicated media work out of this batch.
- [The bunny clip is not exercise instruction] -> Preserve the visible non-exercise development label and original written instructions; Push-Up continues to exercise unavailable media.
- [Twenty cards increase eager ScrollView work and static pages] -> Limit this change to 21 total records, export all routes, and defer virtualization until measured catalog growth requires it.
- [New content can be unsafe or derivative] -> Keep instructions original, concise, controlled, non-prescriptive, and review every record before completion.
- [Later batches can duplicate cross-body exercises] -> Treat stable ID as global identity and compare future batches against the accumulated catalog before adding records.

## Migration Plan

1. Extract the unchanged existing fixtures and local catalog constants into the exercise catalog data module without changing repository results.
2. Reconcile Push-Up's approved regression and add the 19 typed chest records in manifest order with original content and placeholder media.
3. Construct the complete 21-record array through `defineExerciseCatalog` and keep repository/static route adapters unchanged.
4. Run exact data, discovery, rendering, media, static export, and OpenSpec verification.

Rollback removes the 19 records, removes Push-Up's regression, and can inline the original two records back into the repository. No persisted data, dependency, taxonomy, route schema, or asset rollback is required.

## Open Questions

None. The remaining 196 manifest records, including two other chest-primary exercises, belong to separately approved batches.
