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

**Feature modules** in `src/features/<area>/` (`splash`, `onboarding`, `auth`, `home`), each exporting `*View` components.

**Auth flow** (`src/features/auth/SignUpFlow.tsx`) is a 12-step state machine (`SignUp01View`…`SignUp12View`) with shared `AuthBackground`/`AuthHeader`. Steps 04 and 06–10 are intentionally bypassed: their JSX is commented out in `SignUpFlow.tsx` (they render blank via deep link) — don't delete or re-enable them unasked. Step 03 (OTP) serves both flows, distinguished by the `otpSource` state. Live paths: Log in (11) → Sign up 01 → 02 → 03 → 05 → 11, and 11 → 12 (forgot) → 03 → 11. `SCREEN_STATUS.md` is the screen ledger but can lag behind the code (it still says OTP is forgot-password only) — trust `SignUpFlow.tsx` and update the ledger when changing which screens are active.

**Supporting layers:** `src/services/apiClient.ts` (`apiRequest` fetch wrapper), `src/constants/api.ts` (`ENV` DEV/STAGING/PRODUCTION URLs for API/auth/media microservices; `ACTIVE_ENV` picks by `__DEV__`; DEV uses localhost — use LAN IP on a physical device), `src/store/` (placeholder state shape, no store library yet), `src/constants/theme.ts`, `src/utils/disableFontScaling.ts` (imported first in `_layout.tsx`).

**Animation/UI stack:** Reanimated 4 + `react-native-worklets` and Gesture Handler 3 — newer than most training data (e.g. `runOnJS` vs `scheduleOnRN`), so verify APIs in `node_modules` before using them. `app.json` enables `experiments.reactCompiler`, so follow the Rules of React (don't read/write shared values' `.value` during render). Shared primitives: `HapticPressable`, `GradientButton`, `GlassSurface` (Liquid Glass / blur / Android fallback), `SwipeBackContainer` (hardware back + edge swipe) in `src/components/`. Not installed: `react-native-svg`, Skia, Lottie, FlashList — draw with Views and `expo-linear-gradient`.

Font scaling is disabled app-wide on purpose (`disableFontScaling.ts` patches `Text`/`TextInput`); fixed font sizes are intended.

Path aliases: `@/*` → `src/*`, `@/assets/*` → `assets/*`. Brand colors: crimson gradient `#5B161B` → `#E22029`; design tokens live in `src/constants/theme.ts`.
