import { useAppTheme } from '@/theme/useAppTheme';
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SplashScreenView } from '@/features/splash/SplashScreenView';
import { OnboardingScreenView } from '@/features/onboarding/OnboardingScreenView';
import { SignUpFlow } from '@/features/auth/SignUpFlow';
import { HomeScreenView } from '@/features/home/HomeScreenView';
import { AdBazaarScreenView } from '@/features/adbazaar/AdBazaarScreenView';
import { AdBazaarCategoryScreenView } from '@/features/adbazaar/AdBazaarCategoryScreenView';
import {
  ADBAZAAR_QUICK_CATEGORIES,
  AdBazaarQuickCategory,
} from '@/features/adbazaar/adBazaarData';
import { ApplyJobScreenView } from '@/features/adbazaar/ApplyJobScreenView';
import { JobDetailsScreenView } from '@/features/adbazaar/JobDetailsScreenView';
import { JobListing } from '@/features/adbazaar/PopularJobs';
import type { HomeTab } from '@/features/home/LiquidTabBar';
import { GlobalTabBar } from '@/components/navigation/FloatingTabBarOverlay';
import { BlurTargetView } from 'expo-blur';

type AppScreen = 'splash' | 'onboarding' | 'signup' | 'home';
const APP_SCREENS: readonly AppScreen[] = ['splash', 'onboarding', 'signup', 'home'];

