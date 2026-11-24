# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

The app lives in `adstreet-frontend/` (Expo SDK 58, React Native 0.88, React 19, TypeScript strict, Expo Router). Not a git repo at the parent level; `adstreet-frontend/` has its own `.git`. See also `AGENTS.md` (Expo-specific rules) and `SCREEN_STATUS.md` (screen ledger).

## Commands

Run from `adstreet-frontend/`. npm is used (`package-lock.json`).

```bash
npx expo start                # dev server (also: npm run android | ios | web | start:tunnel)
npx tsc --noEmit              # typecheck (~15 s) — the only static check; keep it at 0 errors
npx expo install <package>    # ALWAYS use this to add deps (SDK-compatible versions)
npx expo-doctor               # diagnose dependency/config issues
```

No test runner and **no ESLint config** exist: `npm run lint` / `npx expo lint` would try to install ESLint packages, so don't run it unless asked to set linting up. Run the typecheck before declaring a task done.

`react-native-web` is installed, so `npx expo start --web` renders the app in a browser — handy for layout checks, but blur/glass, haptics and native shadows differ from device. The user often has their own dev server on :8081 with a phone attached: don't stop it, and use another port (`--port 8099`) for a second instance.

Expo APIs change every SDK: before touching Expo/EAS/RN APIs, check docs for the installed major version (`https://docs.expo.dev/versions/v58.0.0/`, index at `https://docs.expo.dev/llms.txt`) rather than relying on memory. `ios/` and `android/` are not committed (Continuous Native Generation) — never hand-edit them; use `app.json` and config plugins. Native-code libraries require a dev build (`eas build --profile development`), not Expo Go. EAS profiles are in `eas.json` (preview/production build APKs).

## Architecture

**Single-route, state-driven navigation.** Despite using Expo Router, the real app is one screen: `src/app/index.tsx` holds a `currentScreen` state (`'splash' | 'onboarding' | 'signup' | 'home'`) and conditionally renders feature views. `src/app/_layout.tsx` is just a headerless `Stack` with gesture/safe-area providers. `src/app/explore.tsx` and `src/components/app-tabs.tsx` (NativeTabs) are leftover starter-template code and are not part of the live flow. New screens are currently added as views + state transitions, not as new route files.

- Splash and Onboarding are mounted simultaneously: Onboarding sits underneath while Splash overlays and merges into it (`isSplashMerging`, `hasCompletedSplash`, `animateEntrance`/`active`/`isSpinning` props) for a zero-flicker Reanimated transition. Changing either component's mount timing breaks this.
- Dev helpers in `index.tsx` (keep them): a `__DEV__` floating pill (`testID="dev-next"`) skips ahead through screens, and a `__DEV__`-only deep link `/?screen=<splash|onboarding|signup|home>&step=<1-12>` jumps straight to a screen/sign-up step.

