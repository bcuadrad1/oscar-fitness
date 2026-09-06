## Context

Oscar Fitness ships `LOCAL_EXERCISES` from `src/features/exercises/exercise-catalog.ts`, validates the complete array through `defineExerciseCatalog`, and exposes it through the immediate asynchronous `ExerciseRepository`. The current catalog has 21 unique IDs: preserved Bodyweight Squat followed by 20 seeded chest records. All 21 IDs occur in `docs/exercise-canonical-manifest.json`; the manifest has 216 records and unique IDs/names.

A programmatic stable-ID comparison, rather than a body-part or positional assumption, produced this baseline:

- Manifest IDs: 216
- Shipped catalog IDs: 21
- Intersection: 21
- Shipped IDs outside the manifest: 0
- Missing manifest IDs: 195

The exact missing set, grouped only for review while preserving manifest order within each group, is:

| Primary body part | Count | Missing stable IDs |
| --- | ---: | --- |
| `back` | 24 | `seated-lat-pulldown`, `wide-grip-lat-pulldown`, `close-grip-lat-pulldown`, `single-arm-lat-pulldown`, `straight-arm-pulldown`, `seated-cable-row`, `seated-row-machine`, `chest-supported-row-machine`, `high-row-machine`, `one-arm-dumbbell-row`, `chest-supported-dumbbell-row`, `barbell-bent-over-row`, `smith-machine-bent-over-row`, `t-bar-row`, `cable-high-row`, `pull-up`, `chin-up`, `assisted-pull-up`, `weighted-pull-up`, `barbell-deadlift`, `back-extension`, `dumbbell-shrug`, `barbell-shrug`, `trx-row` |
| `biceps` | 16 | `dumbbell-biceps-curl`, `alternating-dumbbell-curl`, `seated-dumbbell-curl`, `barbell-biceps-curl`, `ez-bar-curl`, `hammer-curl`, `cross-body-hammer-curl`, `incline-dumbbell-curl`, `concentration-curl`, `preacher-curl`, `dumbbell-preacher-curl`, `cable-biceps-curl`, `single-arm-cable-curl`, `rope-hammer-curl`, `high-cable-curl`, `machine-biceps-curl` |
| `calves` | 6 | `standing-calf-raise`, `seated-calf-raise`, `smith-machine-calf-raise`, `dumbbell-calf-raise`, `single-leg-calf-raise`, `leg-press-calf-raise` |
| `chest` | 2 | `medicine-ball-chest-pass`, `trx-chest-press` |
| `core` | 35 | `crunch`, `reverse-crunch`, `bicycle-crunch`, `sit-up`, `decline-sit-up`, `machine-ab-crunch`, `cable-crunch`, `front-plank`, `side-plank`, `plank-shoulder-tap`, `plank-hip-dip`, `dead-bug`, `bird-dog`, `hollow-body-hold`, `v-up`, `toe-touch-crunch`, `lying-leg-raise`, `hanging-knee-raise`, `hanging-leg-raise`, `captains-chair-knee-raise`, `ab-wheel-rollout`, `barbell-rollout`, `pallof-press`, `half-kneeling-pallof-press`, `cable-wood-chop`, `cable-low-to-high-chop`, `russian-twist`, `weighted-russian-twist`, `seated-medicine-ball-rotation`, `standing-medicine-ball-trunk-rotation`, `suitcase-carry`, `stability-ball-crunch`, `stability-ball-rollout`, `mountain-climber`, `trx-fallout` |
| `forearms` | 8 | `dumbbell-wrist-curl`, `dumbbell-reverse-wrist-curl`, `barbell-wrist-curl`, `barbell-reverse-wrist-curl`, `reverse-barbell-curl`, `reverse-dumbbell-curl`, `dead-hang`, `plate-pinch-hold` |
| `full-body` | 22 | `farmers-carry`, `burpee`, `bear-crawl`, `dumbbell-thruster`, `barbell-thruster`, `dumbbell-clean-and-press`, `kettlebell-clean-and-press`, `kettlebell-swing`, `turkish-get-up`, `half-turkish-get-up`, `kettlebell-figure-eight`, `landmine-thruster`, `renegade-row`, `dumbbell-devil-press`, `man-maker`, `battle-rope-alternating-waves`, `battle-rope-double-waves`, `battle-rope-slams`, `medicine-ball-slam`, `medicine-ball-overhead-throw`, `sled-push`, `sled-pull` |
| `glutes` | 6 | `hip-thrust`, `smith-machine-hip-thrust`, `glute-bridge`, `cable-pull-through`, `cable-glute-kickback`, `machine-glute-kickback` |
| `hamstrings` | 7 | `romanian-deadlift`, `dumbbell-romanian-deadlift`, `single-leg-romanian-deadlift`, `seated-leg-curl`, `lying-leg-curl`, `standing-single-leg-curl`, `nordic-hamstring-curl` |
| `hip-abductors` | 2 | `hip-abduction-machine`, `cable-hip-abduction` |
| `hip-adductors` | 2 | `hip-adduction-machine`, `cable-hip-adduction` |
| `quadriceps` | 19 | `goblet-squat`, `dumbbell-squat`, `barbell-back-squat`, `barbell-front-squat`, `smith-machine-squat`, `hack-squat`, `leg-press`, `single-leg-press`, `leg-extension`, `bulgarian-split-squat`, `split-squat`, `forward-lunge`, `reverse-lunge`, `walking-lunge`, `step-up`, `kettlebell-goblet-squat`, `box-jump`, `lateral-box-step-up`, `trx-squat` |
| `shoulders` | 29 | `cable-reverse-fly`, `reverse-pec-deck`, `incline-dumbbell-reverse-fly`, `seated-dumbbell-shoulder-press`, `standing-dumbbell-shoulder-press`, `barbell-overhead-press`, `seated-barbell-shoulder-press`, `smith-machine-shoulder-press`, `machine-shoulder-press`, `arnold-press`, `single-arm-dumbbell-shoulder-press`, `dumbbell-lateral-raise`, `cable-lateral-raise`, `single-arm-cable-lateral-raise`, `machine-lateral-raise`, `dumbbell-front-raise`, `cable-front-raise`, `plate-front-raise`, `dumbbell-rear-delt-fly`, `face-pull`, `cable-external-rotation`, `resistance-band-external-rotation`, `dumbbell-external-rotation`, `upright-row`, `cable-upright-row`, `dumbbell-upright-row`, `landmine-press`, `single-arm-landmine-press`, `kettlebell-halo` |
| `triceps` | 17 | `cable-triceps-pushdown`, `rope-triceps-pushdown`, `reverse-grip-triceps-pushdown`, `single-arm-cable-pushdown`, `overhead-cable-triceps-extension`, `dumbbell-overhead-triceps-extension`, `single-arm-dumbbell-overhead-extension`, `dumbbell-triceps-kickback`, `barbell-skull-crusher`, `dumbbell-skull-crusher`, `close-grip-bench-press`, `machine-triceps-extension`, `assisted-dip`, `bench-dip`, `triceps-dip`, `weighted-dip`, `diamond-push-up` |

