## ADDED Requirements

### Requirement: Local typed content source
The MVP section content SHALL be backed only by locally defined, statically typed placeholder data and SHALL not require a backend or remote request to render.

#### Scenario: Application runs without a data service
- **WHEN** the application is launched without network connectivity or backend configuration
- **THEN** all four primary sections render their placeholder content

#### Scenario: Placeholder data is type checked
- **WHEN** the project TypeScript check runs
- **THEN** the exercise, routine, and section placeholder records satisfy their declared types

### Requirement: Home overview
The Home section SHALL present Oscar Fitness branding and a concise overview of the Exercises, Routines, and Admin areas.

#### Scenario: User opens Home
- **WHEN** the Home section is displayed
- **THEN** the user sees Oscar Fitness identification and an overview of the available MVP areas

### Requirement: Exercise previews
The Exercises section SHALL display a static collection of exercise preview records with enough labeled information to distinguish each exercise.

#### Scenario: User opens Exercises
- **WHEN** the Exercises section is displayed
- **THEN** multiple exercise previews are shown from the local placeholder data

### Requirement: Routine previews
The Routines section SHALL display a static collection of routine preview records with enough labeled information to distinguish each routine.

#### Scenario: User opens Routines
- **WHEN** the Routines section is displayed
- **THEN** multiple routine previews are shown from the local placeholder data

### Requirement: Non-operational Admin foundation
The Admin section SHALL communicate its future management purpose without exposing functional membership management, backend operations, or video uploads.

#### Scenario: User opens Admin
- **WHEN** the Admin section is displayed
- **THEN** the user sees clearly identified placeholder management areas with no active privileged operation

### Requirement: Mobile content presentation
Each section SHALL present readable content within Android and iOS safe areas and SHALL allow content to scroll when it exceeds the available viewport.

#### Scenario: Content exceeds screen height
- **WHEN** a section's content is taller than the available device viewport
- **THEN** the user can scroll to view the remaining content without it being obscured by system or primary navigation UI
