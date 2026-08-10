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
The exercise domain SHALL define stable equipment IDs `bodyweight`, `dumbbell`, `barbell`, `cable`, `machine`, `smith-machine`, `kettlebell`, `resistance-band`, `bench`, `pull-up-dip-station`, and `other`, with corresponding labels `Bodyweight`, `Dumbbell`, `Barbell`, `Cable`, `Machine`, `Smith machine`, `Kettlebell`, `Resistance band`, `Bench`, `Pull-up / dip station`, and `Other`. Every exercise SHALL declare one or more unique equipment IDs in display order. `bodyweight` SHALL represent body mass as resistance and MAY coexist with required apparatus; when `bodyweight` is the sole value, presentation SHALL use `Bodyweight / no equipment`. `other` MAY coexist with known IDs when both known and unclassified equipment are required.

#### Scenario: Exercise requires multiple equipment items
- **WHEN** an exercise requires more than one equipment type
- **THEN** its `equipmentIds` contains each required canonical ID and consumers can resolve every display label

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

### Requirement: Optional progression and regression relationships
An exercise MAY declare `progressionExerciseId` for one catalog-authored harder related movement and `regressionExerciseId` for one catalog-authored easier related movement. Each populated relationship SHALL use another exercise's stable ID from the same catalog, SHALL NOT reference the source exercise itself, and SHALL remain optional independently of the other relationship. Relationship semantics SHALL NOT be inferred solely from difficulty because related movements can differ within one level.

#### Scenario: Related progression is available
- **WHEN** an exercise declares a progression relationship
- **THEN** `progressionExerciseId` identifies the harder related exercise without embedding or duplicating that record

#### Scenario: Related regression is available
- **WHEN** an exercise declares a regression relationship
- **THEN** `regressionExerciseId` identifies the easier related exercise without embedding or duplicating that record

#### Scenario: No valid related movement is in the catalog
- **WHEN** an exercise has no applicable progression or regression record
- **THEN** either or both relationship fields may be omitted

#### Scenario: Local relationship reference is invalid
- **WHEN** local catalog construction receives a self-reference or a relationship ID absent from that catalog
- **THEN** catalog integrity validation rejects the invalid relationship

### Requirement: Existing exercise content remains modeled
The expanded exercise model SHALL retain the stable ID, name, target body area, category, description, ordered instructions, thumbnail source and alternative text, and nullable video source metadata used by the existing exercise library and detail experiences. Target body area and category SHALL preserve the current fixture copy without restricting future records to today's two body-area values and single category value.

#### Scenario: Existing exercise content is migrated
- **WHEN** an existing exercise record adopts the taxonomy fields
- **THEN** its identity, written guidance, thumbnail, and video availability remain representable without a separate compatibility record
