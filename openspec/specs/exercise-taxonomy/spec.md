# Exercise Taxonomy Specification

## Purpose
Define canonical exercise classifications, equipment metadata, and related-exercise relationships while preserving existing exercise content.

## Requirements

### Requirement: Canonical body-part taxonomy
The exercise domain SHALL define stable body-part IDs and title-cased human-readable labels for `full-body`, `neck`, `chest`, `back`, `shoulders`, `biceps`, `triceps`, `forearms`, `core`, `glutes`, `quadriceps`, `hamstrings`, `calves`, `hip-flexors`, `hip-adductors`, and `hip-abductors`, and exercise records SHALL store taxonomy IDs rather than duplicated body-part labels.

#### Scenario: Body-part metadata is requested
- **WHEN** a consumer resolves a supported body-part ID
- **THEN** it receives the canonical human-readable label from the shared taxonomy

#### Scenario: Exercise declares an unsupported body part
- **WHEN** a statically typed exercise record uses a body-part value outside the canonical taxonomy
- **THEN** type checking rejects the record

### Requirement: Primary and secondary body-part classification
Every exercise SHALL declare exactly one `primaryBodyPartId` and a readonly `secondaryBodyPartIds` collection containing zero or more unique body-part IDs that do not duplicate the primary body part.

#### Scenario: Exercise targets additional body parts
- **WHEN** an exercise substantially involves body parts beyond its primary target
- **THEN** those targets are represented as unique secondary body-part IDs

#### Scenario: Exercise has no secondary target
- **WHEN** no secondary body part is assigned
- **THEN** the exercise remains valid with an empty secondary-body-part collection

#### Scenario: Local catalog contains duplicate body-part assignments
- **WHEN** local catalog construction receives duplicate secondary IDs or a secondary ID equal to the primary ID
- **THEN** catalog integrity validation rejects the invalid records

### Requirement: Exact exercise difficulty taxonomy
Exercise difficulty SHALL be represented by exactly `beginner`, `intermediate`, or `advanced`, with human-readable presentation labels resolved separately from the stored canonical values.

#### Scenario: Supported difficulty is displayed
- **WHEN** a consumer presents any canonical difficulty value
- **THEN** it uses the corresponding `Beginner`, `Intermediate`, or `Advanced` label

#### Scenario: Unsupported difficulty is declared
- **WHEN** a statically typed exercise record declares any other difficulty value or uses a presentation label as its stored value
- **THEN** type checking rejects the record

### Requirement: Canonical multi-equipment taxonomy
The exercise domain SHALL define stable equipment IDs `bodyweight`, `dumbbell`, `barbell`, `cable`, `machine`, `smith-machine`, `kettlebell`, `resistance-band`, `bench`, `pull-up-dip-station`, `ab-wheel`, `battle-rope`, `landmine`, `medicine-ball`, `platform-box`, `sled`, `stability-ball`, `suspension-trainer`, `weight-plate`, and `other`, with corresponding labels `Bodyweight`, `Dumbbell`, `Barbell`, `Cable`, `Machine`, `Smith machine`, `Kettlebell`, `Resistance band`, `Bench`, `Pull-up / dip station`, `Ab wheel`, `Battle rope`, `Landmine`, `Medicine ball`, `Platform / box`, `Sled`, `Stability ball`, `Suspension trainer`, `Weight plate`, and `Other`. Every exercise SHALL declare one or more unique equipment IDs in display order. `bodyweight` SHALL represent body mass as resistance and MAY coexist with required apparatus; when `bodyweight` is the sole value, presentation SHALL use `Bodyweight / no equipment`. `other` MAY coexist with known IDs when both known and unclassified equipment are required.

#### Scenario: Manifest-required equipment metadata is requested
- **WHEN** a consumer resolves `ab-wheel`, `battle-rope`, `landmine`, `medicine-ball`, `platform-box`, `sled`, `stability-ball`, `suspension-trainer`, or `weight-plate`
- **THEN** it receives the corresponding exact label `Ab wheel`, `Battle rope`, `Landmine`, `Medicine ball`, `Platform / box`, `Sled`, `Stability ball`, `Suspension trainer`, or `Weight plate`

#### Scenario: Existing equipment metadata is requested
- **WHEN** a consumer resolves any equipment ID that existed before this taxonomy expansion, including `other`
- **THEN** it receives the same human-readable label as before the expansion

#### Scenario: Exercise requires multiple equipment items
- **WHEN** an exercise requires more than one equipment type
- **THEN** its `equipmentIds` contains each required canonical ID and consumers resolve every display label in declared order

