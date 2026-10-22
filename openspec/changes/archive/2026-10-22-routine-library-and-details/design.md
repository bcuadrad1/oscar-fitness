## Context

The Routines tab currently renders three synchronous preview records from `src/data/mvp-content.ts` through `src/app/routines.tsx`. Those records have no ordered prescriptions, canonical exercise references, ownership, repository abstraction, detail route, or mutation behavior. `full-body-basics` is a practical identity to preserve, while `upper-body-builder` does not fit the approved focus taxonomy and `mobility-reset` cannot be supported accurately by the strength-oriented exercise catalog.

The exercise feature establishes the architecture this change should follow: `LOCAL_EXERCISES` is one validated 216-record catalog; `ExerciseRepository` provides immediately resolving asynchronous list and exact-ID lookup methods; pure filtering remains outside the repository; a stack-scoped provider owns discovery state; route adapters distinguish loading, error, and not-found states; and `src/app/exercises/` provides nested index/detail routes without changing its primary tab. Routine details must reuse those exercise contracts instead of copying exercise names, equipment, or taxonomy into routine data.

This change introduces the first mutable and durable domain behavior in the app: device-local user-owned copies of immutable bundled defaults. There is still no account, backend, cloud sync, cross-device synchronization, routine builder, or workout execution model. The seed prescriptions are conservative general-fitness templates: they prescribe reps or time, sets, and rest, but no weight, distance, completed performance, or medical outcome.

## Goals / Non-Goals

**Goals:**

- Define a typed routine domain that distinguishes immutable defaults from mutable user-owned copies and keeps routine level separate from exercise difficulty.
- Seed exactly 24 validated default routines spanning the nine approved focuses, with 109 ordered entries referencing only canonical exercise IDs.
- Support asynchronous initialization, list, exact lookup, and persistence-atomic default-copy behavior through an injectable local repository and storage boundary.
- Persist only validated user-owned routines on-device so successful copies remain available with unchanged identity and metadata after repository or app reconstruction.
- Prevent list, lookup, and copy results from exposing mutable aliases to repository-owned user state.
- Present a responsive routine library with focus and level filters and make successful copies visible immediately and after restart.
- Add directly addressable static detail pages for bundled defaults plus native and client-side runtime details for persisted user copies; project current exercise names and equipment through `ExerciseRepository`, render both prescription variants, and link to existing exercise details.
- Preserve the Routines primary tab, existing exercise catalog and repository contracts, and the app's current offline-first local behavior.
- Add only the Expo-supported `@react-native-async-storage/async-storage` dependency required for small cross-platform persistent key-value storage.

**Non-Goals:**

- Backend services, APIs, remote databases, authentication, accounts, membership, authorization, cloud sync, cross-device synchronization, or persistence of bundled defaults.
- Creating from scratch, editing, reordering, deleting, sharing, importing, or exporting routines; copying a default is the only user-record creation behavior.
- Guided workout execution, active-session state, timers, interval orchestration, set completion, workout history, personal records, analytics, favorites, progress tracking, or gamification.
- Scheduling, calendars, multi-day programs, progression logic, automatic load selection, coaching, or adaptive recommendations.
- Actual reps, weight, load, duration, rest taken, substitutions, completion state, or other execution results in the routine template model.
- Distance prescriptions, distance units, weight prescriptions, weight units, or conversion behavior. The entry union remains extensible for a separately designed future change.
- Medical claims, rehabilitation framing, mobility or recovery promises, or exercise combinations designed around injury treatment.
- Changes to `Exercise`, `ExerciseDifficulty`, `ExerciseRepository`, `LOCAL_EXERCISES`, exercise taxonomy, exercise filters, exercise media, or existing exercise routes.
- A primary-navigation redesign, changes to Home or Admin content, unrelated visual-system changes, or new exercise/routine media production.

## Decisions

### Model ownership and prescriptions as independent discriminated unions

Routine ownership is represented by `ownership`, not inferred from ID shape, collection location, or nullable timestamps. Routine levels are their own taxonomy because routine programming demand is not the same concept as an individual exercise's `ExerciseDifficulty` and adds `experienced` without changing the exercise contract.

```ts
type RoutineLevel = 'beginner' | 'intermediate' | 'advanced' | 'experienced';
type RoutineFocus =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'full-body';

type RoutineExerciseBase = {
  id: string;
  order: number;
  exerciseId: string;
  sets: number;
  restSeconds?: number;
  notes?: string;
};

type RoutineExercise =
  | (RoutineExerciseBase & {
      prescriptionType: 'reps';
      targetReps: number;
      targetDurationSeconds?: never;
    })
  | (RoutineExerciseBase & {
      prescriptionType: 'timed';
      targetDurationSeconds: number;
      targetReps?: never;
    });

type RoutineBase = {
  id: string;
  name: string;
  description: string;
  focus: RoutineFocus;
  level: RoutineLevel;
  estimatedDurationMinutes?: number;
  exercises: RoutineExercise[];
};

type DefaultRoutine = RoutineBase & {
  ownership: 'default';
  createdAt?: never;
  updatedAt?: never;
  sourceRoutineId?: never;
};

type UserRoutine = RoutineBase & {
  ownership: 'user';
  createdAt: string;
  updatedAt: string;
  sourceRoutineId?: string;
};

type Routine = DefaultRoutine | UserRoutine;
```

Every entry has a stable ID and explicit 1-based order. Validation requires unique routine IDs, unique entry IDs, nonempty names/descriptions, valid focus/level values, at least one entry, and exactly contiguous orders `1..n` with no gaps or duplicates. `sets`, `targetReps`, and `targetDurationSeconds` are positive integers; `restSeconds` is a nonnegative integer; an estimate, when present, is a positive integer; and optional notes must be nonblank. The prescription discriminator enforces that exactly one target field exists. Routine entries contain only the exercise reference and prescription data, never duplicated exercise name, equipment, difficulty, media, or instructions.

Timestamps belong only to user routines. A copied user record may retain `sourceRoutineId` for provenance, while an independently created future user routine may omit it. Future workout-execution records may reference routine ID, routine-entry ID, and exercise ID, but actual reps, weight, elapsed duration, rest taken, and exercise substitutions belong to those future execution records rather than this template model.

