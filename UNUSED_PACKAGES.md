# Unused Packages Analysis

> Generated on: Sep 2, 2026
> Project: MypracticalApp (Koshmira)
> Total Dependencies: 77 | Unused: 26 | Safe to Remove

---

## SAFE TO REMOVE (26 Packages)

These packages are installed but **never imported** anywhere in the source code.

### Analytics & Tracking
| Package | What It Does | Why Unused |
|---------|-------------|------------|
| `@amplitude/analytics-react-native` | Product analytics | No events are tracked anywhere |

### UI Components
| Package | What It Does | Why Unused |
|---------|-------------|------------|
| `@giphy/react-native-sdk` | GIF integration | Never imported in any screen |
| `@react-native-community/slider` | Slider component | Never imported |
| `@react-native-masked-view/masked-view` | Masked text/views | Never imported |
| `expo-linear-gradient` | Gradient backgrounds | Never imported |
| `expo-symbols` | SF Symbols (iOS) | Never imported |
| `expo-system-ui` | System UI colors | Never imported |

### Firebase
| Package | What It Does | Why Unused |
|---------|-------------|------------|
| `@react-native-firebase/auth` | Firebase Authentication | App uses Supabase Auth instead |
| `@react-native-firebase/firestore` | Cloud Firestore | App uses Supabase Database instead |

### Expo SDK
| Package | What It Does | Why Unused |
|---------|-------------|------------|
| `expo-constants` | App constants | Never imported |
| `expo-font` | Custom fonts | Never imported |
| `expo-linking` | Deep linking / URLs | Never imported |

### Device & System
| Package | What It Does | Why Unused |
|---------|-------------|------------|
| `@react-native-clipboard/clipboard` | Clipboard access | Never imported |
| `@react-native-community/netinfo` | Network connectivity check | Never imported |
| `@react-native-masked-view/masked-view` | Masked views | Never imported |
| `@sayem314/react-native-keep-awake` | Prevent screen sleep | Never imported |
| `react-native-background-timer` | Background timer | Never imported |
| `react-native-calendar-events` | Calendar access | Never imported |
| `react-native-default-preference` | Native preferences | Never imported |
| `react-native-device-info` | Device details | Never imported |
| `react-native-orientation-locker` | Orientation lock | Never imported |
| `react-native-performance` | Performance metrics | Never imported |

### Media
| Package | What It Does | Why Unused |
|---------|-------------|------------|
| `react-native-sound` | Audio playback | Never imported |
| `react-native-splash-view` | Splash screen | Never imported |
| `react-native-video` | Video player | Never imported |
| `react-native-webview` | WebView component | Never imported |
| `react-native-pager-view` | Swipeable pages | Never imported |

---

## KEEP - Peer Deps (Do NOT Remove)

These are not directly imported but are required by other packages as peer dependencies.

| Package | Required By |
|---------|------------|
| `react-native-screens` | `@react-navigation/native`, `@react-navigation/bottom-tabs` |
| `react-native-get-random-values` | `@supabase/supabase-js` (crypto polyfill) |
| `react-native-webrtc` | `@jitsi/react-native-sdk` |
| `react-dom` | `react-native-web`, web builds |
| `react-native-web` | Web platform support |

---

## KEEP - App.json Plugins (Do NOT Remove)

These are configured as plugins in `app.json` and run at build time even if not directly imported.

| Package | Plugin Config |
|---------|--------------|
| `@react-native-firebase/app` | `expo.plugins` in app.json |
| `expo-build-properties` | `expo.plugins` in app.json |
| `expo-dev-client` | `expo.plugins` in app.json |
| `expo-splash-screen` | `expo.plugins` in app.json |
| `expo-vision-camera-v4-mediapipe` | `expo.plugins` in app.json |

---

## KEEP - Newly Installed (For Future Use)

These were just installed and are **intended to be wired up**.

| Package | Purpose |
|---------|---------|
| `react-native-iap` | In-App Purchases |
| `expo-notifications` | Push notifications |
| `expo-file-system` | File read/write |
| `expo-media-library` | Save to gallery |
| `react-native-share` | Native share sheet |
| `lottie-react-native` | Rich animations |
| `@gorhom/bottom-sheet` | Bottom sheet modals |
| `sentry-expo` | Crash reporting |
| `@stripe/stripe-react-native` | Payment processing |
| `expo-task-manager` | Background tasks |
| `expo-background-fetch` | Background data sync |
| `@react-native-firebase/messaging` | Push token management |
| `zod` | Runtime validation |
| `react-hook-form` | Form management |
| `date-fns` | Date utilities |
| `lodash` | Utility functions |

---

## Quick Remove Command

```bash
npm uninstall \
  @amplitude/analytics-react-native \
  @giphy/react-native-sdk \
  @react-native-clipboard/clipboard \
  @react-native-community/netinfo \
  @react-native-community/slider \
  @react-native-masked-view/masked-view \
  @react-native-firebase/auth \
  @react-native-firebase/firestore \
  @sayem314/react-native-keep-awake \
  expo-constants \
  expo-font \
  expo-linear-gradient \
  expo-linking \
  expo-symbols \
  expo-system-ui \
  react-native-background-timer \
  react-native-calendar-events \
  react-native-default-preference \
  react-native-device-info \
  react-native-orientation-locker \
  react-native-pager-view \
  react-native-performance \
  react-native-sound \
  react-native-splash-view \
  react-native-video \
  react-native-webview \
  --legacy-peer-deps
```

---

## Summary

| Category | Count |
|----------|-------|
| Safe to Remove | 26 |
| Keep - Peer Deps | 5 |
| Keep - App.json Plugins | 5 |
| Keep - Newly Installed | 16 |
| **Total Unused (Safe)** | **26** |
