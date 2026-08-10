## Context

The exercise feature currently defines two display-oriented body-area values, two title-cased difficulty values, and one free-form equipment string on each `Exercise`. The local repository contains Bodyweight Squat and Push-Up, exposes asynchronous list and exact-ID lookup methods, and is injected at the Exercises stack boundary. Library filtering and card/detail presentation read classification fields directly from each record.

This change is a data-model foundation, not a catalog or interface expansion. It must support normalized classifications and future movement relationships while preserving the repository contract, stable fixture IDs, static route generation, current discovery state, detail/media behavior, and visual presentation. There is no persisted exercise data to migrate and no configured automated test runner; current verification relies on strict TypeScript, Expo lint, static export, OpenSpec validation, and platform smoke checks.

## Goals / Non-Goals

**Goals:**

- Define stable, typed body-part, difficulty, and equipment taxonomies suitable for a larger commercial-gym catalog.
- Require one primary body part, allow unique secondary body parts, and allow multiple equipment requirements.
- Allow optional stable-ID references to a harder progression and easier regression.
- Preserve all existing exercise content, local repository behavior, routes, search/filter flows, cards, details, and video states.
- Migrate the two existing fixtures without adding or removing exercises.

**Non-Goals:**

- Adding catalog records, new filter dimensions, body-part discovery UI, or a UI redesign.
- Resolving or navigating progression/regression relationships in the interface.
- Routine creation or execution, guided workouts, workout tracking, accounts, APIs, databases, or persistence.
- Runtime schema validation for an external data source or a general taxonomy administration system.

## Decisions

### Store stable taxonomy IDs and keep labels at the domain boundary

The exercise module will export readonly taxonomy definitions with stable lowercase kebab-case IDs and human-readable labels. `ExerciseBodyPartId` and `ExerciseEquipmentId` will be closed unions tied to those definitions, while `ExerciseDifficulty` will be exactly `'beginner' | 'intermediate' | 'advanced'`. Shared lookup/formatting helpers will provide labels to filters, cards, details, and accessibility text.

The initial body-part taxonomy will cover `full-body`, `neck`, `chest`, `back`, `shoulders`, `biceps`, `triceps`, `forearms`, `core`, `glutes`, `quadriceps`, `hamstrings`, `calves`, `hip-flexors`, `hip-adductors`, and `hip-abductors`, with title-cased labels matching those names. These are broad exercise-classification targets rather than a medical muscle ontology; future catalog work can propose additional stable entries without changing existing IDs.

The equipment taxonomy will define `bodyweight`, `dumbbell`, `barbell`, `cable`, `machine`, `smith-machine`, `kettlebell`, `resistance-band`, `bench`, `pull-up-dip-station`, and `other`, with labels `Bodyweight`, `Dumbbell`, `Barbell`, `Cable`, `Machine`, `Smith machine`, `Kettlebell`, `Resistance band`, `Bench`, `Pull-up / dip station`, and `Other`. `bodyweight` identifies body mass as the resistance source and can coexist with apparatus such as a pull-up/dip station. When it is the sole equipment value, the display formatter preserves the current "Bodyweight / no equipment" copy. `other` may coexist with known entries when an exercise needs both a known item and one not yet represented by the taxonomy.

Embedding labels directly in every exercise was rejected because spelling or presentation changes would become record migrations. Accepting arbitrary strings was rejected because it would preserve the current inconsistency and prevent exhaustive type checking.

### Extend the existing record without replacing presentation content

The `Exercise` model will retain `id`, `name`, `targetBodyArea`, `category`, `description`, ordered `instructions`, `thumbnail`, and nullable `video`. It will replace title-cased difficulty and free-form equipment data with canonical values and add normalized body-part and relationship fields:

```ts
type Exercise = {
  id: string;
  name: string;
  targetBodyArea: string;
  category: string;
  primaryBodyPartId: ExerciseBodyPartId;
  secondaryBodyPartIds: readonly ExerciseBodyPartId[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipmentIds: readonly [ExerciseEquipmentId, ...ExerciseEquipmentId[]];
  description: string;
  instructions: readonly string[];
  thumbnail: ExerciseThumbnail;
  video: ExerciseVideo | null;
  progressionExerciseId?: string;
  regressionExerciseId?: string;
};
```

`targetBodyArea` remains because it drives the existing coarse body-area filter and metadata copy, and `category` remains because it is existing exercise information. Their current fixture values stay exactly `Lower body`, `Chest / upper body`, and `Strength`, but the record fields are widened from the current two-value and one-value unions so those legacy presentation classifications do not block future catalog records. The existing filter retains its closed current options independently. Normalizing body area or category, or deriving filters from the body-part registry, remains future discovery work.

An equipment tuple is non-empty: exercises without external apparatus use `bodyweight`, while exercises such as a dumbbell bench movement can use multiple IDs such as `['dumbbell', 'bench']` and a pull-up can use `['bodyweight', 'pull-up-dip-station']`. IDs remain in author-defined display order. Empty arrays and a separate "no equipment" sentinel were rejected because a valid exercise must classify its resistance or required apparatus.

### Define record integrity without adding a graph service

Every record must have exactly one primary body-part ID. Secondary IDs are optional by cardinality through an empty-or-populated readonly array, must be unique, and must not repeat the primary ID. Equipment IDs must also be unique.