Inferring ownership from timestamps was rejected because malformed states remain representable. Reusing `ExerciseDifficulty` was rejected because it would either omit `experienced` or incorrectly alter exercise taxonomy. A single entry shape with nullable reps and duration was rejected because it permits both or neither. Adding distance now was rejected because its units and rendering contract are not part of this change.

### Validate and deeply freeze one default catalog boundary

`DEFAULT_ROUTINES` is created through one catalog-definition boundary that receives the authored default inputs and the complete `LOCAL_EXERCISES` collection. It validates all routine and entry invariants, builds the allowed exercise-ID set from `LOCAL_EXERCISES`, rejects every missing exercise reference, and recursively freezes every default routine, nested exercise entry, and array before returning the catalog. No route, component, or repository repeats catalog validation or receives a mutable alias to default data.

Seed entry IDs use the stable convention `<routine-id>-NN`, with two-digit 1-based order. User copies receive new injected IDs for both the routine and every copied entry; default entry IDs therefore remain durable references rather than becoming shared identities across routines.

Compile-time `readonly` alone was rejected because it does not prevent runtime mutation. Validating against the planning manifest at runtime was rejected because the app's source of truth is the shipped `LOCAL_EXERCISES`; the manifest remains an authoring and verification input. Loading routine data from JSON at runtime or adding a schema-validation dependency was rejected because a small typed validator is sufficient and consistent with `defineExerciseCatalog`.

### Seed the exact conservative 24-routine matrix

The rationale column is the stored `description`; every listed estimate is `estimatedDurationMinutes`. Entry order below is both execution order and the explicit `order` value. A unilateral note means the target applies independently to each side.

#### Chest

| Stable ID | Name | Level | Min | Rationale / description | Ordered entries |
| --- | --- | --- | ---: | --- | --- |
| `chest-foundations` | Chest Foundations | `beginner` | 30 | Stable pressing and fly variations provide modest, approachable volume. | 1. `{ id: chest-foundations-01; order: 1; exerciseId: incline-push-up; prescriptionType: reps; sets: 2; targetReps: 10; restSeconds: 60 }`<br>2. `{ id: chest-foundations-02; order: 2; exerciseId: machine-chest-press; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 75 }`<br>3. `{ id: chest-foundations-03; order: 3; exerciseId: incline-dumbbell-press; prescriptionType: reps; sets: 2; targetReps: 10; restSeconds: 75 }`<br>4. `{ id: chest-foundations-04; order: 4; exerciseId: pec-deck-machine-fly; prescriptionType: reps; sets: 2; targetReps: 12; restSeconds: 60 }` |
| `balanced-chest-strength` | Balanced Chest Strength | `intermediate` | 35 | Two press angles, a fly, and a bodyweight finish cover the chest without excessive volume. | 1. `{ id: balanced-chest-strength-01; order: 1; exerciseId: dumbbell-bench-press; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 90 }`<br>2. `{ id: balanced-chest-strength-02; order: 2; exerciseId: incline-barbell-bench-press; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 90 }`<br>3. `{ id: balanced-chest-strength-03; order: 3; exerciseId: cable-chest-fly; prescriptionType: reps; sets: 3; targetReps: 12; restSeconds: 60 }`<br>4. `{ id: balanced-chest-strength-04; order: 4; exerciseId: push-up; prescriptionType: reps; sets: 2; targetReps: 12; restSeconds: 60 }` |
| `chest-strength-and-control` | Chest Strength and Control | `advanced` | 45 | A lower-rep primary press precedes complementary presses and controlled accessory work. | 1. `{ id: chest-strength-and-control-01; order: 1; exerciseId: barbell-bench-press; prescriptionType: reps; sets: 4; targetReps: 6; restSeconds: 120 }`<br>2. `{ id: chest-strength-and-control-02; order: 2; exerciseId: incline-dumbbell-press; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 90 }`<br>3. `{ id: chest-strength-and-control-03; order: 3; exerciseId: chest-dip; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 90 }`<br>4. `{ id: chest-strength-and-control-04; order: 4; exerciseId: cable-crossover; prescriptionType: reps; sets: 3; targetReps: 12; restSeconds: 60 }` |

#### Back

| Stable ID | Name | Level | Min | Rationale / description | Ordered entries |
| --- | --- | --- | ---: | --- | --- |
| `back-foundations` | Back Foundations | `beginner` | 35 | Supported vertical and horizontal pulls limit complexity while extension and hanging round out the session. | 1. `{ id: back-foundations-01; order: 1; exerciseId: seated-lat-pulldown; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 75 }`<br>2. `{ id: back-foundations-02; order: 2; exerciseId: seated-cable-row; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 75 }`<br>3. `{ id: back-foundations-03; order: 3; exerciseId: chest-supported-dumbbell-row; prescriptionType: reps; sets: 2; targetReps: 10; restSeconds: 75 }`<br>4. `{ id: back-foundations-04; order: 4; exerciseId: back-extension; prescriptionType: reps; sets: 2; targetReps: 12; restSeconds: 60 }`<br>5. `{ id: back-foundations-05; order: 5; exerciseId: dead-hang; prescriptionType: timed; sets: 2; targetDurationSeconds: 20; restSeconds: 45 }` |
| `pull-and-row-balance` | Pull and Row Balance | `intermediate` | 35 | Assisted vertical pulling, unilateral rowing, and supported pulling provide balanced progression. | 1. `{ id: pull-and-row-balance-01; order: 1; exerciseId: assisted-pull-up; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 90 }`<br>2. `{ id: pull-and-row-balance-02; order: 2; exerciseId: one-arm-dumbbell-row; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 75; notes: "Reps per side." }`<br>3. `{ id: pull-and-row-balance-03; order: 3; exerciseId: t-bar-row; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 90 }`<br>4. `{ id: pull-and-row-balance-04; order: 4; exerciseId: face-pull; prescriptionType: reps; sets: 3; targetReps: 12; restSeconds: 60 }` |
| `back-strength-and-control` | Back Strength and Control | `advanced` | 50 | Harder vertical and free-weight pulls come first; supported and cable work control later-session fatigue. | 1. `{ id: back-strength-and-control-01; order: 1; exerciseId: pull-up; prescriptionType: reps; sets: 4; targetReps: 6; restSeconds: 120 }`<br>2. `{ id: back-strength-and-control-02; order: 2; exerciseId: barbell-bent-over-row; prescriptionType: reps; sets: 4; targetReps: 6; restSeconds: 120 }`<br>3. `{ id: back-strength-and-control-03; order: 3; exerciseId: chest-supported-row-machine; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 75 }`<br>4. `{ id: back-strength-and-control-04; order: 4; exerciseId: straight-arm-pulldown; prescriptionType: reps; sets: 3; targetReps: 12; restSeconds: 60 }`<br>5. `{ id: back-strength-and-control-05; order: 5; exerciseId: barbell-shrug; prescriptionType: reps; sets: 2; targetReps: 10; restSeconds: 75 }` |