export default function AppEntry() {
  const theme = useAppTheme();
  // Dev-only deep link for fast UI inspection and the screenshot harness: /?screen=signup&step=5
  // (screen: splash | onboarding | signup | home, step: 1-12). Ignored outside __DEV__.
  const params = useLocalSearchParams<{
    screen?: string;
    step?: string;
    open?: string;
    tab?: string;
    jobStep?: string;
  }>();
  const devScreen = __DEV__ ? APP_SCREENS.find((s) => s === params.screen) : undefined;
  const devStep = __DEV__ ? Number(params.step) : NaN;
  const devJobStep =
    __DEV__ &&
    (params.jobStep === 'form' ||
      params.jobStep === 'preview' ||
      params.jobStep === 'listings' ||
      params.jobStep === 'profile')
      ? params.jobStep
      : undefined;
  const initialScreen: AppScreen = devScreen ?? 'splash';
  const initialSignUpStep = (
    Number.isInteger(devStep) && devStep >= 1 && devStep <= 12 ? devStep : 11
  ) as NonNullable<React.ComponentProps<typeof SignUpFlow>['initialStep']>;

  const [currentScreen, setCurrentScreen] = useState<AppScreen>(initialScreen);
  // Category page shown on top of Home (Home stays mounted underneath, so back is a pure slide-off).
  // Dev deep link: /?screen=home&open=adbazaar
  const [openCategory, setOpenCategory] = useState<'adbazaar' | null>(
    __DEV__ && (params.open === 'adbazaar' || params.open === 'creators') ? 'adbazaar' : null,
  );
  const [selectedBazaarCategory, setSelectedBazaarCategory] = useState<AdBazaarQuickCategory | null>(
    __DEV__ && params.open === 'creators' ? ADBAZAAR_QUICK_CATEGORIES[0] : null,
  );
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [applyJob, setApplyJob] = useState<JobListing | null>(null);
  // Floating tab bar tapped on an inner page: close every pushed page and show that Home tab.
  const [homeTab, setHomeTab] = useState<HomeTab>(
    __DEV__ && params.tab === 'search'
      ? 'search'
      : __DEV__ && params.tab === 'add'
        ? 'add'
        : 'home',
  );
  const blurTargetRef = useRef<React.ComponentRef<typeof View>>(null);
  const goToHomeTab = (tab: HomeTab) => {
    setApplyJob(null);
    setSelectedJob(null);
    setSelectedBazaarCategory(null);
    setOpenCategory(null);
    setHomeTab(tab);
  };
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

  // Sign-up -> Onboarding (back). The departing sign-up flow (already slid off-screen, still
  // showing the frozen Onboarding preview) stays mounted for two frames, so the real Onboarding
  // can mount and lay out behind it. Unmounting it immediately exposed a half-laid-out Onboarding
  // for a frame (content jumping up, then settling).
  const [leavingSignup, setLeavingSignup] = useState(false);
  const handleBackToOnboarding = () => {
    setCurrentScreen('onboarding');
    setLeavingSignup(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setLeavingSignup(false)));
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
    <View style={[styles.container, { backgroundColor: theme.canvas }]}>
      <BlurTargetView ref={blurTargetRef} style={StyleSheet.absoluteFill}>
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
      {(currentScreen === 'signup' || leavingSignup) && (
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
            tab={homeTab}
            initialJobStep={devJobStep}
            onTabChange={setHomeTab}
            onBack={handleBackToSignup}
            renderPreviousScreen={() => (
              <SignUpFlow initialStep={initialSignUpStep} instantEntry />
            )}
            onLogout={() => setCurrentScreen('signup')}
            onSelectCategory={(cat) => {
              if (cat.type === 'adbazaar') setOpenCategory('adbazaar');
              else console.log('Selected category:', cat.name);
            }}
            onPressJob={(job) => setSelectedJob(job)}
            onOpenAdBazaar={() => setOpenCategory('adbazaar')}
          />
        </View>
      )}

      {/* 5. AdBazaar page (over Home) */}
      {currentScreen === 'home' && openCategory === 'adbazaar' && (
        <View style={StyleSheet.absoluteFill}>
          <AdBazaarScreenView
            onBack={() => {
              setSelectedBazaarCategory(null);
              setSelectedJob(null);
              setOpenCategory(null);
            }}
            onSelectCategory={(category) => setSelectedBazaarCategory(category)}
            onPressJob={(job) => setSelectedJob(job)}
            renderPreviousScreen={() => <HomeScreenView />}
          />
        </View>
      )}

      {/* 5b. AdBazaar Category page (over AdBazaar, e.g. Content Creators) */}
      {currentScreen === 'home' && openCategory === 'adbazaar' && selectedBazaarCategory && (
        <View style={StyleSheet.absoluteFill}>
          <AdBazaarCategoryScreenView
            category={selectedBazaarCategory}
            onBack={() => {
              setSelectedJob(null);
              setSelectedBazaarCategory(null);
            }}
            onPressJob={(job) => setSelectedJob(job)}
            renderPreviousScreen={() => <AdBazaarScreenView onBack={() => {}} />}
          />
        </View>
      )}

      {/* 6. Job Details page (over AdBazaar Category, AdBazaar, or Home Global Search) */}
      {currentScreen === 'home' && selectedJob && (
        <View style={StyleSheet.absoluteFill}>
          <JobDetailsScreenView
            job={selectedJob}
            onApply={(job) => setApplyJob(job)}
            onBack={() => {
              setApplyJob(null);
              setSelectedJob(null);
            }}
            renderPreviousScreen={() =>
              selectedBazaarCategory ? (
                <AdBazaarCategoryScreenView
                  category={selectedBazaarCategory}
                  onBack={() => {}}
                 
                />
              ) : openCategory === 'adbazaar' ? (
                <AdBazaarScreenView onBack={() => {}} />
              ) : (
                <HomeScreenView initialTab="search" />
              )
            }
          />
        </View>
      )}

      {/* 7. Apply to this role (over Job Details) */}
      {currentScreen === 'home' && selectedJob && applyJob && (
        <View style={StyleSheet.absoluteFill}>
          <ApplyJobScreenView
            job={applyJob}
            onBack={() => setApplyJob(null)}
            renderPreviousScreen={() => (
              <JobDetailsScreenView job={selectedJob} onBack={() => {}} />
            )}
          />
        </View>
      )}

      </BlurTargetView>

      {/* One floating tab bar for every page */}
      {currentScreen === 'home' && (
        <GlobalTabBar active={homeTab} onChange={goToHomeTab} androidBlurTarget={blurTargetRef} />
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
