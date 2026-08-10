## Why

Oscar Fitness has a validated taxonomy and repository foundation but only two local exercise records, so it cannot yet represent the approved chest portion of the canonical 216-exercise manifest. Seeding this first bounded batch establishes the catalog-content workflow while preserving the current library, detail, routing, and media contracts.

## What Changes

- Seed exactly the 20 chest records explicitly selected from `docs/exercise-canonical-manifest.json`, preserving manifest order, IDs, names, body-part assignments, difficulties, ordered equipment, and only the six approved progression/regression references.
- Reconcile the existing `push-up` fixture as the canonical Push-Up record instead of duplicating it; retain its current description, instructions, thumbnail, unavailable-video behavior, and stable ID while adding its approved regression to `incline-push-up`.
- Add the remaining 19 chest records with original concise descriptions and ordered instructions, `Chest / upper body` presentation area, `Strength` category, the existing bundled Push-Up image as placeholder media with meaningful per-record alternative text, and the current bunny development video source/label strategy.
- Retain Bodyweight Squat unchanged, producing 20 chest records and 21 total local records after this batch.
- Keep catalog construction behind the existing assertion/factory so IDs, body-part assignments, equipment assignments, and relationship references remain valid before repository access.
- Preserve asynchronous repository methods, exact stable-ID lookup, unknown-ID `null`, list/search/body-area/difficulty behavior, cards, details, accessibility, routes, static route generation, themes, and video states.
- Do not add the manifest's other chest-primary records or any back, legs, shoulders, arms, core, or full-body records; do not add taxonomy values, filters, routines, tracking, accounts, persistence, APIs, databases, or UI redesign.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `exercise-library`: Replace the exact-two-record development catalog requirement with the approved 21-record local catalog, including 20 canonical chest records, stable Push-Up reconciliation, approved classifications/relationships, and expanded difficulty/search/static-route expectations.
- `exercise-video-detail`: Expand authored instruction-content and development-media requirements for the 19 added chest exercises while retaining Bodyweight Squat media and Push-Up's unavailable-video behavior.

## Impact

- Affected code: local exercise catalog data in `src/features/exercises/exercise-repository.ts`, with an exercise-focused fixture module permitted if needed to keep repository behavior separate from the larger authored dataset.
- Stable domain data: adds 19 IDs and updates only Push-Up's approved regression relationship; no taxonomy or `Exercise` shape change.
- Repository and routes: signatures and async/null semantics remain unchanged; static web export grows from two to 21 concrete exercise detail routes.
- Media and assets: no new asset or dependency; new records share the bundled Push-Up placeholder source and current bunny development URL, while Push-Up remains source-less.
- Verification: exact counts/order/data, unique IDs/names, relationship integrity, representative discovery/equipment rendering, strict TypeScript, lint, static web export, and strict OpenSpec validation.
