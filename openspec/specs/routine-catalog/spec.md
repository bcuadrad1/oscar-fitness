# Routine Catalog Specification

## Purpose
Define routine domain models, immutable defaults, catalog validation, local persistence, repository access, and copying behavior.

## Requirements

### Requirement: Typed routine domain
The routine capability SHALL define a typed `Routine` model and a typed `RoutineExercise` model. `Routine` SHALL contain a stable `id`, non-empty `name`, non-empty `description`, one canonical `focus`, one canonical `level`, a discriminated `ownership`, an ordered `exercises` collection of `RoutineExercise` entries, and optional `estimatedDurationMinutes`. `RoutineExercise` SHALL contain a stable entry `id`, canonical `exerciseId`, 1-based `order`, positive integer `sets`, one discriminated prescription, and optional `restSeconds` and `notes`.

#### Scenario: Valid routine is type checked
- **WHEN** a routine declares every required field with supported values
- **THEN** TypeScript accepts the routine and its ordered exercise entries as `Routine` and `RoutineExercise`

#### Scenario: Unsupported routine field value is declared
- **WHEN** a routine declares an unsupported focus, level, ownership discriminator, or prescription discriminator
- **THEN** TypeScript rejects the record

### Requirement: Canonical routine focus and level taxonomies
Routine focus SHALL be represented by exactly `chest`, `back`, `shoulders`, `biceps`, `triceps`, `legs`, `glutes`, `core`, or `full-body`. Routine level SHALL be represented by exactly `beginner`, `intermediate`, `advanced`, or `experienced`, and SHALL remain a separate domain concept from the exercise difficulty taxonomy and any future account level.

#### Scenario: Supported routine classification is used
- **WHEN** a routine is assigned one canonical focus and one canonical routine level
- **THEN** both values remain available independently of every referenced exercise's difficulty

#### Scenario: Exercise difficulty differs from routine level
- **WHEN** a routine references an exercise whose difficulty label differs from the routine's audience level
- **THEN** the routine remains classified only by its own routine level without rewriting exercise metadata

### Requirement: Default and user ownership union
`Routine` SHALL be a discriminated union with `ownership: 'default'` and `ownership: 'user'` branches. Only the `user` branch SHALL contain lifecycle metadata `createdAt` and `updatedAt` and optional source metadata `sourceRoutineId`; the `default` branch MUST NOT contain user timestamps or source metadata.

#### Scenario: Default routine ownership is inspected
- **WHEN** a seeded default routine is returned
- **THEN** its ownership discriminator is `default` and no user timestamp or source field is present

#### Scenario: Copied routine ownership is inspected
- **WHEN** a default routine is copied successfully
- **THEN** the result has `user` ownership, valid `createdAt` and `updatedAt` timestamps, and the source default's exact stable ID as `sourceRoutineId`

### Requirement: Discriminated repetition and timed prescriptions
Every `RoutineExercise` SHALL contain exactly one prescription branch: `prescriptionType: 'reps'` with positive integer `targetReps`, or `prescriptionType: 'timed'` with positive integer `targetDurationSeconds`. Both branches SHALL use positive integer `sets`; a reps prescription MUST NOT contain `targetDurationSeconds`, and a timed prescription MUST NOT contain `targetReps`.

#### Scenario: Repetition prescription is valid
- **WHEN** an entry declares `prescriptionType: 'reps'`, positive integer `targetReps`, and positive integer sets without target duration
- **THEN** the entry is accepted as a repetition prescription

#### Scenario: Timed prescription is valid
- **WHEN** an entry declares `prescriptionType: 'timed'`, positive integer `targetDurationSeconds`, and positive integer sets without target reps
- **THEN** the entry is accepted as a timed prescription

#### Scenario: Prescription is ambiguous or nonpositive
- **WHEN** an entry declares both reps and duration, neither value, a value on the wrong discriminator branch, or a nonpositive or non-integer sets, reps, or duration value
- **THEN** routine catalog validation rejects the entry

