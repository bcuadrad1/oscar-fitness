## MODIFIED Requirements

### Requirement: Complete exercise information
The detail screen SHALL continue to present the exercise name, target body area, category, human-readable difficulty, descriptive information, and ordered performance instructions from the typed exercise record. It SHALL resolve and present every required equipment label in declared order when the record contains one or multiple equipment IDs, and a sole `bodyweight` value SHALL retain the exact `Bodyweight / no equipment` presentation.

#### Scenario: User reviews an exercise
- **WHEN** a valid exercise detail is displayed
- **THEN** all existing required information, every required equipment label, and each instruction step are readable

#### Scenario: Exercise requires multiple equipment items
- **WHEN** a valid exercise detail declares more than one equipment ID
- **THEN** the equipment information includes every required item without affecting instructions or video behavior

#### Scenario: Development bodyweight detail is displayed
- **WHEN** Bodyweight Squat or Push-Up detail is displayed
- **THEN** its equipment information uses `Bodyweight / no equipment`
