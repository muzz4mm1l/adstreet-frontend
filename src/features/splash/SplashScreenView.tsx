import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Text,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { GradientBackground } from '@/components/common/GradientBackground';
import { AnimationPresets } from '@/constants/theme';

const TRACK_WIDTH = 200;
const LOADING_DURATION_MS = 1500; // 1.5s loading (0-100%)
const LIFT_DURATION_MS = 500;      // 500ms come forward / lift in front
const SPIN_DURATION_MS = 1500;     // 1.5s 3D Y-axis spin & fade

interface SplashScreenViewProps {
  onTransitionStart?: () => void;
  onFinish?: () => void;
  autoAdvance?: boolean;
}

export const SplashScreenView: React.FC<SplashScreenViewProps> = ({
  onTransitionStart,
  onFinish,
  autoAdvance = true,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [percent, setPercent] = useState(0);
  const [showLoader, setShowLoader] = useState(true);
  const isTransitioningRef = useRef(false);

  // Exact matching geometry with Onboarding Radar hub
  const graphicSize = Math.min(windowWidth * 0.74, 300);
  const targetEmblemSize = graphicSize * 0.26;
  // Present slightly larger (1.35x) during splash, then seamlessly spin-scale into Onboarding emblem size
  const displayEmblemSize = targetEmblemSize * 1.35;
  const bottomPadding = Math.max(insets.bottom, 16) + (Platform.OS === 'ios' ? 4 : 8);

  // Reanimated 60fps shared values
  const containerOpacity = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.85);
  const logoTranslateY = useSharedValue(0);
  const spinY = useSharedValue(0);

  // Progress bar animation value (0 to 1 over 2 seconds)
  const progress = useSharedValue(0);
  const loaderOpacity = useSharedValue(0);

  const startSequenceTransition = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    // 1. Instantly remove loading bar after 100%
    loaderOpacity.value = withTiming(0, { duration: 150 });
    setTimeout(() => {
      setShowLoader(false);
    }, 150);

    // 2. Bring logo up / come in front for 500ms
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    logoScale.value = withTiming(1.22, {
      duration: LIFT_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
    logoTranslateY.value = withTiming(-14, {
      duration: LIFT_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });

    // 3. After 500ms lift, start the 1.5-second spinning animation
    setTimeout(() => {
      // Wake up Onboarding elements underneath
      onTransitionStart?.();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

      // 3D Y-axis spin (0° to 360°) over 1.5 seconds
      spinY.value = withTiming(360, {
        duration: SPIN_DURATION_MS,
        easing: Easing.inOut(Easing.cubic),
      });

      // Contract scale and return Y position to match Onboarding emblem coordinates exactly
      logoScale.value = withTiming(1 / 1.35, {
        duration: SPIN_DURATION_MS,
        easing: Easing.inOut(Easing.cubic),
      });
      logoTranslateY.value = withTiming(0, {
        duration: SPIN_DURATION_MS,
        easing: Easing.inOut(Easing.cubic),
      });

      // Smoothly fade out splash canvas during the 1.5s spin to unveil Onboarding
      containerOpacity.value = withTiming(0, {
        duration: SPIN_DURATION_MS,
        easing: Easing.inOut(Easing.cubic),
      });

      // 4. Clean unmount on JS thread once 1.5s spin completes
      setTimeout(() => {
        onFinish?.();
      }, SPIN_DURATION_MS + 30);
    }, LIFT_DURATION_MS);
  }, [
    containerOpacity,
    loaderOpacity,
    logoScale,
    logoTranslateY,
    onFinish,
    onTransitionStart,
    spinY,
  ]);

  useEffect(() => {
    // 1. Logo Entrance Animation on UI thread
    logoOpacity.value = withTiming(1, { duration: 450 });
    logoScale.value = withSpring(1, AnimationPresets.spring);

    // 2. Fade in progress loader smoothly
    loaderOpacity.value = withTiming(1, { duration: 350 });

    // 3. Drive 60fps hardware progress bar fill (0 -> 1 over 2000ms)
    progress.value = withTiming(1, {
      duration: LOADING_DURATION_MS,
      easing: Easing.linear,
    });

    // 4. Drive numerical percentage text counter (0% -> 100% over 2000ms)
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const current = Math.min(
        100,
        Math.round((elapsed / LOADING_DURATION_MS) * 100)
      );
      setPercent(current);
      if (current >= 100) {
        clearInterval(interval);
      }
    }, 20);

    // 5. Enforce strict 2-second loading limit, then trigger lift & spin
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (autoAdvance) {
      timer = setTimeout(() => {
        startSequenceTransition();
      }, LOADING_DURATION_MS);
    }

    return () => {
      clearInterval(interval);
      if (timer) clearTimeout(timer);
    };
  }, [
    autoAdvance,
    loaderOpacity,
    logoOpacity,
    logoScale,
    progress,
    startSequenceTransition,
  ]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { perspective: 800 },
      { translateY: logoTranslateY.value },
      { scale: logoScale.value },
      { rotateY: `${spinY.value}deg` },
    ],
  }));

  const animatedFillStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [-TRACK_WIDTH, 0]),
      },
    ],
  }));

  const animatedLoaderStyle = useAnimatedStyle(() => ({
    opacity: loaderOpacity.value,
  }));

  return (
    <Animated.View style={[styles.outerContainer, animatedContainerStyle]}>
      <GradientBackground style={styles.container}>
        <StatusBar style="light" />

        {/* Tap anywhere to skip loading and immediately start lift & spin */}
        <TouchableOpacity
          style={styles.touchable}
          activeOpacity={1}
          onPress={() => startSequenceTransition()}>
          <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            {/* 1. Header spacer matching Onboarding's ProgressBar height exactly */}
            <View style={styles.headerSpacer} />

            {/* 2. Middle Content Area matching Onboarding's Slide layout */}
            <View style={styles.contentArea}>
              {/* Center Emblem Section: Mathematically matched to Onboarding Radar hub */}
              <View style={styles.graphicSection}>
                <Animated.View style={[styles.logoWrapper, animatedLogoStyle]}>
                  <Image
                    source={require('@/assets/images/splash-logo-clean.png')}
                    style={{
                      width: displayEmblemSize,
                      height: displayEmblemSize,
                    }}
                    contentFit="contain"
                    transition={200}
                    cachePolicy="memory-disk"
                  />
                </Animated.View>
              </View>

              {/* Lower Section: 0-100% Animated Progress Loader (removed after 100%) */}
              <View style={styles.loaderSection}>
                {showLoader && (
                  <Animated.View
                    style={[styles.loaderWrapper, animatedLoaderStyle]}>
                    <View style={styles.track}>
                      <Animated.View style={[styles.fill, animatedFillStyle]} />
                    </View>

                    <View style={styles.percentRow}>
                      <Text style={styles.percentText}>{percent}%</Text>
                    </View>
                  </Animated.View>
                )}
              </View>
            </View>

            {/* 3. Bottom Spacer matching Onboarding's CTA section height */}
            <View style={[styles.bottomSpacer, { height: 54 + bottomPadding }]} />
          </SafeAreaView>
        </TouchableOpacity>
      </GradientBackground>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  container: {
    flex: 1,
  },
  touchable: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerSpacer: {
    height: 48, // Matches Onboarding ProgressBar height + padding exactly
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  graphicSection: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  loaderSection: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  loaderWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    width: TRACK_WIDTH,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.32)',
  },
  fill: {
    width: TRACK_WIDTH,
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  percentRow: {
    marginTop: 10,
    alignItems: 'center',
  },
  percentText: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.6,
    fontVariant: ['tabular-nums'],
  },
  bottomSpacer: {
    height: 54 + (Platform.OS === 'ios' ? 12 : 24), // Matches CTA button height + bottom padding
  },
});
