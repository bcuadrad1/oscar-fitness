## Context

All four primary routes render through `SectionScreen`, which currently sets `contentInsetAdjustmentBehavior="never"` and manually adds `useSafeAreaInsets()` values plus a fixed `BottomTabInset`. At the same time, every `NativeTabs.Trigger` disables Expo Router's automatic content insets. This makes application code responsible for geometry that the iOS floating tab bar and system safe areas can change at runtime.

The visible failure is Home content entering the iOS status-bar and Dynamic Island region in dark appearance. The same fixed bottom estimate can also leave a route's final card behind the floating tab bar. Because all routes share the layout, the correction belongs in the shared screen and tab-inset contract rather than route-specific padding.

## Goals / Non-Goals

**Goals:**

- Keep initial content below system status UI on Android and iOS in light and dark appearance.
- Allow every route's final card to scroll fully above native tab navigation.
- Use one shared strategy for Home, Exercises, Routines, and Admin.
- Prefer platform-provided native tab geometry over fixed tab-height estimates.
- Preserve the current visual design and content.

**Non-Goals:**

- Redesigning screen headers, cards, typography, color tokens, or navigation.
- Changing route data or adding user interactions.
- Altering normal underlap behavior after content has intentionally been scrolled beneath translucent system UI.
- Supporting new orientations or platforms beyond the application's current behavior.

## Decisions

### Restore Expo Router native tab inset management

The native tab triggers will stop disabling automatic content insets, and the shared `ScrollView` will participate in automatic inset adjustment. On iOS, Expo Router can then apply the actual floating tab bar and system geometry to the first nested scroll view instead of relying on a hard-coded tab estimate. On Android, the native tabs host continues to provide its documented bottom safe-area behavior.

Keeping `disableAutomaticContentInsets` and increasing `BottomTabInset` was rejected because a larger fixed number cannot reliably represent iOS floating-tab variants, safe-area changes, or future SDK adjustments. Measuring the native tab bar in JavaScript was rejected because the SDK already owns that layout information and does not require another stateful bridge.

### Separate visual spacing from system geometry

`SectionScreen` will retain the existing design spacing as ordinary content-container padding while removing manual values that duplicate native top inset adjustment. iOS top system clearance will come from automatic scroll insets. Android will keep only the explicit top and side safe-area treatment that native tabs do not provide automatically. Web's existing top-navigation offset remains platform-specific and unchanged.

Wrapping each route in a separate `SafeAreaView` was rejected because it would duplicate shared behavior and can combine with automatic scroll insets to create double spacing. Keeping both automatic and full manual iOS insets was rejected for the same reason.

### Reserve minimum trailing scroll space in addition to the native inset

The content container will retain a fixed design-scale bottom gap after the final card. On iOS, automatic adjustment remains enabled for native tab geometry, while the container also includes the reported bottom safe area in its trailing padding. Simulator verification showed that automatic adjustment alone did not retain that clearance at the maximum content offset. The fixed exported `BottomTabInset` constant will still be removed because no tab-height estimate is needed.

Using a spacer card or per-route footer was rejected because end clearance is a layout concern and should not depend on route content. Relying only on automatic adjustment was also rejected after maximum-scroll verification left the final card beneath the floating iOS tab bar.

### Verify one cross-product matrix

Verification will cover Home, Exercises, Routines, and Admin on both Android and iOS, in both light and dark appearance. Each case checks the initial header location; each route is also scrolled to its end to confirm the final card clears the tab bar. Existing static checks and a web export will guard against unrelated regressions.

## Risks / Trade-offs

- [Automatic and manual insets combine into excessive padding] -> Keep manual safe-area additions platform-specific and remove iOS values now owned by the scroll view; compare screenshots across the full matrix.
- [Expo Go and standalone native tabs differ slightly] -> Validate behavior with SDK 57 native tabs on both simulators and avoid assertions tied to a single pixel height.
- [A tab or system update changes native bar geometry] -> Depend on automatic native insets so the layout adapts without changing a constant.
- [Fixing the shared layout changes web spacing] -> Preserve the existing web branch and include a static web export in verification.

## Migration Plan

1. Update the shared screen and native tab configuration to use the revised inset ownership.
2. Remove the fixed bottom-tab estimate if it becomes unused.
3. Run static checks and the Android/iOS route, appearance, and end-scroll verification matrix.

Rollback consists of reverting the shared inset and tab-trigger changes; no data or route migration is involved.

## Open Questions

None.
