## 1. Typed Content Foundation

- [x] 1.1 Define small TypeScript models for exercise, routine, Home overview, and Admin placeholder records.
- [x] 1.2 Add readonly local fixture collections with multiple exercise and routine previews and no remote data dependency.
- [x] 1.3 Add the minimal shared section layout and preview-card presentation needed for consistent scrolling, safe areas, spacing, and theming.

## 2. MVP Section Screens

- [x] 2.1 Replace the generated Home route with Oscar Fitness branding and a static overview of Exercises, Routines, and Admin.
- [x] 2.2 Add the Exercises route and render the typed local exercise previews.
- [x] 2.3 Add the Routines route and render the typed local routine previews.
- [x] 2.4 Add the Admin route with clearly non-operational management placeholders and no membership, backend, or upload controls.

## 3. Primary Navigation And Cleanup

- [x] 3.1 Configure Android and iOS native tabs for Home, Exercises, Routines, and Admin with matching route names, concise labels, distinct icons, and visible selection state.
- [x] 3.2 Update the web tabs implementation with the same four routes and replace Expo Starter branding with Oscar Fitness branding.
- [x] 3.3 Remove the generated Explore route and delete starter-only components and assets after confirming they have no remaining references.

## 4. Verification

- [x] 4.1 Run the strict TypeScript check and Expo lint, then resolve all errors introduced by the change.
- [x] 4.2 Confirm the four screens render from local fixtures without network or backend configuration and that Admin exposes no functional privileged operations.
- [x] 4.3 Smoke-test Android and iOS launch-to-Home behavior, all four tab transitions and selection states, scrolling, safe-area handling, and light/dark appearance.