### Requirement: Stable ordered routine entries
Every routine entry SHALL have a non-empty stable ID, seeded default entry IDs SHALL be globally unique, and each routine's entry order SHALL be unique, contiguous, and 1-based from `1` through the routine's entry count. Default entry IDs SHALL use `<routine-id>-NN`, where `NN` is the two-digit 1-based order. Entry records SHALL store only the canonical `exerciseId` reference and prescription-specific data and MUST NOT duplicate exercise names, classifications, equipment, instructions, thumbnails, videos, or other `Exercise` metadata.

#### Scenario: Ordered routine is consumed
- **WHEN** a validated routine is returned by the repository
- **THEN** its entries can be rendered in contiguous ascending order using stable entry IDs and canonical exercise references

#### Scenario: Entry identity or order is invalid
- **WHEN** a catalog contains a missing or duplicate entry ID or a routine contains a repeated order, zero-based order, order gap, or entry ID that differs from its stable convention
- **THEN** routine catalog validation rejects the routine

#### Scenario: Exercise metadata is requested for an entry
- **WHEN** a consumer needs an entry's exercise name or other exercise-owned metadata
- **THEN** it resolves `exerciseId` through `ExerciseRepository` instead of reading duplicated metadata from `RoutineExercise`

### Requirement: Optional routine prescription metadata
`estimatedDurationMinutes` SHALL be optional and, when present, SHALL be a positive integer. `restSeconds` SHALL be optional and, when present, SHALL be a nonnegative integer. Entry `notes` SHALL be optional and, when present, SHALL contain non-whitespace text. An omitted optional value SHALL remain distinct from an authored zero rest.

#### Scenario: Optional metadata is omitted
- **WHEN** a routine has no estimate or an entry has no rest or notes
- **THEN** the routine and entry remain valid without synthesized placeholder values

#### Scenario: Authored zero rest is used
- **WHEN** an entry explicitly declares `restSeconds` as `0`
- **THEN** validation accepts the intentional no-rest prescription and preserves it as distinct from omitted rest

#### Scenario: Optional metadata is invalid
- **WHEN** an estimate is nonpositive or non-integer, rest is negative or non-integer, or a present note is empty or whitespace-only
- **THEN** routine catalog validation rejects the record

### Requirement: Prescription excludes workout performance
`Routine` and `RoutineExercise` SHALL describe planned prescriptions only and MUST NOT contain actual repetitions, actual duration, actual weight, completion state, skipped state, or exercise-substitution state. Stable routine IDs, stable entry IDs, and canonical exercise IDs SHALL remain available as reference identities for future workout-session and performed-set models without introducing those models in this change.

#### Scenario: Planned routine is inspected
- **WHEN** a routine prescription is returned
- **THEN** it contains stable identities and planned values without fields that claim what occurred during a workout

#### Scenario: Actual performance field is added to a routine entry
- **WHEN** a routine fixture attempts to declare performed repetitions, performed duration, completion, or substitution data
- **THEN** the typed routine model rejects that session-owned field

### Requirement: Exact immutable default routine seed
The local routine catalog SHALL contain exactly the following 24 default routines in the listed order and with the exact stable ID, name, focus, level, and entry count shown:

| Order | Stable ID | Name | Focus | Level | Entries |
| --- | --- | --- | --- | --- | ---: |
| 1 | `chest-foundations` | Chest Foundations | `chest` | `beginner` | 4 |
| 2 | `balanced-chest-strength` | Balanced Chest Strength | `chest` | `intermediate` | 4 |
| 3 | `chest-strength-and-control` | Chest Strength and Control | `chest` | `advanced` | 4 |
| 4 | `back-foundations` | Back Foundations | `back` | `beginner` | 5 |
| 5 | `pull-and-row-balance` | Pull and Row Balance | `back` | `intermediate` | 4 |
| 6 | `back-strength-and-control` | Back Strength and Control | `back` | `advanced` | 5 |
| 7 | `shoulder-foundations` | Shoulder Foundations | `shoulders` | `beginner` | 4 |
| 8 | `balanced-shoulder-strength` | Balanced Shoulder Strength | `shoulders` | `intermediate` | 4 |
| 9 | `biceps-basics` | Biceps Basics | `biceps` | `beginner` | 3 |
| 10 | `varied-curl-strength` | Varied Curl Strength | `biceps` | `intermediate` | 4 |
| 11 | `triceps-basics` | Triceps Basics | `triceps` | `beginner` | 3 |
| 12 | `triceps-press-and-extend` | Triceps Press and Extend | `triceps` | `intermediate` | 4 |
| 13 | `leg-foundations` | Leg Foundations | `legs` | `beginner` | 4 |
| 14 | `balanced-leg-strength` | Balanced Leg Strength | `legs` | `intermediate` | 5 |
| 15 | `leg-strength-and-balance` | Leg Strength and Balance | `legs` | `advanced` | 5 |
| 16 | `glute-foundations` | Glute Foundations | `glutes` | `beginner` | 4 |
| 17 | `glute-strength-and-balance` | Glute Strength and Balance | `glutes` | `intermediate` | 5 |
| 18 | `core-stability-basics` | Core Stability Basics | `core` | `beginner` | 5 |
| 19 | `core-strength-and-rotation` | Core Strength and Rotation | `core` | `intermediate` | 5 |
| 20 | `integrated-core-control` | Integrated Core Control | `core` | `advanced` | 5 |
| 21 | `full-body-basics` | Full Body Basics | `full-body` | `beginner` | 5 |
| 22 | `total-body-strength` | Total Body Strength | `full-body` | `intermediate` | 6 |
| 23 | `full-body-strength-progression` | Full Body Strength Progression | `full-body` | `advanced` | 6 |
| 24 | `experienced-total-body-strength` | Experienced Total Body Strength | `full-body` | `experienced` | 6 |

The seed SHALL contain exactly 9 beginner, 9 intermediate, 5 advanced, and 1 experienced routines. Focus totals SHALL be exactly chest 3, back 3, shoulders 2, biceps 2, triceps 2, legs 3, glutes 2, core 3, and full-body 4. Across the seed there SHALL be exactly 109 entries, exactly 86 unique canonical exercise references, and exactly 9 timed prescriptions. Every seeded routine SHALL have `default` ownership and SHALL remain immutable.

#### Scenario: Complete default seed is validated
- **WHEN** the local default catalog is constructed
- **THEN** its ordered rows and all level, focus, entry, unique-reference, and timed-prescription totals exactly match the approved matrix

#### Scenario: Existing supported preview identity is migrated
- **WHEN** the default seed is inspected for the prior supported routine
- **THEN** `full-body-basics` exists exactly once as the five-entry beginner Full Body Basics default

#### Scenario: Retired preview identities are checked
- **WHEN** the default seed IDs are inspected
- **THEN** neither `upper-body-builder` nor `mobility-reset` is present

### Requirement: Complete routine catalog integrity validation
`defineRoutineCatalog` SHALL remain the runtime integrity boundary for default routine data and SHALL reject a catalog unless routine IDs are unique, names and descriptions are non-empty, ownership is `default`, all 109 seeded entry IDs are unique, the exact approved matrix and aggregate totals are present, every entry and optional value satisfies its validation rules, and every referenced exercise ID resolves exactly against the canonical 216-exercise catalog. Exact seed verification SHALL compare array order and every authored routine and entry value: routine ID, name, description, focus, level, estimate, ownership, ordered entry count, and each entry's ID, order, exercise ID, prescription discriminator, sets, branch-specific target, rest, and notes. Validation MUST reject unknown and case-mismatched exercise IDs before routines are exposed to repository or route consumers and SHALL recursively freeze the catalog array, routines, exercise arrays, and entries before returning them. Exact verification SHALL use one authored matrix plus a deterministic canonical fingerprint or generated golden representation so it does not require a second manually maintained 109-entry matrix; general runtime validation and exact drift detection SHALL both remain in force.