#### Shoulders

| Stable ID | Name | Level | Min | Rationale / description | Ordered entries |
| --- | --- | --- | ---: | --- | --- |
| `shoulder-foundations` | Shoulder Foundations | `beginner` | 25 | A stable press plus lateral, rear-shoulder, and external-rotation work covers major shoulder functions. | 1. `{ id: shoulder-foundations-01; order: 1; exerciseId: machine-shoulder-press; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 75 }`<br>2. `{ id: shoulder-foundations-02; order: 2; exerciseId: dumbbell-lateral-raise; prescriptionType: reps; sets: 2; targetReps: 12; restSeconds: 60 }`<br>3. `{ id: shoulder-foundations-03; order: 3; exerciseId: reverse-pec-deck; prescriptionType: reps; sets: 2; targetReps: 12; restSeconds: 60 }`<br>4. `{ id: shoulder-foundations-04; order: 4; exerciseId: resistance-band-external-rotation; prescriptionType: reps; sets: 2; targetReps: 12; restSeconds: 45; notes: "Reps per side." }` |
| `balanced-shoulder-strength` | Balanced Shoulder Strength | `intermediate` | 35 | Standing pressing and focused lateral and rear-shoulder work balance strength and control. | 1. `{ id: balanced-shoulder-strength-01; order: 1; exerciseId: standing-dumbbell-shoulder-press; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 90 }`<br>2. `{ id: balanced-shoulder-strength-02; order: 2; exerciseId: single-arm-cable-lateral-raise; prescriptionType: reps; sets: 3; targetReps: 12; restSeconds: 60; notes: "Reps per side." }`<br>3. `{ id: balanced-shoulder-strength-03; order: 3; exerciseId: cable-reverse-fly; prescriptionType: reps; sets: 3; targetReps: 12; restSeconds: 60 }`<br>4. `{ id: balanced-shoulder-strength-04; order: 4; exerciseId: face-pull; prescriptionType: reps; sets: 2; targetReps: 12; restSeconds: 60 }` |

#### Biceps

| Stable ID | Name | Level | Min | Rationale / description | Ordered entries |
| --- | --- | --- | ---: | --- | --- |
| `biceps-basics` | Biceps Basics | `beginner` | 20 | Three accessible curl variations provide a restrained seven working sets. | 1. `{ id: biceps-basics-01; order: 1; exerciseId: dumbbell-biceps-curl; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 60 }`<br>2. `{ id: biceps-basics-02; order: 2; exerciseId: cable-biceps-curl; prescriptionType: reps; sets: 2; targetReps: 12; restSeconds: 60 }`<br>3. `{ id: biceps-basics-03; order: 3; exerciseId: rope-hammer-curl; prescriptionType: reps; sets: 2; targetReps: 12; restSeconds: 60 }` |
| `varied-curl-strength` | Varied Curl Strength | `intermediate` | 30 | Bar, incline, cross-body, and machine positions add useful variation without advanced-only techniques. | 1. `{ id: varied-curl-strength-01; order: 1; exerciseId: ez-bar-curl; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 75 }`<br>2. `{ id: varied-curl-strength-02; order: 2; exerciseId: incline-dumbbell-curl; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 75 }`<br>3. `{ id: varied-curl-strength-03; order: 3; exerciseId: cross-body-hammer-curl; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 60; notes: "Reps per side." }`<br>4. `{ id: varied-curl-strength-04; order: 4; exerciseId: machine-biceps-curl; prescriptionType: reps; sets: 2; targetReps: 12; restSeconds: 60 }` |

#### Triceps

| Stable ID | Name | Level | Min | Rationale / description | Ordered entries |
| --- | --- | --- | ---: | --- | --- |
| `triceps-basics` | Triceps Basics | `beginner` | 20 | Pushdown, overhead, and assisted compound patterns provide broad but modest exposure. | 1. `{ id: triceps-basics-01; order: 1; exerciseId: cable-triceps-pushdown; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 60 }`<br>2. `{ id: triceps-basics-02; order: 2; exerciseId: dumbbell-overhead-triceps-extension; prescriptionType: reps; sets: 2; targetReps: 10; restSeconds: 60 }`<br>3. `{ id: triceps-basics-03; order: 3; exerciseId: assisted-dip; prescriptionType: reps; sets: 2; targetReps: 8; restSeconds: 75 }` |
| `triceps-press-and-extend` | Triceps Press and Extend | `intermediate` | 30 | Compound presses lead while two cable movements provide controlled finishing volume. | 1. `{ id: triceps-press-and-extend-01; order: 1; exerciseId: close-grip-bench-press; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 90 }`<br>2. `{ id: triceps-press-and-extend-02; order: 2; exerciseId: triceps-dip; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 90 }`<br>3. `{ id: triceps-press-and-extend-03; order: 3; exerciseId: overhead-cable-triceps-extension; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 60 }`<br>4. `{ id: triceps-press-and-extend-04; order: 4; exerciseId: rope-triceps-pushdown; prescriptionType: reps; sets: 2; targetReps: 12; restSeconds: 60 }` |

#### Legs

