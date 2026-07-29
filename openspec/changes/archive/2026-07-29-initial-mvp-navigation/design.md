## Context

Oscar Fitness currently uses the Expo SDK 57 default structure: strict TypeScript, Expo Router file-based routes under `src/app`, an Android/iOS `NativeTabs` navigator, and a separate web tabs implementation. The user-facing routes and supporting components still contain generated Expo starter material. The MVP needs a public four-section shell with useful static previews while leaving domain workflows and infrastructure for later changes.

The implementation must work on Android and iOS, preserve the existing light/dark theme behavior, and avoid new runtime dependencies. Web can remain compatible through the existing platform-specific tabs component but is not a primary acceptance target.

## Goals / Non-Goals

**Goals:**

- Establish Home, Exercises, Routines, and Admin as the four primary routes.
- Use a small typed local data layer so future real data sources can replace fixtures without rewriting screen structure.
- Give all four screens a coherent, mobile-safe presentation using existing theme foundations.
- Remove generated Expo demo content and navigation branding from the shipped experience.
- Keep the implementation easy to extend with detail routes and real workflows later.

**Non-Goals:**

- Authentication, authorization, onboarding, user accounts, or memberships.
- Backend APIs, remote fetching, caching, local persistence, or synchronization.
- Exercise or routine creation and editing workflows.
- Video selection, recording, upload, playback, or processing.
- Functional administrative operations.

## Decisions

### Retain Expo Router and platform-native primary tabs

The Android/iOS layout will extend the existing `expo-router/unstable-native-tabs` setup with four explicit triggers whose names match file-based routes. Home remains `index.tsx`; `exercises.tsx`, `routines.tsx`, and `admin.tsx` become sibling routes. The web-specific tabs implementation will expose the same destinations so route behavior does not diverge unnecessarily.

This follows the SDK 57 native tabs API already installed and configured, provides platform-native selection behavior, and avoids adding a navigation dependency. Replacing it with a custom navigator was rejected because it would add UI and state management for behavior the router already owns. Migrating to another navigation architecture was rejected because this change does not require nested flows.

### Keep placeholder data outside route components

Exercise and routine preview interfaces and readonly fixture collections will live in a focused local data module. Screen components will render those records rather than embedding repeated JSX literals. Home and Admin copy can use the same local module where it benefits consistency, without introducing repositories, services, providers, or asynchronous abstractions before they are needed.

Embedding all data directly in route files was rejected because future API adoption would couple data replacement to presentation changes. Creating a mock service layer was also rejected because asynchronous service contracts provide no current value for static-only content.

### Build a small shared section presentation

The four routes will share only the layout and preview-card primitives needed to keep safe-area, scrolling, spacing, and typography behavior consistent. Domain-specific fields remain in each route so Exercises, Routines, and Admin can evolve independently. Existing theme tokens and themed text/view components will be reused and adjusted where needed rather than introducing a new styling system.

Fully independent route markup was rejected because it would duplicate mobile inset and scrolling behavior. A generic schema-driven screen renderer was rejected because four simple screens do not justify that abstraction and it would obscure future domain-specific UI.

### Make Admin visibly non-operational

Admin remains a primary public section because it is explicitly part of the MVP navigation, but it will contain labeled preview or coming-soon areas only. Controls that imply successful writes, membership administration, or uploads will not be rendered. This prevents a static prototype from suggesting security or persistence guarantees that do not exist.

Hiding or login-gating Admin was rejected because the initial version explicitly has no login and requires Admin as one of the four main sections.

### Remove starter-only surface area selectively

Generated routes, components, and assets that are only referenced by the Expo demo will be removed after the new routes are in place. Reusable theme, splash, and platform navigation infrastructure will remain. Removal will be reference-driven rather than deleting the generated structure wholesale, reducing the chance of breaking splash or platform-specific behavior.

## Risks / Trade-offs

- [Native tabs are exposed through an unstable Expo Router entry point] -> Keep usage constrained to the existing navigation component, follow the SDK 57 API, and verify both Android and iOS; a later navigator migration remains localized.
- [A public Admin tab can be mistaken for secured functionality] -> Use explicit preview/coming-soon language and expose no mutating controls or sensitive data.
- [Static fixtures can shape UI around incomplete domain models] -> Keep record types intentionally small and presentation-oriented rather than treating them as permanent backend entities.
- [Four labels can be tight on small devices] -> Use concise labels, distinct icons, and native tab behavior; verify labels and selection states on representative Android and iOS sizes.
- [Removing starter files can leave dead imports or assets] -> Search references after replacement and run lint and strict TypeScript checks before mobile smoke testing.

## Migration Plan

1. Add the local typed fixtures and shared section presentation needed by the new screens.
2. Replace Home and add the Exercises, Routines, and Admin routes.
3. Expand native and web navigation to the four routes, then remove Explore and unreferenced starter-only UI.
4. Run static checks and smoke-test launch, tab selection, scrolling, safe areas, and light/dark appearance on Android and iOS.

Rollback consists of reverting this change; there is no stored data, backend contract, or migration state to preserve.

## Open Questions

None. Detailed visual branding, domain data fields, and Admin security will be defined by later changes.
