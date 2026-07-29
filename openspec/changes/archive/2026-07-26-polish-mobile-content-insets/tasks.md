## 1. Shared Inset Ownership

- [x] 1.1 Re-enable Expo Router automatic content insets for all four native tab triggers.
- [x] 1.2 Update `SectionScreen` to use automatic scroll adjustment while retaining only the platform-specific visual and safe-area spacing not owned by native tabs.
- [x] 1.3 Remove the fixed bottom-tab inset estimate when unused and confirm the existing web navigation offset remains unchanged.

## 2. Static Verification

- [x] 2.1 Run strict TypeScript, Expo lint, and a static web export, resolving any regressions introduced by the inset changes.
- [x] 2.2 Confirm Home, Exercises, Routines, and Admin still use their existing typography, colors, copy, cards, and navigation destinations.

## 3. Mobile Inset Matrix

- [x] 3.1 Verify all four routes open below the iOS status bar and Dynamic Island in light and dark appearance, including an appearance change while the app is open.
- [x] 3.2 Scroll every iOS route to its maximum offset and confirm the complete final card and trailing space clear the floating native tab bar in both appearances.
- [x] 3.3 Verify the same initial safe-area and final-card clearance behavior across all four Android routes in light and dark appearance.
