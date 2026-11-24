import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SplashScreenView } from '@/features/splash/SplashScreenView';
import { OnboardingScreenView } from '@/features/onboarding/OnboardingScreenView';
import { SignUpFlow } from '@/features/auth/SignUpFlow';
import { HomeScreenView } from '@/features/home/HomeScreenView';
import { AdBazaarScreenView } from '@/features/adbazaar/AdBazaarScreenView';

type AppScreen = 'splash' | 'onboarding' | 'signup' | 'home';
const APP_SCREENS: readonly AppScreen[] = ['splash', 'onboarding', 'signup', 'home'];

export default function AppEntry() {
  // Dev-only deep link for fast UI inspection and the screenshot harness: /?screen=signup&step=5
  // (screen: splash | onboarding | signup | home, step: 1-12). Ignored outside __DEV__.
  const params = useLocalSearchParams<{ screen?: string; step?: string; open?: string }>();
  const devScreen = __DEV__ ? APP_SCREENS.find((s) => s === params.screen) : undefined;
  const devStep = __DEV__ ? Number(params.step) : NaN;
  const initialScreen: AppScreen = devScreen ?? 'splash';
  const initialSignUpStep = (
    Number.isInteger(devStep) && devStep >= 1 && devStep <= 12 ? devStep : 11
  ) as NonNullable<React.ComponentProps<typeof SignUpFlow>['initialStep']>;

  const [currentScreen, setCurrentScreen] = useState<AppScreen>(initialScreen);
  // Category page shown on top of Home (Home stays mounted underneath, so back is a pure slide-off).
  // Dev deep link: /?screen=home&open=adbazaar
  const [openCategory, setOpenCategory] = useState<'adbazaar' | null>(
    __DEV__ && params.open === 'adbazaar' ? 'adbazaar' : null,
  );
  const [isSplashMounted, setIsSplashMounted] = useState(initialScreen === 'splash');
  const [isSplashMerging, setIsSplashMerging] = useState(false);
  const [hasCompletedSplash, setHasCompletedSplash] = useState(initialScreen !== 'splash');
  // Set when we arrive at sign-up by sliding Home away (back): the slide already played, so the
  // sign-up screen must not run its own entrance animation on top of it.
  const [signupInstantEntry, setSignupInstantEntry] = useState(false);
  useEffect(() => {
    if (currentScreen !== 'signup') setSignupInstantEntry(false);
  }, [currentScreen]);

  const handleSplashTransitionStart = () => {
    setIsSplashMerging(true);
  };

  const handleSplashFinish = () => {
    setIsSplashMounted(false);
    setIsSplashMerging(false);
    setHasCompletedSplash(true);
    setCurrentScreen('onboarding');
  };

  const handleOnboardingProceed = () => {
    setCurrentScreen('signup');
  };

  const handleBackToOnboarding = () => {
    setCurrentScreen('onboarding');
  };

  const handleBackToSignup = () => {
    setSignupInstantEntry(true);
    setCurrentScreen('signup');
  };

  const handleReplaySplash = () => {
    setHasCompletedSplash(false);
    setIsSplashMerging(false);
    setIsSplashMounted(true);
    setCurrentScreen('splash');
  };

  return (
    <View style={styles.container}>
      {/* 1. Base Onboarding Screen (Mounted during Splash for seamless zero-flicker background and blossom transition) */}
      {(currentScreen === 'onboarding' || isSplashMounted) && (
        <View style={StyleSheet.absoluteFill}>
          <OnboardingScreenView
            animateEntrance={!hasCompletedSplash}
            active={currentScreen === 'onboarding' || isSplashMerging}
            isSpinning={isSplashMerging}
            onGetStarted={handleOnboardingProceed}
            onSkip={handleOnboardingProceed}
          />
        </View>
      )}

      {/* 2. Splash Screen Overlay (Crossfades & merges seamlessly into Onboarding) */}
      {isSplashMounted && (
        <SplashScreenView
          onTransitionStart={handleSplashTransitionStart}
          onFinish={handleSplashFinish}
        />
      )}

      {/* 3. Sign Up & Login Flow (Opens directly to Log in screen after Onboarding) */}
      {currentScreen === 'signup' && (
        <View style={StyleSheet.absoluteFill}>
          <SignUpFlow
            initialStep={initialSignUpStep}
            instantEntry={signupInstantEntry}
            onBackToOnboarding={handleBackToOnboarding}
            // revealed underneath while the first step slides away (swipe / hardware back)
            renderPreviousScreen={() => <OnboardingScreenView animateEntrance={false} />}
            onComplete={() => setCurrentScreen('home')}
            onLoginSuccess={() => setCurrentScreen('home')}
          />
        </View>
      )}

      {/* 4. Home Screen */}
      {currentScreen === 'home' && (
        <View style={StyleSheet.absoluteFill}>
          <HomeScreenView
            onBack={handleBackToSignup}
            renderPreviousScreen={() => (
              <SignUpFlow initialStep={initialSignUpStep} instantEntry />
            )}
            onLogout={() => setCurrentScreen('signup')}
            onSelectCategory={(cat) => {
              if (cat.type === 'adbazaar') setOpenCategory('adbazaar');
              else console.log('Selected category:', cat.name);
            }}
          />
        </View>
      )}

      {/* 5. AdBazaar page (over Home) */}
      {currentScreen === 'home' && openCategory === 'adbazaar' && (
        <View style={StyleSheet.absoluteFill}>
          <AdBazaarScreenView
            onBack={() => setOpenCategory(null)}
            renderPreviousScreen={() => <HomeScreenView />}
          />
        </View>
      )}

      {/* Dev helper pill for fast UI inspection */}
      {__DEV__ && (
        <View style={styles.devBar}>
          <TouchableOpacity
            testID="dev-next"
            accessibilityLabel="dev-next"
            style={styles.devButton}
            onPress={() => {
              if (currentScreen === 'splash') {
                handleSplashFinish();
              } else if (currentScreen === 'onboarding') {
                setCurrentScreen('signup');
              } else if (currentScreen === 'signup') {
                setCurrentScreen('home');
              } else {
                handleReplaySplash();
              }
            }}>
            <Text style={styles.devButtonText}>
              {currentScreen === 'splash' && 'Next: Onboarding ➔'}
              {currentScreen === 'onboarding' && 'Next: Log in ➔'}
              {currentScreen === 'signup' && 'Next: Home ➔'}
              {currentScreen === 'home' && '↺ Replay Flow'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  devBar: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    zIndex: 999,
    opacity: 0.65,
  },
  devButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  devButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
