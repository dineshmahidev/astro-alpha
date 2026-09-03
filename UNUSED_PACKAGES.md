# Package & Asset Audit

> Updated: Sep 3, 2026 — slimming pass for APK/AAB size
> Dependencies: 67 → 39

---

## REMOVED (28 packages, none imported in code)

`@amplitude/analytics-react-native`, `@gorhom/bottom-sheet`,
`@react-native-clipboard/clipboard`, `@react-native-community/netinfo`,
`@react-native-community/slider`, `@react-native-firebase/auth`,
`@react-native-firebase/firestore`, `@react-native-firebase/messaging`,
`@react-native-masked-view/masked-view`, `@sayem314/react-native-keep-awake`,
`date-fns`, `expo-background-fetch`, `expo-file-system`, `expo-media-library`,
`expo-notifications`, `expo-task-manager`, `lodash`, `lottie-react-native`,
`react-hook-form`, `react-native-device-info`, `react-native-pager-view`,
`react-native-performance`, `react-native-share`, `react-native-splash-view`,
`react-native-webview`, `react-native-worklets-core`, `sentry-expo`, `zod`

Notes:
- `expo-notifications` removal also removed the `android.notification` block
  from `app.json` (that key is applied by the notifications config plugin).
- Push/Firebase Auth/Firestore are fully out. If push is needed later,
  re-add `expo-notifications` (+ `android.notification` block) or
  `@react-native-firebase/messaging`.

## KEPT (zero direct imports, but required)

| Package | Reason |
|---------|--------|
| `expo`, `expo-constants`, `expo-font`, `expo-linking` | Required by `expo` / `expo-router` (transitive) |
| `expo-dev-client`, `expo-build-properties`, `expo-splash-screen` | `app.json` plugins |
| `@react-native-firebase/app` | `app.json` plugin (google-services) |
| `@react-native-community/datetimepicker` | `app.json` plugin + imported |
| `@react-native-google-signin/google-signin` | `app.json` plugin + imported |
| `expo-system-ui` | Applies root `userInterfaceStyle` at prebuild |
| `react-native-screens`, `react-native-worklets` | Required by navigation / reanimated |
| `react-native-get-random-values` | Supabase crypto polyfill |
| `react-dom`, `react-native-web` | Web builds |
| `@zoom/react-native-videosdk`, `react-native-iap` | Kept per request (video calls, purchases) |
| `expo-image-picker`, `expo-linear-gradient` | Kept per request |

## ASSET SLIMMING (this pass)

- Deleted `assets/tarot-vid.mp4` (17MB, never referenced — no video player lib installed).
- Deleted unreferenced images: `koshmira.png`, `1000305087.png`, `1000305088.png`,
  `notification-icon.png`, `react-logo*.png`.
- Converted 113 content images (tarot cards, ai-chat, onboard, banners,
  zodiac, quick-action, background) from PNG/JPEG → WebP (q80–85).
- Kept as PNG (required by `app.json` / platform): `icon.png`,
  `splash-icon.png`, `android-icon-*.png`, `favicon.png`.
- Result: `assets/` 85MB → ~27MB (includes 7.5MB `hand_landmarker.task` palm model, still referenced by docs).

## BUILD SHRINKING (this pass)

`app.json` → `expo-build-properties` android:
`enableProguardInReleaseBuilds: true`,
`enableShrinkResourcesInReleaseBuilds: true`.
Applies to release AAB only — debug APK stays large (all ABIs, no shrinking).
