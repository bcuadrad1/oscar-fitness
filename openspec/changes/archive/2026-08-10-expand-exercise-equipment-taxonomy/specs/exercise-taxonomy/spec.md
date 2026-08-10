## MODIFIED Requirements

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