#### Scenario: Exercise requires no external apparatus
- **WHEN** an exercise is performed using bodyweight without external equipment
- **THEN** its equipment collection contains only `bodyweight` and its equipment presentation is `Bodyweight / no equipment`

#### Scenario: Bodyweight exercise also requires apparatus
- **WHEN** a bodyweight-resistance movement requires a bench or pull-up/dip station
- **THEN** `bodyweight` and the apparatus ID may coexist and each label is presented in declared order

#### Scenario: Unsupported equipment is declared
- **WHEN** a statically typed exercise record uses an equipment value outside the canonical taxonomy
- **THEN** type checking rejects the record

#### Scenario: Local catalog contains duplicate equipment
- **WHEN** local catalog construction receives an exercise with a repeated equipment ID
- **THEN** catalog integrity validation rejects the invalid record

### Requirement: Canonical catalog identity integrity
`defineExerciseCatalog` SHALL remain the final integrity boundary for the complete local catalog and SHALL reject duplicate stable IDs or duplicate canonical exercise names before the catalog is exposed to repositories or routes.

#### Scenario: Duplicate stable ID is supplied
- **WHEN** catalog construction receives two records with the same stable ID
- **THEN** `defineExerciseCatalog` rejects the catalog

#### Scenario: Duplicate canonical name is supplied
- **WHEN** catalog construction receives two records with the same canonical exercise name
- **THEN** `defineExerciseCatalog` rejects the catalog

#### Scenario: Complete canonical catalog is supplied
- **WHEN** all 216 unique manifest records are composed into the local catalog
- **THEN** `defineExerciseCatalog` returns the validated readonly catalog for repository and route consumers

### Requirement: Exact canonical manifest classification
Every shipped exercise SHALL use the approved body-part, difficulty, equipment, progression, and regression values from its stable-ID record in `docs/exercise-canonical-manifest.json`. Secondary body parts and equipment SHALL preserve manifest order. A null manifest relationship SHALL be represented by no populated relationship field, and no relationship SHALL be inferred from name, difficulty, equipment, or another record.

#### Scenario: Catalog classifications are normalized
- **WHEN** all final records are compared by stable ID with the manifest
- **THEN** primary body part, ordered secondary body parts, difficulty, ordered equipment, progression, and regression are exactly equal for every record

#### Scenario: Manifest relationship is null
- **WHEN** a manifest record defines no progression or regression
- **THEN** the corresponding catalog relationship field is not populated

#### Scenario: Manifest relationship is populated
- **WHEN** a manifest record defines a progression or regression stable ID
- **THEN** the catalog record contains that exact relationship and its target resolves to another final catalog record

#### Scenario: Unapproved relationship is introduced
- **WHEN** a catalog record contains a progression or regression not defined by its manifest record
- **THEN** manifest parity verification fails

### Requirement: Optional progression and regression relationships
An exercise MAY declare `progressionExerciseId` for one catalog-authored harder related movement and `regressionExerciseId` for one catalog-authored easier related movement only when the relationship is defined by the canonical manifest. Each populated relationship SHALL use another exercise's stable ID from the same complete catalog, SHALL NOT reference the source exercise itself, and SHALL remain optional independently of the other relationship. Relationship semantics SHALL NOT be inferred solely from difficulty because related movements can differ within one level.

#### Scenario: Related progression is available
- **WHEN** the manifest declares a progression relationship
- **THEN** `progressionExerciseId` identifies that exact harder related exercise without embedding or duplicating the record

#### Scenario: Related regression is available
- **WHEN** the manifest declares a regression relationship
- **THEN** `regressionExerciseId` identifies that exact easier related exercise without embedding or duplicating the record

#### Scenario: No manifest relationship is defined
- **WHEN** the manifest has a null progression or regression for an exercise
- **THEN** the corresponding catalog field is omitted

#### Scenario: Local relationship reference is invalid
- **WHEN** local catalog construction receives a self-reference or a relationship ID absent from that catalog
- **THEN** catalog integrity validation rejects the invalid relationship

#### Scenario: Complete manifest relationship graph is validated
- **WHEN** the 216-record catalog is compared with the manifest
- **THEN** all 29 populated progression/regression fields match the manifest, resolve within the catalog, and are non-self-referential

### Requirement: Existing exercise content remains modeled
The expanded exercise model SHALL retain the stable ID, name, target body area, category, description, ordered instructions, thumbnail source and alternative text, and nullable video source metadata used by the existing exercise library and detail experiences. Target body area and category SHALL preserve the current fixture copy without restricting future records to today's two body-area values and single category value.

#### Scenario: Existing exercise content is migrated
- **WHEN** an existing exercise record adopts the taxonomy fields
- **THEN** its identity, written guidance, thumbnail, and video availability remain representable without a separate compatibility record