#### Scenario: Every exercise reference resolves
- **WHEN** all 109 seeded entries are validated against the complete exercise catalog
- **THEN** every entry's exact exercise ID identifies one of the 216 canonical exercises and the set contains exactly 86 unique references

#### Scenario: Catalog invariant differs
- **WHEN** a routine is missing or extra, matrix metadata changes, a routine or entry ID is duplicated, required text is blank, an aggregate count differs, ownership is not default, or an entry violates a model rule
- **THEN** `defineRoutineCatalog` rejects the catalog

#### Scenario: Valid-looking seed value drifts
- **WHEN** a description, exercise reference, prescription target, rest value, note, or array order changes while the resulting record remains structurally valid and aggregate totals still match
- **THEN** exact seed verification rejects the catalog as different from the approved matrix

#### Scenario: Exercise reference does not resolve exactly
- **WHEN** an entry contains an unknown or case-mismatched exercise ID
- **THEN** `defineRoutineCatalog` rejects the catalog before repository construction

### Requirement: Asynchronous ownership-aware routine repository
The application SHALL access routines through a `RoutineRepository` contract with `listRoutines(): Promise<readonly Routine[]>`, `getRoutineById(id: string): Promise<Routine | null>`, and `copyDefaultRoutine(id: string): Promise<UserRoutine>`. Every operation SHALL await repository initialization, which loads and validates device-local user routines. The local implementation SHALL list the 24 defaults in approved matrix order followed by accepted persisted user copies in creation order, preserving the ownership discriminator so consumers can distinguish defaults from user routines.

#### Scenario: Routine list resolves with empty storage
- **WHEN** the local repository list operation resolves and no persisted user routines exist
- **THEN** it returns exactly the 24 readonly default routines in approved matrix order

#### Scenario: Routine list resolves after reconstruction
- **WHEN** repository initialization loads valid persisted user routines
- **THEN** list results contain the 24 defaults followed by those user routines in their persisted creation order

#### Scenario: Exact routine ID is requested
- **WHEN** a default or persisted user routine's exact stable ID is looked up
- **THEN** the promise resolves to that one ownership-distinguished routine

#### Scenario: Unknown routine ID is requested
- **WHEN** an unknown or case-mismatched routine ID is looked up
- **THEN** the promise resolves to `null`

### Requirement: Validated device-local user persistence
The local repository SHALL persist user routines through an injectable asynchronous storage boundary using one versioned payload. The persisted payload SHALL contain only user-owned routine data and MUST NOT duplicate `DEFAULT_ROUTINES`, default entries, exercise metadata, or derived labels. Before any persisted user routine is exposed, the repository SHALL validate its complete runtime shape, ownership, prescription and optional-value invariants, ISO timestamps, canonical exercise references, and routine and entry ID uniqueness against defaults and previously accepted users. Accepted records SHALL preserve their exact routine IDs, copied entry IDs, content, `sourceRoutineId`, `createdAt`, and `updatedAt` values across repository and application reconstruction.

#### Scenario: Valid persisted copies are loaded
- **WHEN** a new repository instance initializes from a supported payload containing valid user routines
- **THEN** it exposes detached user records with the same IDs, content, timestamps, provenance, and persisted order

#### Scenario: No persisted payload exists
- **WHEN** storage returns no value during repository initialization
- **THEN** initialization succeeds with an empty user collection and the 24 bundled defaults remain available

#### Scenario: Persisted payload is malformed
- **WHEN** stored JSON, the versioned envelope, or its user collection is malformed or unsupported
- **THEN** initialization exposes no records from that payload and leaves all bundled defaults unchanged

#### Scenario: Persisted collection contains malformed records
- **WHEN** a supported persisted collection contains both independently valid and invalid or colliding user records
- **THEN** only records that pass complete validation in persisted order are accepted and no malformed record mutates defaults or accepted users

#### Scenario: Storage read rejects
- **WHEN** the persistence adapter rejects during initialization
- **THEN** the waiting repository operation rejects without exposing unvalidated user data and a later repository operation can retry initialization