The manifest defines 29 populated progression/regression fields across 25 exercises. Existing chest records already represent their six manifest fields exactly. Bodyweight Squat is the only current classification divergence: its manifest progression is `goblet-squat`, omitted previously because that target was not shipped. Once the target is added, exact parity requires adding only that relationship while preserving the fixture's identity, copy, other classifications, thumbnail, and video.

## Goals / Non-Goals

**Goals:**

- Add exactly the 195 stable-ID difference and produce a 216-record catalog whose IDs and classification fields exactly equal the manifest.
- Preserve the current 21 records and order as the catalog prefix, except for Bodyweight Squat's now-resolvable canonical progression.
- Author concise original descriptions and ordered instructions for every addition.
- Keep data maintainable, typed, bundled, and separate from repository mechanics.
- Preserve existing library/detail behavior and validate the larger catalog comprehensively.

**Non-Goals:**

- New filters, taxonomy values, sorting, pagination, virtualization, redesign, or relationship UI.
- Exercise-specific image/video production, routines, workout execution/history, accounts, persistence, APIs, gamification, or distance prescriptions.
- Changing repository interfaces, promise behavior, route shapes, playback behavior, or existing authored exercise copy.

## Decisions

### Generate manifest-owned fields into checked-in typed source

Use a deterministic authoring-time Node generator to read the approved JSON manifest, derive the 195-record difference against the explicitly preserved shipped-record source, combine it with locally authored content keyed by stable ID, and emit checked-in TypeScript catalog modules grouped into practical review-sized units. Every emitted module begins with a clear generated-source header that identifies the generator and states that the file must not be manually edited. The app imports only generated TypeScript and existing typed records; neither the manifest nor authoring inputs are loaded at runtime.