| Stable ID | Name | Level | Min | Rationale / description | Ordered entries |
| --- | --- | --- | ---: | --- | --- |
| `leg-foundations` | Leg Foundations | `beginner` | 30 | One squat, hinge, unilateral movement, and calf exercise cover the lower body efficiently. | 1. `{ id: leg-foundations-01; order: 1; exerciseId: goblet-squat; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 75 }`<br>2. `{ id: leg-foundations-02; order: 2; exerciseId: dumbbell-romanian-deadlift; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 75 }`<br>3. `{ id: leg-foundations-03; order: 3; exerciseId: reverse-lunge; prescriptionType: reps; sets: 2; targetReps: 8; restSeconds: 60; notes: "Reps per side." }`<br>4. `{ id: leg-foundations-04; order: 4; exerciseId: standing-calf-raise; prescriptionType: reps; sets: 2; targetReps: 12; restSeconds: 60 }` |
| `balanced-leg-strength` | Balanced Leg Strength | `intermediate` | 45 | Squat, hinge, unilateral, hamstring, and calf patterns form a complete moderate-volume session. | 1. `{ id: balanced-leg-strength-01; order: 1; exerciseId: hack-squat; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 90 }`<br>2. `{ id: balanced-leg-strength-02; order: 2; exerciseId: romanian-deadlift; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 90 }`<br>3. `{ id: balanced-leg-strength-03; order: 3; exerciseId: split-squat; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 75; notes: "Reps per side." }`<br>4. `{ id: balanced-leg-strength-04; order: 4; exerciseId: seated-leg-curl; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 75 }`<br>5. `{ id: balanced-leg-strength-05; order: 5; exerciseId: seated-calf-raise; prescriptionType: reps; sets: 3; targetReps: 12; restSeconds: 60 }` |
| `leg-strength-and-balance` | Leg Strength and Balance | `advanced` | 50 | A technical squat leads, followed by unilateral strength and supported accessories rather than a second heavy bilateral lift. | 1. `{ id: leg-strength-and-balance-01; order: 1; exerciseId: barbell-back-squat; prescriptionType: reps; sets: 4; targetReps: 6; restSeconds: 120 }`<br>2. `{ id: leg-strength-and-balance-02; order: 2; exerciseId: single-leg-romanian-deadlift; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 90; notes: "Reps per side." }`<br>3. `{ id: leg-strength-and-balance-03; order: 3; exerciseId: single-leg-press; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 90; notes: "Reps per side." }`<br>4. `{ id: leg-strength-and-balance-04; order: 4; exerciseId: lying-leg-curl; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 75 }`<br>5. `{ id: leg-strength-and-balance-05; order: 5; exerciseId: single-leg-calf-raise; prescriptionType: reps; sets: 3; targetReps: 12; restSeconds: 60; notes: "Reps per side." }` |

#### Glutes

| Stable ID | Name | Level | Min | Rationale / description | Ordered entries |
| --- | --- | --- | ---: | --- | --- |
| `glute-foundations` | Glute Foundations | `beginner` | 30 | Bridge, squat, extension, and abduction patterns provide accessible multidirectional work. | 1. `{ id: glute-foundations-01; order: 1; exerciseId: glute-bridge; prescriptionType: reps; sets: 3; targetReps: 12; restSeconds: 60 }`<br>2. `{ id: glute-foundations-02; order: 2; exerciseId: goblet-squat; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 75 }`<br>3. `{ id: glute-foundations-03; order: 3; exerciseId: cable-glute-kickback; prescriptionType: reps; sets: 2; targetReps: 12; restSeconds: 60; notes: "Reps per side." }`<br>4. `{ id: glute-foundations-04; order: 4; exerciseId: hip-abduction-machine; prescriptionType: reps; sets: 2; targetReps: 12; restSeconds: 60 }` |
| `glute-strength-and-balance` | Glute Strength and Balance | `intermediate` | 40 | Hip extension, hinging, unilateral squatting, and abduction create balanced moderate-volume work. | 1. `{ id: glute-strength-and-balance-01; order: 1; exerciseId: hip-thrust; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 90 }`<br>2. `{ id: glute-strength-and-balance-02; order: 2; exerciseId: dumbbell-romanian-deadlift; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 75 }`<br>3. `{ id: glute-strength-and-balance-03; order: 3; exerciseId: bulgarian-split-squat; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 75; notes: "Reps per side." }`<br>4. `{ id: glute-strength-and-balance-04; order: 4; exerciseId: cable-pull-through; prescriptionType: reps; sets: 3; targetReps: 12; restSeconds: 60 }`<br>5. `{ id: glute-strength-and-balance-05; order: 5; exerciseId: cable-hip-abduction; prescriptionType: reps; sets: 2; targetReps: 12; restSeconds: 60; notes: "Reps per side." }` |

#### Core

