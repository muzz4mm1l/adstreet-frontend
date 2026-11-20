import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '@/components/common/GradientBackground';
import { RadarGraphic } from '@/components/onboarding/RadarGraphic';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { HapticPressable } from '@/components/ui/HapticPressable';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: "Pakistan's First Industry Platform\nfor Marketing & Advertising\nProfessionals",
    subtitle: 'One destination for jobs, Gurus, news, events,\ncourses, and podcasts.',
  },
  {
    id: '2',
    title: 'Connect with Industry Gurus\n& Expand Your Network',
    subtitle: 'Learn from seasoned leaders, collaborate on projects,\nand grow your professional reach.',
  },
  {
    id: '3',
    title: 'Empower Your Advertising\n& Creative Career',
    subtitle: 'Find top jobs, read breaking industry leaks,\nand showcase your campaign portfolio.',
  },
];

interface OnboardingScreenViewProps {
  onGetStarted?: () => void;
  onSkip?: () => void;
}

export const OnboardingScreenView: React.FC<OnboardingScreenViewProps> = ({
  onGetStarted,
  onSkip,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentSlideIndex && index >= 0 && index < ONBOARDING_SLIDES.length) {
      setCurrentSlideIndex(index);
    }
  };

  const handleNext = () => {
    if (currentSlideIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentSlideIndex + 1,
        animated: true,
      });
    } else {
      onGetStarted?.();
    }
  };

  const renderTextSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.textSlide}>
      <Text style={styles.titleText}>{item.title}</Text>
      <Text style={styles.subtitleText}>{item.subtitle}</Text>
    </View>
  );

  const graphicSize = Math.min(SCREEN_WIDTH * 0.74, 300);

  return (
    <GradientBackground style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Header: Segmented Progress & Skip */}
        <ProgressBar
          totalSteps={ONBOARDING_SLIDES.length}
          currentStep={currentSlideIndex}
          onSkip={onSkip || onGetStarted}
          showSkip={true}
        />

        {/* Persistent Central Hero: Single High-Performance Radar Graphic */}
        <View style={styles.heroSection}>
          <RadarGraphic size={graphicSize} />
        </View>

        {/* Carousel Text Slides */}
        <View style={styles.textSection}>
          <FlatList
            ref={flatListRef}
            data={ONBOARDING_SLIDES}
            renderItem={renderTextSlide}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            initialNumToRender={1}
            maxToRenderPerBatch={2}
            windowSize={3}
            style={styles.textCarousel}
          />
        </View>

        {/* Bottom Call-To-Action Button */}
        <View style={styles.bottomSection}>
          <HapticPressable
            haptic="medium"
            borderRadius={27}
            style={styles.ctaButton}
            onPress={handleNext}>
            <Text style={styles.ctaButtonText}>Get Started Free</Text>
          </HapticPressable>
        </View>
      </SafeAreaView>
    </GradientBackground>
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
  heroSection: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  textSection: {
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  textCarousel: {
    flexGrow: 0,
  },
  textSlide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 30,
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
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '400',
    paddingHorizontal: 12,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
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