### Requirement: Independent default routine copying
The repository copy operation SHALL accept only an exact default routine ID and SHALL use injected ID generation, clock, and persistence dependencies. A successful copy SHALL deep-copy the source routine and every entry into an independent user-owned routine, assign a new stable routine ID and new stable ID to every copied entry, set the name to `<default name> Copy`, preserve the description, focus, level, estimate, exercise references, order, sets, prescriptions, rest, and entry notes, set `sourceRoutineId` to the source default ID, and initialize `createdAt` and `updatedAt` to the same valid ISO timestamp. Copy operations SHALL be serialized, and the repository MUST persist the complete next user collection before adding the copy to visible repository state or resolving successfully. The operation MUST NOT mutate the source default, and each repeated copy SHALL receive distinct noncolliding routine and entry IDs and an independent object graph.

#### Scenario: Default routine is copied
- **WHEN** the copy operation receives an exact default routine ID
- **THEN** it persists and returns an independently allocated user routine with a Copy-suffixed name, new stable routine and entry IDs, copied prescription content, source metadata, and initialized timestamps while the source remains unchanged

#### Scenario: Same default is copied more than once
- **WHEN** the same default routine is copied repeatedly
- **THEN** every result has unique routine and entry IDs and mutations to one copy cannot change another copy or the immutable default

#### Scenario: Invalid copy source is requested
- **WHEN** the copy operation receives an unknown, case-mismatched, or user-owned routine ID
- **THEN** it rejects with an `Error` without adding a routine or changing any existing routine

#### Scenario: Generated copy metadata is invalid
- **WHEN** generated IDs are empty or collide, the injected clock returns an invalid timestamp, or the complete copied candidate fails routine validation
- **THEN** the operation rejects atomically without adding a partial user routine or changing any existing routine

#### Scenario: Copy persistence fails
- **WHEN** the persistence write for a fully validated copy rejects
- **THEN** the copy operation rejects, list and lookup results remain unchanged, and the copy is not reported as successfully created

#### Scenario: Persisted copy is reloaded
- **WHEN** a successful copy is followed by repository or application reconstruction using the same local storage
- **THEN** the copied routine still resolves with exactly the same routine ID, entry IDs, content, timestamps, and source default provenance while defaults remain unduplicated and unchanged

### Requirement: Repository result encapsulation
The repository SHALL retain exclusive ownership of its mutable internal user records. `listRoutines`, `getRoutineById`, and `copyDefaultRoutine` MUST return recursively immutable defaults or detached deep user snapshots and MUST NOT expose a mutable alias to the private user collection, its exercise arrays, or its entries. Future user-routine edits SHALL occur only through explicit validated repository operations introduced by a later change.

#### Scenario: Returned user routine is mutated
- **WHEN** a caller mutates a user routine, exercise array, or entry returned by list, lookup, or copy
- **THEN** later repository results, persisted state, the source default, and every other copy remain unchanged

#### Scenario: Returned list is mutated
- **WHEN** a caller reorders, appends to, or removes from a list result
- **THEN** repository ordering and records returned by later operations remain unchanged

### Requirement: Bundled defaults and device-local routine scope
The 24 default routines SHALL remain bundled, recursively immutable, and never duplicated into local user storage, and the repository SHALL expose no operation that edits or deletes them. User copies SHALL persist only in local application storage. This change MUST NOT add a backend, remote database, account, login, authentication, membership ownership, cloud sync, cross-device synchronization, or remote routine requests.

#### Scenario: Default mutation is attempted
- **WHEN** a consumer attempts to alter a returned default routine, entry, or prescription
- **THEN** subsequent list and lookup operations return the unchanged canonical default data

#### Scenario: Application runtime restarts
- **WHEN** the application or repository is reconstructed after user copies were persisted
- **THEN** the repository returns the 24 unchanged bundled defaults plus the validated persisted user copies without duplicating defaults in storage

#### Scenario: Device is offline
- **WHEN** routine operations run without network connectivity or backend configuration
- **THEN** initialization, listing, exact lookup, validation, persistence, and copying remain available from local data