`progressionExerciseId` and `regressionExerciseId` are optional stable exercise IDs. A populated progression points to a harder related movement and a populated regression points to an easier related movement; neither may self-reference. The fields do not have to be reciprocal and are not inferred or validated from the three difficulty values because movement complexity can vary within one level; harder/easier is catalog-authored semantics. No repository method or UI is added to traverse these links.

The local fixture array will be constructed through a small catalog assertion/factory that returns the same ordered record references after rejecting duplicate exercise IDs, duplicate secondary body parts, a primary body part repeated as secondary, duplicate equipment IDs, self relationships, and relationship IDs absent from that catalog. This supplies runtime guarantees that unions and `satisfies` cannot provide without changing repository list/lookup behavior. External response validation remains deferred until an external repository exists.

A nested relationship object and arrays of progression IDs were rejected because the requested foundation calls for at most one direct progression and one direct regression. Embedding related `Exercise` objects was rejected because it would duplicate records and create recursive payloads.

### Preserve repository and screen contracts through formatters

`ExerciseRepository` remains exactly asynchronous with `listExercises(): Promise<readonly Exercise[]>` and `getExerciseById(id: string): Promise<Exercise | null>`. Local list order, exact case-sensitive lookup, successful `null` for unknown IDs, replacement at the stack provider, loading/error/retry states, and static route generation remain unchanged.

The existing body-area filter remains intact. Difficulty filter state uses canonical values and includes all three allowed difficulties, while controls render `Beginner`, `Intermediate`, and `Advanced` through shared labels. This extends the existing difficulty dimension rather than adding a new filter. Cards and details preserve declared equipment order and join every resolved label into readable metadata and accessibility text; a sole `bodyweight` value continues to display exactly "Bodyweight / no equipment." Primary/secondary body parts and progression/regression links are not added to the UI in this change.

Keeping duplicate display strings on each fixture was rejected because cards, details, and accessibility copy could drift. Changing component layout to expose the new taxonomy was rejected as a UI redesign outside this scope.

### Migrate the two fixtures in place

Bodyweight Squat retains ID `bodyweight-squat`, current body area/category, beginner difficulty, all copy and media, and uses primary `quadriceps`, secondary `glutes`, `hamstrings`, and `core`, plus equipment `bodyweight`. Push-Up retains ID `push-up`, current body area/category, beginner difficulty, all copy and media, and uses primary `chest`, secondary `triceps`, `shoulders`, and `core`, plus equipment `bodyweight`.

Both fixtures omit progression and regression because they are unrelated movements and no additional catalog records are in scope. Linking them merely to demonstrate the fields was rejected because it would encode false exercise guidance.

### Use existing verification infrastructure

Readonly taxonomy constants and fixture arrays will use TypeScript exhaustiveness and `satisfies` checks, while the catalog factory supplies runtime collection and relationship checks. Implementation verification will run TypeScript, Expo lint, a static web export, and strict OpenSpec validation, then exercise the validator with temporary invalid in-memory catalogs and smoke-check the two fixtures, filter values, repository list/lookup/null behavior, cards, details, and video states. A temporary typed multi-equipment value will exercise shared formatters/components without entering the shipped repository. Introducing a test framework solely for this model migration was rejected as unrelated infrastructure.

## Risks / Trade-offs

- [The retained presentation-only `targetBodyArea` can disagree with normalized body parts] -> Keep the two migrated fixtures aligned, avoid restricting future domain records to today's filter values, and defer body-area normalization to the explicitly out-of-scope filter change.
- [Closed taxonomy unions require a code change for new values] -> Use stable IDs and central registries so additions are deliberate, exhaustive, and do not rewrite existing records.
- [TypeScript cannot prove uniqueness or cross-record referential integrity] -> Construct the local catalog through the assertion/factory and exercise each rejection path with temporary invalid values; define external payload validation only when an external repository is introduced.
- [Multiple equipment labels can make current metadata rows longer] -> Join labels with a concise separator and rely on the existing wrapping card/detail layouts; verify narrow and wide screens without redesigning them.
- [Adding `advanced` exposes a filter value with no matching fixture] -> Preserve the existing no-results/reset behavior; adding an artificial advanced record is outside scope.
- [Changing the `Exercise` shape affects future repository implementations] -> There are no external consumers or persisted records today, and the repository method signatures and route state contracts remain stable.

## Migration Plan

1. Add taxonomy registries, canonical ID types, labels, the expanded `Exercise` shape, and the local catalog assertion/factory.
2. Migrate Bodyweight Squat and Push-Up to canonical difficulty/equipment values, body-part assignments, and omitted relationship fields while preserving all other content.
3. Adapt existing difficulty filter state and card/detail/accessibility formatting to taxonomy labels and equipment arrays.
4. Run catalog integrity checks, static checks, export, strict spec validation, and focused repository and screen verification.

Rollback restores the prior type fields and two fixture classifications plus their direct screen formatting. No data rollback, route migration, or dependency removal is required because the catalog is local and unpersisted.

## Open Questions

None. Body-area normalization, richer anatomical granularity, relationship navigation, runtime API validation, and catalog authoring are future changes.
