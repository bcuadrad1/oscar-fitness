## MODIFIED Requirements

### Requirement: Local typed content source
The Home and Admin section content SHALL remain backed only by locally defined, statically typed placeholder data. Exercises and Routines SHALL be governed by their feature repository contracts backed by offline-capable local development data. No primary section SHALL require a backend, authentication, database, or remote content request to render its non-video content.

#### Scenario: Application runs without a data service
- **WHEN** the application is launched without network connectivity or backend configuration
- **THEN** Home and Admin render their local placeholders while Exercises and Routines render offline local data through their feature repositories

#### Scenario: Local content is type checked
- **WHEN** the project TypeScript check runs
- **THEN** Home and Admin placeholder records and the Exercise and Routine feature records satisfy their declared types

#### Scenario: Feature content is requested
- **WHEN** Exercises or Routines loads its content
- **THEN** the section uses its feature repository contract rather than the shared placeholder content source

## REMOVED Requirements

### Requirement: Routine previews
**Reason**: The static routine preview collection is replaced by the ownership-aware `RoutineRepository`, the complete routine library, and stable routine details.

**Migration**: Remove the `RoutinePreview` placeholder type and obsolete `upper-body-builder` and `mobility-reset` records from shared MVP content; migrate `full-body-basics` into the immutable 24-routine default catalog and render Routines through the new feature capabilities.