The generator will copy `id`, `name`, primary body part, ordered secondary body parts, difficulty, ordered equipment, progression, and regression without reclassification logic. Null relationships become omitted optional fields in TypeScript but normalize back to null for parity checks. Generation uses fixed ordering, formatting, line endings, and serialization so it is deterministic and idempotent: with unchanged manifest and authored-content inputs, every run produces byte-for-byte identical output. Check mode renders the expected files without writing and byte-compares them with the checked-in generated modules, failing when any output is absent, extra, or stale.

Manual transcription of 195 classification sets was rejected because it invites order and relationship drift. Runtime JSON loading was rejected because the manifest is a planning artifact and would weaken the established typed, bundled architecture. Adding an npm, runtime, or code-generation dependency or framework was rejected; the repository's existing Node and TypeScript toolchain capabilities are sufficient.

### Preserve existing records and compose one final catalog

Keep the current 21 records as the preserved prefix and append the 195 generated records in their original manifest order. Existing canonical records are not regenerated or duplicated. Add `progressionExerciseId: 'goblet-squat'` to Bodyweight Squat as the only required existing-record classification reconciliation.

Compose preserved and generated groups into one readonly array and pass that complete array through `defineExerciseCatalog` exactly once. Extend that boundary to reject duplicate canonical names in addition to its existing duplicate-ID, body-part, equipment, self-reference, and missing-target checks. Repository and static-route consumers continue importing the one validated catalog export.

Reordering all 216 records into manifest order was rejected because set and field parity do not require it and preserving the current prefix minimizes visible and review churn. Splitting validation by body part was rejected because cross-group relationships require one final integrity boundary.

### Keep authored prose explicit and stable-ID keyed

Maintain one explicit description and one explicit ordered instruction list for every one of the 195 missing IDs in authoring data consumed by the generator. Copy must be original Oscar Fitness prose, concise, movement-specific, and cover setup, controlled execution, and finish/return guidance without medical claims, load prescriptions, or external-site phrasing. Generation fails for a missing content key, an extra content key, an empty description, or an empty instruction list. It has no generic fallback and never synthesizes template descriptions or instructions when authored content is absent. Similar movements may share appropriate terminology, but each instruction sequence remains specific to that movement.

Purely templated or fallback prose was rejected because movements with similar names still need accurate exercise-specific setup and cues, and silent generation would conceal incomplete authoring. Inline hand-authored classification and prose for all 195 records was rejected because it obscures review of manifest-owned versus Oscar-authored fields.

### Reuse current media without changing presentation contracts

Every one of the 195 additions uses the bundled Push-Up image through the existing placeholder strategy, with alt text naming that exercise and identifying the image as a placeholder. Every addition uses the existing bunny development URL, exact visible `Development playback sample - non-exercise media` label, and an exercise-specific accessibility label. Bodyweight Squat, Push-Up, and all seeded chest media assignments remain unchanged; Push-Up remains the sole unavailable-video fixture.

Shared media factories/constants are acceptable inside catalog data modules, but the `Exercise` shape and `ExerciseVideo` component remain unchanged. New assets and exercise-specific media claims were rejected as out of scope.

### Derive display body areas without expanding filters

