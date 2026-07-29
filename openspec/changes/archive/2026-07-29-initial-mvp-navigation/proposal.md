## Why

The generated Expo demo does not represent Oscar Fitness or provide the product structure needed for the first MVP. Establishing a small, public four-section navigation shell now gives future exercise and routine features a clear, extensible foundation without prematurely introducing backend or account complexity.

## What Changes

- Replace the generated Home and Explore demo experience with Oscar Fitness screens and content.
- Provide four primary sections: Home, Exercises, Routines, and Admin.
- Make every section directly accessible without login or onboarding.
- Populate each section with typed, static placeholder data that communicates its intended purpose.
- Keep the initial experience focused on navigation and presentation; do not add memberships, backend integration, persistence, or video upload workflows.

## Capabilities

### New Capabilities
- `primary-navigation`: A four-section application shell that opens on Home and lets users move between Home, Exercises, Routines, and Admin.
- `static-section-content`: Typed placeholder content for each MVP section, with clear empty or preview states and no remote data dependency.

### Modified Capabilities

None.

## Impact

- Replaces generated routes, tab configuration, demo components, and demo-facing assets where no longer needed.
- Adds routes and typed static data for Exercises, Routines, and Admin while revising Home.
- Retains Expo Router and the existing Expo SDK 57 application architecture; no backend, authentication, storage, membership, or upload dependencies are introduced.
- Affects Android and iOS navigation and screen presentation; web behavior remains compatible but is not an MVP acceptance target.
