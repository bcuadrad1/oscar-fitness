## ADDED Requirements

### Requirement: Public application entry
The application SHALL open directly to the Home section without requiring login, registration, onboarding, or membership validation.

#### Scenario: First launch
- **WHEN** a user launches the application on Android or iOS
- **THEN** the Home section is displayed without an authentication prompt

### Requirement: Four primary sections
The application SHALL provide exactly four primary navigation destinations labeled Home, Exercises, Routines, and Admin.

#### Scenario: Primary navigation is displayed
- **WHEN** any primary section is displayed
- **THEN** navigation controls for Home, Exercises, Routines, and Admin are available

#### Scenario: User changes sections
- **WHEN** a user selects a different primary navigation destination
- **THEN** the corresponding section is displayed and the selected destination is visually indicated

### Requirement: Stable route identity
Each primary section SHALL have its own Expo Router route, with Home at the root route and stable routes for Exercises, Routines, and Admin.

#### Scenario: Direct route resolution
- **WHEN** the application resolves the route for Home, Exercises, Routines, or Admin
- **THEN** it renders the screen associated with that section

### Requirement: Generated navigation is removed
The application SHALL not expose the generated Expo Explore destination or starter navigation branding in the user-facing experience.

#### Scenario: User inspects primary navigation
- **WHEN** the application navigation is displayed
- **THEN** no Explore destination or Expo Starter label is present