| Stable ID | Name | Level | Min | Rationale / description | Ordered entries |
| --- | --- | --- | ---: | --- | --- |
| `core-stability-basics` | Core Stability Basics | `beginner` | 20 | Supine, prone, lateral, and anti-rotation patterns teach varied bracing demands. | 1. `{ id: core-stability-basics-01; order: 1; exerciseId: dead-bug; prescriptionType: reps; sets: 2; targetReps: 8; restSeconds: 45; notes: "Reps per side." }`<br>2. `{ id: core-stability-basics-02; order: 2; exerciseId: front-plank; prescriptionType: timed; sets: 3; targetDurationSeconds: 20; restSeconds: 45 }`<br>3. `{ id: core-stability-basics-03; order: 3; exerciseId: bird-dog; prescriptionType: reps; sets: 2; targetReps: 8; restSeconds: 45; notes: "Reps per side." }`<br>4. `{ id: core-stability-basics-04; order: 4; exerciseId: side-plank; prescriptionType: timed; sets: 2; targetDurationSeconds: 15; restSeconds: 45; notes: "Hold each side." }`<br>5. `{ id: core-stability-basics-05; order: 5; exerciseId: pallof-press; prescriptionType: reps; sets: 2; targetReps: 10; restSeconds: 45; notes: "Reps per side." }` |
| `core-strength-and-rotation` | Core Strength and Rotation | `intermediate` | 30 | Static control, flexion, shoulder-tap stability, anti-rotation, and rotation broaden the challenge. | 1. `{ id: core-strength-and-rotation-01; order: 1; exerciseId: hollow-body-hold; prescriptionType: timed; sets: 3; targetDurationSeconds: 20; restSeconds: 45 }`<br>2. `{ id: core-strength-and-rotation-02; order: 2; exerciseId: reverse-crunch; prescriptionType: reps; sets: 3; targetReps: 12; restSeconds: 45 }`<br>3. `{ id: core-strength-and-rotation-03; order: 3; exerciseId: plank-shoulder-tap; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 60; notes: "Reps per side." }`<br>4. `{ id: core-strength-and-rotation-04; order: 4; exerciseId: half-kneeling-pallof-press; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 60; notes: "Reps per side." }`<br>5. `{ id: core-strength-and-rotation-05; order: 5; exerciseId: cable-wood-chop; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 60; notes: "Reps per side." }` |
| `integrated-core-control` | Integrated Core Control | `advanced` | 35 | Higher-skill hanging and rollout work is balanced by lateral, rotational, and carry patterns. | 1. `{ id: integrated-core-control-01; order: 1; exerciseId: hanging-leg-raise; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 75 }`<br>2. `{ id: integrated-core-control-02; order: 2; exerciseId: ab-wheel-rollout; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 75 }`<br>3. `{ id: integrated-core-control-03; order: 3; exerciseId: side-plank; prescriptionType: timed; sets: 3; targetDurationSeconds: 30; restSeconds: 45; notes: "Hold each side." }`<br>4. `{ id: integrated-core-control-04; order: 4; exerciseId: cable-low-to-high-chop; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 60; notes: "Reps per side." }`<br>5. `{ id: integrated-core-control-05; order: 5; exerciseId: suitcase-carry; prescriptionType: timed; sets: 3; targetDurationSeconds: 30; restSeconds: 60; notes: "Carry on each side." }` |

#### Full Body

| Stable ID | Name | Level | Min | Rationale / description | Ordered entries |
| --- | --- | --- | ---: | --- | --- |
| `full-body-basics` | Full Body Basics | `beginner` | 30 | Retains the existing stable ID and supplies a practical squat, push, pull, hinge, and brace session. | 1. `{ id: full-body-basics-01; order: 1; exerciseId: bodyweight-squat; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 60 }`<br>2. `{ id: full-body-basics-02; order: 2; exerciseId: incline-push-up; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 60 }`<br>3. `{ id: full-body-basics-03; order: 3; exerciseId: seated-cable-row; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 75 }`<br>4. `{ id: full-body-basics-04; order: 4; exerciseId: dumbbell-romanian-deadlift; prescriptionType: reps; sets: 2; targetReps: 10; restSeconds: 75 }`<br>5. `{ id: full-body-basics-05; order: 5; exerciseId: front-plank; prescriptionType: timed; sets: 2; targetDurationSeconds: 20; restSeconds: 45 }` |
| `total-body-strength` | Total Body Strength | `intermediate` | 45 | Covers major movement patterns and adds overhead work and a timed carry at manageable volume. | 1. `{ id: total-body-strength-01; order: 1; exerciseId: goblet-squat; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 75 }`<br>2. `{ id: total-body-strength-02; order: 2; exerciseId: dumbbell-bench-press; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 90 }`<br>3. `{ id: total-body-strength-03; order: 3; exerciseId: one-arm-dumbbell-row; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 75; notes: "Reps per side." }`<br>4. `{ id: total-body-strength-04; order: 4; exerciseId: dumbbell-romanian-deadlift; prescriptionType: reps; sets: 3; targetReps: 10; restSeconds: 75 }`<br>5. `{ id: total-body-strength-05; order: 5; exerciseId: standing-dumbbell-shoulder-press; prescriptionType: reps; sets: 2; targetReps: 10; restSeconds: 75 }`<br>6. `{ id: total-body-strength-06; order: 6; exerciseId: farmers-carry; prescriptionType: timed; sets: 3; targetDurationSeconds: 30; restSeconds: 60 }` |
| `full-body-strength-progression` | Full Body Strength Progression | `advanced` | 55 | Moderate three-set compound work develops whole-body strength without an aggressive conditioning circuit. | 1. `{ id: full-body-strength-progression-01; order: 1; exerciseId: barbell-back-squat; prescriptionType: reps; sets: 3; targetReps: 6; restSeconds: 120 }`<br>2. `{ id: full-body-strength-progression-02; order: 2; exerciseId: dumbbell-bench-press; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 90 }`<br>3. `{ id: full-body-strength-progression-03; order: 3; exerciseId: pull-up; prescriptionType: reps; sets: 3; targetReps: 6; restSeconds: 90 }`<br>4. `{ id: full-body-strength-progression-04; order: 4; exerciseId: romanian-deadlift; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 90 }`<br>5. `{ id: full-body-strength-progression-05; order: 5; exerciseId: landmine-press; prescriptionType: reps; sets: 3; targetReps: 8; restSeconds: 75; notes: "Reps per side." }`<br>6. `{ id: full-body-strength-progression-06; order: 6; exerciseId: farmers-carry; prescriptionType: timed; sets: 3; targetDurationSeconds: 40; restSeconds: 75 }` |
| `experienced-total-body-strength` | Experienced Total Body Strength | `experienced` | 60 | Multiple technical barbell patterns justify the level; low set counts and long rests keep fatigue controlled. | 1. `{ id: experienced-total-body-strength-01; order: 1; exerciseId: barbell-back-squat; prescriptionType: reps; sets: 3; targetReps: 5; restSeconds: 150 }`<br>2. `{ id: experienced-total-body-strength-02; order: 2; exerciseId: barbell-bench-press; prescriptionType: reps; sets: 3; targetReps: 6; restSeconds: 120 }`<br>3. `{ id: experienced-total-body-strength-03; order: 3; exerciseId: barbell-deadlift; prescriptionType: reps; sets: 3; targetReps: 5; restSeconds: 150 }`<br>4. `{ id: experienced-total-body-strength-04; order: 4; exerciseId: pull-up; prescriptionType: reps; sets: 3; targetReps: 6; restSeconds: 120 }`<br>5. `{ id: experienced-total-body-strength-05; order: 5; exerciseId: barbell-overhead-press; prescriptionType: reps; sets: 2; targetReps: 6; restSeconds: 120 }`<br>6. `{ id: experienced-total-body-strength-06; order: 6; exerciseId: pallof-press; prescriptionType: reps; sets: 2; targetReps: 10; restSeconds: 60; notes: "Reps per side." }` |

