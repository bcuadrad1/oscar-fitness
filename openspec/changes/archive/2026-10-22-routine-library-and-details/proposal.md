## Why

The Routines section is still a three-card static preview with no canonical prescriptions, repository, detail route, ownership semantics, or durable user data, while the complete 216-exercise catalog now provides stable references for a real routine foundation. Grouping the domain, seed data, library, details, persistence, and copy behavior in one change avoids repeated architecture and data-seeding cycles while stopping before guided workout execution.

## What Changes

- Introduce typed routine and routine-entry models with routine-specific focus, level, ownership, ordered canonical exercise references, reps/timed prescriptions, sets, rest, optional notes, optional estimates, and user-only lifecycle metadata.
- Add one validated immutable catalog of exactly 24 practical default routines across Chest, Back, Shoulders, Biceps, Triceps, Legs, Glutes, Core, and Full Body, covering beginner, intermediate, advanced, and experienced levels where programming quality warrants them.
- Introduce an asynchronous routine repository for listing, exact-ID lookup, ownership-aware discovery, and atomically copying immutable defaults into independent user-owned routines persisted on the local device.
- Load and validate persisted user routines during repository initialization, retain their stable identities and metadata across app reconstruction, and isolate bundled defaults from malformed local data.
- Prevent repository consumers from mutating repository-owned user state through objects returned by list, lookup, or copy operations; future mutation remains reserved for explicit validated repository operations.
- Replace the current Routines preview route with a responsive, accessible repository-backed library supporting focus and level filters.
- Add stable routine detail routes that resolve ordered exercise names through `ExerciseRepository`, render reps/timed/rest prescriptions, link to existing exercise details, and handle loading, failure, and not-found states.
- Generate concrete static detail pages for all seeded defaults while retaining the dynamic route for native and client-side runtime navigation. Device-local user copies remain reachable inside the running application, but direct or reloaded arbitrary user IDs are not guaranteed on a normal static web host.
- Preserve the existing exercise catalog, taxonomy, repository interfaces, filtering, media, and routes unchanged.
- Retire the unsupported `upper-body-builder` and `mobility-reset` preview records; retain `full-body-basics` as a concrete five-exercise beginner default routine.

## Capabilities

### New Capabilities

- `routine-catalog`: Typed routine domain, exact seeded matrix, catalog validation, asynchronous repository, ownership, immutable defaults, local user persistence, repository encapsulation, and atomic default-copy semantics.
- `routine-library`: Responsive accessible routine discovery, focus/level filtering, ownership indicators, and stable navigation from routine cards.
- `routine-detail`: Async stable-ID detail resolution, canonical exercise projection, prescription presentation, copy action, exercise links, and static route generation.

### Modified Capabilities

- `static-section-content`: Replace the placeholder Routines preview requirement with the new repository-backed routine capabilities while leaving Home and Admin placeholder content unchanged.

## Impact

- Converts `src/app/routines.tsx` into a nested Routines route stack while preserving `/routines` and its primary tab identity.
- Adds routine-focused typed data, validation, storage/repository/session/hooks, filters, cards, details, and state presentation under `src/features/routines/` and `src/components/routines/`.
- Removes obsolete routine preview data from `src/data/mvp-content.ts` without changing unrelated Home/Admin content.
- Adds the Expo-supported `@react-native-async-storage/async-storage` package for small cross-platform local user-routine persistence; adds no backend, account, login, cloud sync, cross-device synchronization, guided-execution state, timer, history, or custom builder.
- Keeps Expo web output static: all 24 bundled defaults are directly reloadable, while host-level handling of arbitrary persisted-user or unknown URLs remains outside this change and receives no SSR, backend, or hosting-specific rewrite dependency.
