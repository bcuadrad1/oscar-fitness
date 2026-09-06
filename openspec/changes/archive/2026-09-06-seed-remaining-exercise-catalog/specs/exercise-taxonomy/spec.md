## ADDED Requirements

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

## MODIFIED Requirements

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