#### Distribution and verification

| Focus | Beginner | Intermediate | Advanced | Experienced | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| `chest` | 1 | 1 | 1 | 0 | 3 |
| `back` | 1 | 1 | 1 | 0 | 3 |
| `shoulders` | 1 | 1 | 0 | 0 | 2 |
| `biceps` | 1 | 1 | 0 | 0 | 2 |
| `triceps` | 1 | 1 | 0 | 0 | 2 |
| `legs` | 1 | 1 | 1 | 0 | 3 |
| `glutes` | 1 | 1 | 0 | 0 | 2 |
| `core` | 1 | 1 | 1 | 0 | 3 |
| `full-body` | 1 | 1 | 1 | 1 | 4 |
| **Total** | **9** | **9** | **5** | **1** | **24** |

Programmatic comparison of the matrix against `docs/exercise-canonical-manifest.json` verified 24 unique routine IDs, 109 entries, 109 unique seeded entry IDs, 86 unique referenced exercises, 9 timed entries, zero invalid exercise IDs, zero prescription-exclusivity errors, and zero duplicate routine IDs. Implementation verification must repeat the reference check against shipped `LOCAL_EXERCISES`, assert all catalog invariants and exact totals, check that all 24 defaults survive deep-freeze construction, and detect drift in every routine and ordered entry field. The TypeScript catalog remains the single authored 109-entry source; a deterministic canonical fingerprint (including explicit null markers for absent estimate, rest, and notes) protects the exact approved content without introducing a second manually maintained matrix. General runtime validation runs before fingerprint comparison so useful model failures remain distinguishable from valid-looking seed drift. Advanced routines are intentionally limited to chest, back, legs, core, and full-body; adding advanced arm, shoulder, or glute routines would chiefly inflate isolation volume. The sole experienced routine is justified by its combined technical barbell patterns, restrained set count, and longer rests.

### Persist only user routines through an injectable key-value boundary

The project currently declares no general-purpose persistent storage dependency. Expo SDK 57 documents `@react-native-async-storage/async-storage` as an asynchronous, unencrypted, persistent key-value store for Android, iOS, web, and Expo Go. It is the smallest appropriate mechanism for one small routine payload and requires no database schema, provider, native configuration, or web-specific adapter. `expo-file-system` is present only as a transitive Expo dependency, is not a declared application dependency, and its SDK 57 support table excludes web. `expo-sqlite` is not installed and would add database and alpha web setup that this bounded document store does not need. Secure storage is also inappropriate because prescriptions are not secrets and its payload constraints and platform scope do not fit routine collections. Implementation therefore adds `@react-native-async-storage/async-storage` with `npx expo install` and no other dependency.

The repository depends on a minimal injectable string storage boundary implemented by AsyncStorage under one namespaced key:

```ts
interface RoutineStorage {
  read(): Promise<string | null>;
  write(value: string): Promise<void>;
}
```

The serialized value is a versioned envelope shaped as `{ version: 1, userRoutines: [...] }`. Only user-owned routine records are serialized; `DEFAULT_ROUTINES`, default entry data, exercise metadata, and derived labels are never written to local storage. Keeping the encoding and schema version in the repository layer makes storage fakes deterministic and leaves a clear migration point for later user-routine model changes.

Repository initialization reads the envelope before exposing user routines. A missing key means an empty user collection. A storage read rejection rejects the waiting repository operation and remains retryable on the next call. Malformed JSON, an unsupported envelope, or a non-array payload is treated as containing no user routines. For a structurally valid envelope, each record is validated as an unknown value before acceptance: it must satisfy the complete user-routine model, use `user` ownership, contain valid ISO timestamps, use canonical exercise references, avoid all routine and entry ID collisions with bundled defaults and earlier accepted user records, and reference an exact default ID when `sourceRoutineId` is present. Invalid records are omitted without mutating defaults, accepted records, or the persisted value during initialization; valid records retain their persisted order and exact IDs, content, timestamps, and provenance. The next successful mutation writes a canonical envelope containing only the accepted records plus the new copy.

Discarding all user data after one malformed record was rejected because independently valid records can be recovered safely. Trusting parsed JSON or coercing malformed fields was rejected because unvalidated data would cross the repository boundary. Persisting defaults was rejected because it duplicates bundled source-of-truth data and creates migration drift when the catalog changes.

### Keep repository responsibilities narrow, writes atomic, and results isolated

All route data access uses this contract:

```ts
interface RoutineRepository {
  listRoutines(): Promise<readonly Routine[]>;
  getRoutineById(id: string): Promise<Routine | null>;
  copyDefaultRoutine(id: string): Promise<UserRoutine>;
}
```

The local implementation keeps the frozen defaults and a separate private mutable user collection loaded through `RoutineStorage`. Construction starts one shared, retryable initialization operation, and every repository method awaits successful initialization before reading or writing user state. `listRoutines` resolves with defaults in catalog order followed by persisted user copies in creation order. `getRoutineById` performs exact case-sensitive equality and resolves `null` for an unknown ID. Filtering is deliberately absent from the repository.

Construction also accepts an ID generator and clock. A successful `copyDefaultRoutine(defaultId)` resolves the source by exact ID and requires `ownership: 'default'`; it creates a new user routine ID and new ID for every entry, uses the exact name convention `<default name> Copy`, copies description, focus, level, estimate, exercise references, prescriptions, rest, and notes, sets `sourceRoutineId` to the default ID, and sets `createdAt` and `updatedAt` to the same clock-produced ISO timestamp. All nested arrays and entries are independently allocated. The exact candidate data is serialized so reconstruction restores the same IDs, order, content, timestamps, and provenance without regeneration.