The manifest owns normalized body-part classifications but not `targetBodyArea` or `category`. Preserve existing values for current records and assign `Strength` to additions. Assign additions deterministically by primary body part:

- `Lower body`: quadriceps, hamstrings, glutes, hip abductors, hip adductors, calves (43 final records).
- `Chest / upper body`: chest, back, shoulders, biceps, triceps, forearms (116 final records).
- `Core`: core (35 final records).
- `Full body`: full-body (22 final records).

Do not add `Core` or `Full body` filter options. The existing body-area filter remains an exact match over its current `All`, `Lower body`, and `Chest / upper body` choices: `All` exposes all 216, while the two existing restrictive choices expose the corresponding 43 and 116 records. Search and difficulty filtering retain their current AND semantics and input-order preservation.

Forcing core/full-body records into an inaccurate existing body area was rejected. Adding filter options or a new body-part filter was rejected by scope.

### Make parity verification reproducible

Add a deterministic verification command/script that normalizes the final catalog's optional relationship fields to manifest nulls and compares all 216 records by stable ID. It will assert exact ID-set equality, count 216, unique IDs/names, exact manifest field parity including array order, no extra relationships, approved taxonomy membership, relationship resolution/non-self-reference, expected difficulty totals (100 beginner, 97 intermediate, 19 advanced), and successful catalog construction.

The same verification layer will exercise exact repository lookup for every stable ID plus unknown-ID null behavior, representative name searches across requested primary-body-part groups, all difficulty filters, and unchanged body-area semantics. Existing UI/export verification will cover cards, details, media/accessibility across every equipment category and 216 static detail parameters plus the dynamic fallback.

Relying only on TypeScript and visual review was rejected because those checks cannot prove manifest set and ordered-field parity. Snapshotting only counts was rejected because equal counts can conceal substitutions.

## Risks / Trade-offs

- [Generated classification source diverges from the manifest or is manually edited] -> Mark every generated module as generated/do-not-edit, regenerate deterministically, and run byte-comparing check mode plus final stable-ID parity verification.
- [Generation is environment- or run-order-dependent] -> Use fixed ordering/formatting/line endings and verify two runs from unchanged inputs are byte-for-byte identical without adding a dependency.
- [Authored content is missing, repetitive, inaccurate, or derivative] -> Require one explicit stable-ID-keyed entry per addition, provide no fallback synthesis, fail on missing/extra/empty content, and review all prose for movement specificity and originality before generation is accepted.
- [A cross-group relationship breaks module initialization] -> Assemble all groups before one `defineExerciseCatalog` call and verify all 29 manifest fields against the final ID set.
- [The 216-card `ScrollView` or 216-page export becomes slow] -> Measure through representative device/web smoke checks and full static export; keep virtualization/pagination as separate measured work because it is explicitly out of scope.
- [Placeholder imagery or bunny video is mistaken for instruction] -> Keep meaningful placeholder alt text, exercise-specific accessibility labels, original written instructions, and the exact visible non-exercise label.
- [Body-area choices do not cover core/full-body records] -> Keep those records available through `All` and search, document exact semantics, and defer any filter expansion to a separate change.
- [Large generated diffs are hard to review] -> Group modules predictably, preserve manifest order within the generated set, keep generated classifications separate from authored prose inputs, and provide machine parity output.

## Migration Plan

1. Record the 21-ID baseline and 195-ID manifest difference in the generation/verification workflow.
2. Separate the preserved record group as needed without changing values or order, and add only Bodyweight Squat's canonical progression reconciliation.
3. Author and review stable-ID-keyed descriptions/instructions for all 195 additions.
4. Generate checked-in typed catalog modules with generated/do-not-edit headers, prove repeat generation is byte-stable, compose all 216 records through `defineExerciseCatalog`, and leave repository/route/component contracts intact.
5. Run data parity, repository, discovery, rendering, accessibility, static export, TypeScript, lint, diff, and strict OpenSpec verification.

Rollback removes the generated 195-record modules and Bodyweight Squat progression while restoring the current 21-record composition. No persisted data, dependency, API, route schema, or asset migration is involved.

## Open Questions

None.
