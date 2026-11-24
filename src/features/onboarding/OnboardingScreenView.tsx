import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  FlatList,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import { GradientBackground } from '@/components/common/GradientBackground';
import { RadarGraphic } from '@/components/onboarding/RadarGraphic';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { SwipeBackContainer } from '@/components/navigation/SwipeBackContainer';

export interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: "First Industry Platform\nfor Marketing & Advertising\nProfessionals",
    subtitle: 'One destination for jobs, Gurus, news,\nevents, courses, and podcasts.',
  },
  {
    id: '2',
    title: 'Connect with Industry Gurus\n& Expand Your Professional\nNetwork',
    subtitle: 'Learn from seasoned leaders, collaborate\non projects, and grow your reach.',
  },
  {
    id: '3',
    title: 'Empower Your Advertising\n& Scale Your Creative\nCareer',
    subtitle: 'Find top jobs, read breaking industry leaks,\nand showcase your portfolio.',
  },
];

interface OnboardingScreenViewProps {
  onGetStarted?: () => void;
  onSkip?: () => void;
  animateEntrance?: boolean;
  active?: boolean;
  isSpinning?: boolean;
}

export const OnboardingScreenView: React.FC<OnboardingScreenViewProps> = ({
  onGetStarted,
  onSkip,
  animateEntrance = false,
  active = true,
  isSpinning = false,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / windowWidth);
    if (index !== currentSlideIndex && index >= 0 && index < ONBOARDING_SLIDES.length) {
      setCurrentSlideIndex(index);
    }
  };

  const handleNext = () => {
    if (currentSlideIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    } else {
      onGetStarted?.();
    }
  };

  const handleBack = () => {
    if (currentSlideIndex > 0) {
      const prevIndex = currentSlideIndex - 1;
      setCurrentSlideIndex(prevIndex);
      flatListRef.current?.scrollToIndex({
        index: prevIndex,
        animated: true,
      });
    }
  };

  const graphicSize = Math.min(windowWidth * 0.74, 300);

  // Staggered Entrance Animations harmonized with Splash 1.5s 3D spin-fade
  const headerEntering = animateEntrance
    ? FadeInDown.duration(650).delay(500)
    : undefined;
  const graphicEntering = animateEntrance
    ? ZoomIn.duration(1100).delay(200)
    : undefined;
  const textEntering = animateEntrance
    ? FadeInUp.duration(650).delay(800)
    : undefined;
  const bottomEntering = animateEntrance
    ? FadeInUp.duration(650).delay(1000)
    : undefined;

  const renderSlide = ({
    item,
    index,
  }: {
    item: OnboardingSlide;
    index: number;
  }) => {
    const isActive = index === currentSlideIndex && active;

    return (
      <View style={[styles.slidePage, { width: windowWidth }]}>
        {/* Central Visual Graphic with Outward Bloom Animation */}
        <Animated.View
          entering={index === 0 && !isSpinning ? graphicEntering : undefined}
          style={styles.graphicWrapper}>
          <RadarGraphic
            size={graphicSize}
            active={isActive}
            isSpinning={isSpinning && index === 0}
          />
        </Animated.View>

        {/* Slide Text Content with Smooth Upward Glide */}
        <Animated.View
          entering={index === 0 ? textEntering : undefined}
          style={styles.textContainer}>
          <Text style={styles.titleText} numberOfLines={3}>
            {item.title}
          </Text>
          <Text style={styles.subtitleText} numberOfLines={2}>
            {item.subtitle}
          </Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <SwipeBackContainer
      onBack={currentSlideIndex > 0 ? handleBack : undefined}
      enabled={currentSlideIndex > 0}>
      <GradientBackground style={styles.container}>
        <StatusBar style="light" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Top Header: Segmented Progress & Skip */}
        <Animated.View entering={headerEntering}>
          <ProgressBar
            totalSteps={ONBOARDING_SLIDES.length}
            currentStep={currentSlideIndex}
            onSkip={onSkip || onGetStarted}
            showSkip={true}
          />
        </Animated.View>

        {/* Whole-screen Left-Right Scrollable Carousel */}
        <FlatList
          ref={flatListRef}
          data={ONBOARDING_SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          getItemLayout={(_, index) => ({
            length: windowWidth,
            offset: windowWidth * index,
            index,
          })}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
          style={styles.fullCarousel}
        />

        {/* Bottom Call-To-Action Button */}
        <Animated.View
          entering={bottomEntering}
          style={[
            styles.bottomSection,
            {
              paddingBottom: Math.max(insets.bottom, 16) + (Platform.OS === 'ios' ? 4 : 8),
            },
          ]}>
          <HapticPressable
            haptic="medium"
            borderRadius={27}
            hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
            style={styles.ctaButton}
            onPress={handleNext}>
            <Text style={styles.ctaButtonText}>Get Started Free</Text>
          </HapticPressable>
        </Animated.View>
      </SafeAreaView>
      </GradientBackground>
    </SwipeBackContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  fullCarousel: {
    flex: 1,
  },
  slidePage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  graphicWrapper: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 27,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
    letterSpacing: -0.2,
  },
  subtitleText: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '400',
    paddingHorizontal: 16,
  },
  bottomSection: {
    paddingHorizontal: 24,
    width: '100%',
  },
  ctaButton: {
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaButtonText: {
    color: '#A61B24',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