Copying is atomic at the repository boundary. Copy operations are serialized to prevent concurrent callers from overwriting one another. An unknown ID, a user-owned source ID, an invalid generated ID, a collision with any default or persisted routine or entry ID, an invalid clock result, or a candidate that fails validation rejects with an `Error` before persistence. After validation, the repository writes a complete candidate envelope containing the prior accepted users plus the copy. Only after `RoutineStorage.write` resolves does it replace the private user collection and resolve the copy operation; a write rejection leaves visible repository state unchanged, does not increment the session revision, and rejects the operation. The copy action remains available only on default details; user details show ownership/provenance without offering copy-of-copy behavior.

Repository results preserve encapsulation. The list result is a newly allocated readonly array. Recursively frozen default objects may be shared because mutation cannot change them. Every user routine returned by `listRoutines`, `getRoutineById`, or `copyDefaultRoutine` is a detached deep snapshot, including a newly allocated exercises array and entries; the copy result is not the object retained internally. The repository likewise clones accepted loaded records before storing them internally. Mutating any returned routine can therefore alter neither a default, another result, the private user collection, nor data returned by a later operation. Future editing must use explicit validated repository methods introduced by a later change rather than mutable object aliases.

Returning synchronous values was rejected because initialization and durable writes are asynchronous and the contract should remain consistent with the exercise architecture. Adding focus/level query parameters to repository methods was rejected because filtering 24 defaults plus a small local user collection is cheap and presentation-specific. Returning private user objects or sharing default entry objects with copies was rejected because either would violate ownership and encapsulation. Freezing internal user records as the only protection was rejected because future editing will need controlled internal mutation. A generic CRUD repository was rejected because edit/delete behavior is outside scope.

### Filter outside the repository and invalidate routine reads with a session revision

A pure `filterRoutines` selector applies focus and level predicates with AND semantics while preserving repository order. Each filter has an `All` option. The Routines stack provider owns the repository, selected focus, selected level, reset action, and an integer revision. This mirrors `ExerciseSessionProvider` without coupling routine state to exercise discovery state.

Routine list/detail hooks expose discriminated loading/success/error states and include repository identity, request inputs, retry version, and session revision in stale-result protection. Their initial repository request also covers storage initialization, so persisted users appear in the first successful result and storage read failures use the existing retry path. After a persisted copy succeeds, the provider increments the revision; mounted list and detail adapters refetch, so the new user routine appears immediately without a repository subscription framework. Failed copies do not increment revision. Filter state survives navigation from library to detail and back for the current Routines stack lifetime, while reconstructed sessions read durable user routines from storage and reset only the transient filters.

Executable verification mounts the actual provider and hooks with injected deferred repositories. It proves successful-copy revision, failed-copy stability, pending-copy deduplication, stale-result suppression, provider-scoped filter lifetime, independent exercise retry, post-copy list discovery, and reconstruction from the persisted envelope. The existing React toolchain is used without introducing a broad test framework solely for this change.

Index-local filters were rejected because preservation across nested navigation would rely on incidental mount behavior. Application-global state was rejected because no other tab consumes routine discovery controls. Adding an event emitter, cache library, or external state package was rejected because one revision counter is sufficient for the single local mutation.

### Resolve routine and exercise data independently on details

Routine details load the routine through `RoutineRepository` and resolve every referenced exercise through the existing injected `ExerciseRepository`. The routine remains the source of order and prescription; the exercise repository remains the source of display name and formatted equipment. Resolution may deduplicate repeated exercise IDs for requests, but projection maps results back to every ordered routine entry. Each rendered entry links to `/exercises/[exerciseId]` using the existing route and ID unchanged.

Routine loading/error/not-found and exercise-projection loading/error/missing-reference are separate states with separate retry paths. A routine repository rejection shows an accessible routine error. A successful `null` shows routine not found. Once a routine exists, exercise resolution may load or fail independently without relabeling the routine request as failed; retrying exercise data does not refetch or copy the routine. A successful exercise lookup returning `null` is treated as an explicit unavailable-reference error because default validation should make it impossible locally but an injected or future repository may diverge. Copy action pending, success, and error feedback is also local to the action and does not replace resolved detail content.

Embedding exercise names/equipment in defaults was rejected because catalog corrections would drift. Importing `LOCAL_EXERCISES` directly into detail components was rejected because it bypasses the existing repository boundary and makes independent failures untestable. Treating all data as one `Promise.all` state was rejected because it obscures whether the routine or its exercise projection failed.

### Nest Routines routes while preserving tab and exercise contracts

Replace `src/app/routines.tsx` with `src/app/routines/index.tsx`, `src/app/routines/[routineId].tsx`, and `src/app/routines/_layout.tsx`. The layout provides the routine session and a themed stack matching the Exercises stack: the index header remains hidden, while detail receives native back navigation. The root `NativeTabs.Trigger name="routines"`, `/routines` URL, tab label/icon, and selected-tab behavior remain unchanged.

`generateStaticParams` for `[routineId]` emits only the 24 IDs from `DEFAULT_ROUTINES`, and isolated static export must contain one concrete HTML page for each default. User IDs are device-local and cannot be deterministic build inputs. The dynamic route remains necessary for native navigation and client-side navigation inside the running application, where it resolves persisted copies and renders not-found for repository misses.

Static web output does not provide a portable catch-all server. A normal static host may reject a direct or reloaded `/routines/<user-id>` or arbitrary unknown URL before React loads, so this change does not guarantee those static-web entry paths and does not describe a host 404 as the in-app not-found state. Adding SSR, backend routing, or deployment-specific rewrites would change the architecture and remains out of scope. Runtime route behavior and static-host file availability are verified as separate contracts.

Keeping `routines.tsx` and adding a root sibling dynamic route was rejected because detail belongs to the Routines navigation history and provider lifetime. Generating parameters from `listRoutines` was rejected because mutable user copies are nondeterministic build inputs. A modal was rejected because routine details are durable, directly addressable content.

### Replace placeholders without compatibility aliases