**Back navigation** is centralised in `src/components/navigation/SwipeBackContainer.tsx`; every screen/flow that can go back wraps itself in it. Android: hardware button and system back gesture arrive via `BackHandler` (predictive back is off in `app.json`; RN 0.88's `ReactActivity` also forwards the enforced predictive-back callback of targetSdk 36 to `BackHandler`, so this keeps working on Android 16). iOS/web: interactive left-edge swipe where the current screen follows the finger and the previous screen is revealed underneath (parallax + dim). Hardware back and the header back button play the same slide-out, so all back paths look identical. To enable the slide for a screen, pass `renderPrevious` (what to show underneath; it is mounted only while sliding) and `resetKey` (changes when the parent has navigated). `onBack(source, slid)` reports whether the slide already played — if `slid`, swap screens with NO enter/exit animation (see `instant` in `SignUpFlow`, `instantEntry` props). Without `renderPrevious` back is instant and the swipe is disabled (e.g. Onboarding, where the swipe would fight the pager; Home from a non-home tab). Previews render inside a `PeekContext`: use `ScreenStatusBar` instead of expo-status-bar's `StatusBar` so a preview never changes the status bar. Flicker rules learned the hard way: the container freezes the preview when the slide starts (re-asking the parent would swap it for the new step's own previous screen, e.g. flashing Onboarding under Login), and reveals the new screen only after it has had two frames to mount, removing the preview only after the UI thread confirms the reveal. Top-level back (`goBackTo` in `index.tsx`) likewise keeps the departing screen mounted for two frames while the destination paints. Contract: after `onBack(source, true)` the parent must navigate (change `resetKey` or unmount) or call the ref's `cancelBack()` — there is deliberately NO auto spring-back timer, because on slow phones a timer pulls the old screen back over the new one while the navigation is still mounting. The sliding screen's edge shadow fades out at both ends for the same reason (otherwise a dark strip stays on the far screen edge during a slow swap). Verify transitions by sampling the page every frame, and on a CPU-throttled page (Chrome DevTools `Emulation.setCPUThrottlingRate`) to mimic a slow Android phone, not by settled screenshots. In `SignUpFlow`, `getPreviousStep` is the single source of truth for "where back goes" (used by the real back and the preview).

**Feature modules** in `src/features/<area>/` (`splash`, `onboarding`, `auth`, `home`), each exporting `*View` components.

**Auth flow** (`src/features/auth/SignUpFlow.tsx`) is a 12-step state machine (`SignUp01View`…`SignUp12View`) with shared `AuthBackground`/`AuthHeader`. Steps 04 and 06–10 are intentionally bypassed: their JSX is commented out in `SignUpFlow.tsx` (they render blank via deep link) — don't delete or re-enable them unasked. Step 03 (OTP) serves both flows, distinguished by the `otpSource` state. Live paths: Log in (11) → Sign up 01 → 02 → 03 → 05 → 11, and 11 → 12 (forgot) → 03 → 11. `SCREEN_STATUS.md` is the screen ledger but can lag behind the code (it still says OTP is forgot-password only) — trust `SignUpFlow.tsx` and update the ledger when changing which screens are active.

**Supporting layers:** `src/services/apiClient.ts` (`apiRequest` fetch wrapper), `src/constants/api.ts` (`ENV` DEV/STAGING/PRODUCTION URLs for API/auth/media microservices; `ACTIVE_ENV` picks by `__DEV__`; DEV uses localhost — use LAN IP on a physical device), `src/store/` (placeholder state shape, no store library yet), `src/constants/theme.ts`, `src/utils/disableFontScaling.ts` (imported first in `_layout.tsx`).

**Animation/UI stack:** Reanimated 4 + `react-native-worklets` and Gesture Handler 3 — newer than most training data (e.g. `runOnJS` vs `scheduleOnRN`), so verify APIs in `node_modules` before using them. `app.json` enables `experiments.reactCompiler`, so follow the Rules of React (don't read/write shared values' `.value` during render). Shared primitives: `HapticPressable`, `GradientButton`, `GlassSurface` (Liquid Glass / blur / Android fallback), `SwipeBackContainer` (hardware back + edge swipe), `BottomSheet` (drag-to-dismiss modal sheet), `SideDrawer` (left drawer in a Modal; used by `features/home/HomeMenu`) in `src/components/`. The profile screen (Sign up 05) uses `expo-image-picker` + `expo-image-manipulator` (new contextual API; `manipulateAsync` is deprecated) for photo pick → crop (`AvatarCropper`), and `ProfileFields` (text/select fields, terms checkbox) for the per-profile-type forms. Gesture Handler 3 deprecates `Gesture.Pan()` etc. in favour of hooks (`usePanGesture`, `usePinchGesture`, `useSimultaneousGestures`); `StyleSheet.absoluteFillObject` no longer exists in RN 0.88. Not installed: `react-native-svg`, Skia, Lottie, FlashList — draw with Views and `expo-linear-gradient`.

Font scaling is disabled app-wide on purpose (`disableFontScaling.ts` patches `Text`/`TextInput`); fixed font sizes are intended.

Path aliases: `@/*` → `src/*`, `@/assets/*` → `assets/*`. Brand colors: crimson gradient `#5B161B` → `#E22029`; design tokens live in `src/constants/theme.ts`.
