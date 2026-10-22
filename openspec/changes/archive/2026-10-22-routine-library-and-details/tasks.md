## 1. Routine Domain and Default Catalog

- [x] 1.1 Review the exact Expo SDK 57 Router, navigation, and AsyncStorage documentation required by `AGENTS.md` before changing application code.
- [x] 1.2 Add routine ownership, focus, level, and reps/timed prescription types with human-readable taxonomy labels and the specified optional metadata constraints.
- [x] 1.3 Implement default and user routine validators plus `defineRoutineCatalog` as the single default integrity boundary, including exact exercise-reference validation against `LOCAL_EXERCISES` and recursive freezing.
- [x] 1.4 Author `DEFAULT_ROUTINES` with the exact 24-routine, 109-entry prescription matrix, stable IDs, order, descriptions, estimates, rest values, and notes from the design.
- [x] 1.5 Add automated catalog verification for all model invariants, the exact focus/level distributions, 109 unique entry IDs, 86 unique exercise references, 9 timed entries, deep immutability, zero unresolved canonical exercise IDs, and deterministic whole-matrix drift detection covering every routine and ordered entry field without a second manually maintained 109-entry matrix.

## 2. Local User Persistence

- [x] 2.1 Install the Expo-compatible `@react-native-async-storage/async-storage` package with `npx expo install` and add the injectable `RoutineStorage` boundary plus namespaced AsyncStorage adapter.
- [x] 2.2 Implement the versioned user-routine envelope so serialization includes only exact user routine data and never duplicates `DEFAULT_ROUTINES`, default entries, exercise metadata, or derived labels.
- [x] 2.3 Implement retryable repository initialization that loads storage once per successful construction, validates unknown persisted records and collisions before exposure, preserves accepted record identity/order, and safely omits malformed data without changing defaults.
- [x] 2.4 Add automated storage-boundary coverage for absent data, valid reconstruction, rejected reads, malformed JSON/envelopes, unsupported versions, mixed valid/invalid records, canonical-reference failures, and default/user ID collisions.

## 3. Repository and Copy Semantics

- [x] 3.1 Add the asynchronous `RoutineRepository` implementation whose operations await initialization, list bundled defaults followed by persisted users, and perform exact case-sensitive ID lookup.
- [x] 3.2 Build default copy candidates with injected ID and clock dependencies, independently allocated routine and entry objects, noncolliding IDs, source provenance, Copy naming, and equal valid ISO timestamps.
- [x] 3.3 Serialize copy operations and commit the complete next user envelope to storage before changing visible repository state, resolving the copy, or incrementing the session revision.
- [x] 3.4 Return new list arrays, recursively immutable defaults, and detached deep user snapshots from list, lookup, and copy so callers cannot mutate repository-owned records.
- [x] 3.5 Add automated repository coverage for list/lookup order, invalid copy sources and metadata, concurrent copy serialization, write-failure rollback, repeated-copy uniqueness, copy/reconstruct identity preservation, unduplicated defaults, and returned-object mutation isolation from defaults, siblings, persisted data, and later reads.

## 4. Routine Discovery State

- [x] 4.1 Add pure focus-and-level filtering with `All` choices, exact-match AND semantics, stable repository order, and a reset operation.
- [x] 4.2 Add routine list and exact-ID hooks with initialization-aware loading/success/error states, retry support, and stale-result protection across repository, request, retry, and session revision changes.
- [x] 4.3 Add a Routines stack session provider that owns the repository and filter state, preserves filters across nested navigation, reloads persisted users in a reconstructed session, and increments a revision only after a successful persisted copy.
- [x] 4.4 Add detail exercise-projection state that resolves canonical metadata through `ExerciseRepository`, preserves routine entry order, handles missing references explicitly, and retries independently from routine lookup.
- [x] 4.5 Add executable provider/hook verification for successful and failed copy revisions, pending-copy deduplication, stale-result protection, filter lifetime, independent routine/exercise retry behavior, post-copy discovery, and persisted-copy reconstruction.

## 5. Library and Detail Presentation

- [x] 5.1 Build accessible routine state, filter, and card components that show required summary and ownership data, omit absent estimates, and adapt from one to two columns without overflow.
- [x] 5.2 Build the routine detail presentation with ownership metadata, ordered exercise links, discriminator-specific reps or timed prescriptions, and optional rest and notes without synthesized placeholders.
- [x] 5.3 Add independent accessible loading, initialization/error/retry, missing-reference, and not-found presentation for routine and exercise data while keeping resolved detail content available where specified.
- [x] 5.4 Add the default-only copy control with pending deduplication through durable commit, inline validation/persistence failure feedback, success navigation to the returned user routine, and no copy or editing controls on user-owned details.

## 6. Nested Routes and Placeholder Migration

- [x] 6.1 Replace `src/app/routines.tsx` with a nested Routines stack layout and repository-backed index route while preserving the `/routines` URL, primary tab identity, safe areas, theme behavior, and filter session lifetime.
- [x] 6.2 Add `/routines/[routineId]` with native back navigation, runtime default/persisted-user lookup, in-app unknown-ID handling, and static parameters containing each of the 24 default IDs exactly once and no user IDs; guarantee direct/reloaded static-web URLs only for generated defaults, not arbitrary persisted-user or unknown IDs.
- [x] 6.3 Remove `RoutinePreview` and the obsolete shared routine records from `src/data/mvp-content.ts` while retaining unrelated Home/Admin content and keeping `full-body-basics` only in the canonical default catalog.
- [x] 6.4 Verify routine exercise links preserve the existing `/exercises/[exerciseId]` contract and that no exercise domain, repository, filter, media, or route behavior changed.

## 7. End-to-End Verification

- [x] 7.1 Run catalog, storage, and repository verification plus TypeScript checking and linting, including copy/reconstruct stability, malformed-data isolation, persistence-failure atomicity, unduplicated defaults, and returned-snapshot mutation attempts.
- [x] 7.2 Run isolated Expo web/static export checks, assert concrete pages for exactly all 24 defaults, and verify copied-user and unknown-ID behavior separately through runtime navigation without claiming arbitrary direct static-host URLs.
- [x] 7.3 Manually verify narrow mobile and wide web layouts, light/dark themes, Android/iOS safe-area and floating-tab clearance, tab/back/deep-link navigation, retained filters, restart persistence, copy refresh behavior, persistence error feedback, touch targets, and screen-reader semantics.
- [x] 7.4 Run `pnpm exec expo install --check` informationally, confirm AsyncStorage is compatible and not flagged, and document unrelated SDK dependency drift as pre-existing technical debt without upgrading it in this change.
- [x] 7.5 Perform a final implementation audit; resolve every High finding and explicitly evaluate any remaining Medium or Low finding before archive readiness.