The old `RoutinePreview` type and `ROUTINES` records are removed from `mvp-content.ts` once the repository-backed route lands. `full-body-basics` retains its stable ID, beginner level, 30-minute estimate, and five-entry shape as a concrete default. `upper-body-builder` is retired because `upper-body` is not one of the nine focuses and the record overlaps dedicated muscle-focus routines. `mobility-reset` is retired because the canonical catalog has no mobility focus or purpose-built mobility sequence. Neither receives an alias or hidden compatibility record because both are preview-only, have no existing detail route, and have no persisted or external consumer.

Keeping all three previews alongside the catalog was rejected because it creates two routine sources of truth. Recasting `upper-body-builder` or `mobility-reset` under an inaccurate approved focus was rejected because stable IDs should not silently change meaning.

## Risks / Trade-offs

- [Local storage is unavailable or a read fails] -> Keep initialization asynchronous and retryable, surface the repository error through existing UI states, and never fall back to a falsely successful empty write.
- [Persisted JSON is malformed or from an unsupported schema] -> Parse unknown data fail-closed, accept only independently validated noncolliding user records, expose bundled defaults unchanged, and retain a versioned envelope for future migrations.
- [Mutable user data aliases defaults, repository state, or another result] -> Allocate copied records independently and return detached deep user snapshots while relying on recursive freezing only for canonical defaults.
- [A failed or concurrent copy partially enters the list] -> Serialize copy operations, validate the complete candidate and envelope, await persistence before replacing visible state, and increment the session revision only after success.
- [Routine references drift from the exercise catalog] -> Validate every default reference against `LOCAL_EXERCISES` at the single catalog boundary and retain explicit missing-reference detail behavior for injected repositories.
- [Two asynchronous repositories produce confusing combined states] -> Keep routine and exercise projection states independent, retain resolved routine content during exercise retry, and provide targeted accessible messages/actions.
- [The experienced full-body routine creates excessive fatigue] -> Keep only one experienced seed, limit working sets, use long rests, avoid conditioning supersets, and present it as a template rather than an execution target with prescribed load.
- [Generated user IDs collide or an injected clock is malformed] -> Validate all generated values and reject atomically before mutation; use deterministic injected factories in tests.
- [Static export omits copied user details] -> Generate only deterministic defaults, support copied IDs through native and in-app client navigation, and explicitly leave arbitrary static-host direct/reload handling outside the contract.
- [A new dependency increases maintenance surface] -> Use the Expo SDK 57-supported AsyncStorage package because no suitable cross-platform persistent store is currently declared, keep it behind `RoutineStorage`, and avoid database or secure-storage complexity.
- [Expo dependency validation reports unrelated drift] -> Record `expo install --check` output as pre-existing SDK maintenance debt, confirm the newly added SDK-compatible AsyncStorage package is not flagged, and do not broaden this change into dependency upgrades.
- [A future distance prescription weakens current type safety] -> Add a new discriminated member with its units and validation in that future change rather than optional distance fields on current members.
- [Replacing a tab file with a route directory changes navigation behavior] -> Preserve the trigger name and `/routines` index path, mirror the proven Exercises stack structure, and verify tab selection, back navigation, deep links, and native/web export.
- [Large seed data becomes hard to review] -> Keep the matrix explicit, grouped by focus, validated at one boundary, and protected by exact count, ID, order, prescription, and reference checks.
- [Deterministic test harness differs from a native React runtime] -> Execute the actual provider, hooks, and route source for state-machine coverage without adding a framework, while leaving Strict Mode, concurrent rendering, native Router integration, and presentation behavior to the deliberately unchecked manual verification task.
- [The compact catalog fingerprint can theoretically collide or become opaque during an approved edit] -> Canonicalize every routine and entry field with order and absent-value markers, run complete structural validation first, exercise representative valid-looking drift, and require deliberate fingerprint review when the approved matrix changes; the residual 32-bit collision risk is accepted as Low for this local seed boundary.

The informational `pnpm exec expo install --check` audit on 2026-10-19 reports pre-existing version drift for `@expo/ui`, `expo`, `expo-constants`, `expo-device`, `expo-font`, `expo-glass-effect`, `expo-image`, `expo-linking`, `expo-router`, `expo-splash-screen`, `expo-symbols`, `expo-system-ui`, `expo-video`, `expo-web-browser`, `react-native`, `react-native-reanimated`, `react-native-screens`, `react-native-worklets`, and `eslint-config-expo`. It does not flag the newly installed `@react-native-async-storage/async-storage@2.2.0`. Updating those unrelated packages is deferred technical debt rather than part of this feature change.

## Migration Plan

1. Add routine types, taxonomy labels, validators, and the exact 24-record `DEFAULT_ROUTINES` catalog; verify 24 routines, 109 entries, 109 unique entry IDs, 86 unique exercise references, 9 timed entries, and zero missing `LOCAL_EXERCISES` IDs.
2. Install the Expo-compatible AsyncStorage package, add the injectable `RoutineStorage` adapter and versioned user-only envelope, and verify missing, failed, malformed, mixed-validity, and unsupported-version reads.
3. Add the local routine repository and verify initialization, exact lookup, collision handling, serialized persistence-atomic copies, reconstruction with identical user data, detached result snapshots, and immutable unduplicated defaults.
4. Add pure focus/level filtering, routine async hooks, and the Routines session provider with storage-aware loading/retry and revision-driven refetch after successful persisted copies.
5. Replace `src/app/routines.tsx` with the nested Routines layout, repository-backed index, and dynamic detail route; add cards, filters, ownership presentation, independent data states, prescription rendering, exercise links, and default-only copy feedback.
6. Generate static parameters from defaults only; verify all 24 concrete static pages, separately verify runtime navigation for persisted-user and unknown IDs, and verify responsive mobile/web presentation, accessibility, preserved filter state, primary-tab behavior, exercise links, TypeScript, lint, and static export without claiming arbitrary static-host fallback behavior.
7. Remove only the obsolete routine preview type/data from `mvp-content.ts`, retaining unrelated Home and Admin content and preserving `full-body-basics` through the new catalog.

Rollback removes the routine feature/components and nested route directory, restores the single `src/app/routines.tsx` preview route and prior preview records, and leaves exercise code untouched. The namespaced user-routine storage key remains inert rather than being destructively deleted, allowing a forward fix to recover validated copies; explicit local-data deletion requires a separate product decision.

## Open Questions

None.
