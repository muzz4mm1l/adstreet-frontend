import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  Extrapolation,
  SharedValue,
  cancelAnimation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { HapticPressable } from '@/components/ui/HapticPressable';

export interface BannerItemData {
  id: string;
  source: any;
  title: string;
}

interface BannerCarouselProps {
  banners: BannerItemData[];
  onPressBanner?: (banner: BannerItemData) => void;
  /** Milliseconds each banner stays before auto-advancing. */
  interval?: number;
}

const GAP = 40; // with the 20px side padding, the next banner starts exactly off-screen
const ASPECT = 0.5; // banners are 2:1

/**
 * Hero carousel showing one full banner at a time; banners crossfade as you swipe.
 * Motion is driven by
 * the scroll offset on the UI thread. A timed progress pill shows when the next banner arrives.
 */
export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  onPressBanner,
  interval = 3800,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const itemWidth = windowWidth - 40;
  const itemHeight = Math.round(itemWidth * ASPECT);
  const step = itemWidth + GAP;
  const sidePad = (windowWidth - itemWidth) / 2;

  const listRef = useRef<Animated.FlatList<BannerItemData>>(null);
  const scrollX = useSharedValue(0);
  const progress = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const dragging = useRef(false);

  const commitIndex = useCallback((next: number) => {
    indexRef.current = next;
    setIndex(next);
  }, []);

  const setDragging = useCallback((value: boolean) => {
    dragging.current = value;
  }, []);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
    onBeginDrag: () => {
      scheduleOnRN(setDragging, true);
    },
    onEndDrag: () => {
      scheduleOnRN(setDragging, false);
    },
    onMomentumEnd: (e) => {
      const next = Math.round(e.contentOffset.x / step);
      scheduleOnRN(commitIndex, next);
    },
  });

  const goTo = useCallback(
    (next: number, animated = true) => {
      commitIndex(next);
      listRef.current?.scrollToOffset({ offset: next * step, animated });
    },
    [commitIndex, step],
  );

  // Auto-advance. The progress pill runs for `interval`, then we move on. Restarts whenever the
  // index changes (swipe, dot press or auto), so a manual swipe resets the timer.
  useEffect(() => {
    if (reduceMotion || banners.length < 2) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: interval, easing: Easing.linear });
    const timer = setInterval(() => {
      if (dragging.current) return;
      goTo((indexRef.current + 1) % banners.length);
    }, interval);
    return () => {
      clearInterval(timer);
      cancelAnimation(progress);
    };
  }, [index, interval, banners.length, reduceMotion, goTo, progress]);

  return (
    <View style={[styles.root, { width: windowWidth }]}>
      <Animated.FlatList
        ref={listRef}
        data={banners}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={step}
        snapToAlignment="start"
        disableIntervalMomentum
        bounces={false}
        overScrollMode="never"
        scrollEventThrottle={16}
        onScroll={onScroll}
        contentContainerStyle={{ paddingHorizontal: sidePad }}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        getItemLayout={(_, i) => ({ length: step, offset: step * i, index: i })}
        renderItem={({ item, index: i }) => (
          <BannerCard
            banner={item}
            index={i}
            width={itemWidth}
            height={itemHeight}
            step={step}
            scrollX={scrollX}
            flat={reduceMotion}
            onPress={() => onPressBanner?.(item)}
          />
        )}
      />

        <View style={styles.paginationWrap}>
          <View style={styles.paginationPill}>
            {banners.map((banner, i) => (
              <Dot
                key={banner.id}
                index={i}
                step={step}
                scrollX={scrollX}
                progress={progress}
                active={index === i}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => { });
                  goTo(i);
                }}
              />
            ))}
          </View>
        </View>
      </View>
      );
};

      interface BannerCardProps {
        banner: BannerItemData;
      index: number;
      width: number;
      height: number;
      step: number;
      scrollX: SharedValue<number>;
        flat: boolean;
  onPress: () => void;
}

        const BannerCard: React.FC<BannerCardProps> = ({
          banner,
          index,
          width,
          height,
          step,
          scrollX,
          flat,
          onPress,
}) => {
  const input = [(index - 1) * step, index * step, (index + 1) * step];

  const frameStyle = useAnimatedStyle(() => {
    if (flat) return { };
          const x = scrollX.value;
          return {opacity: interpolate(x, input, [0, 1, 0], Extrapolation.CLAMP) };
  });

          return (
          <Animated.View style={[{ width, height }, frameStyle]}>
            <HapticPressable
              haptic="light"
              scaleTo={0.97}
              borderRadius={18}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityLabel={`${banner.title} banner`}
              style={styles.card}>
              <View style={styles.imageWrap}>
                <Image source={banner.source} style={styles.image} contentFit="contain" transition={200} />
              </View>

            </HapticPressable>
          </Animated.View>
          );
};

          interface DotProps {
            index: number;
          step: number;
          scrollX: SharedValue<number>;
            progress: SharedValue<number>;
              active: boolean;
  onPress: () => void;
}

              const Dot: React.FC<DotProps> = ({index, step, scrollX, progress, active, onPress}) => {
  const trackStyle = useAnimatedStyle(() => ({
                  width: interpolate(
                scrollX.value,
                [(index - 1) * step, index * step, (index + 1) * step],
                [7, 22, 7],
                Extrapolation.CLAMP,
                ),
  }));
  const fillStyle = useAnimatedStyle(() => ({
                  width: active ? `${progress.value * 100}%` : '0%',
  }));

                return (
                <HapticPressable
                  haptic="none"
                  scaleTo={1}
                  onPress={onPress}
                  hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
                  accessibilityRole="button"
                  accessibilityLabel={`Show banner ${index + 1}`}>
                  <Animated.View style={[styles.dotTrack, trackStyle]}>
                    <Animated.View style={[styles.dotFill, fillStyle]} />
                  </Animated.View>
                </HapticPressable>
                );
};

                const styles = StyleSheet.create({
                  // bleed to the screen edges so the pager snaps edge to edge
                  root: {
                  marginTop: 18,
                marginHorizontal: -20,
  },
                card: {
                  flex: 1,
                borderRadius: 18,
                overflow: 'hidden',
                backgroundColor: '#0F172A',
                shadowColor: '#000000',
                shadowOffset: {width: 0, height: 8 },
                shadowOpacity: 0.32,
                shadowRadius: 14,
                elevation: 8,
  },
                imageWrap: {
                  position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
  },
                image: {
                  width: '100%',
                height: '100%',
  },
                paginationWrap: {
                  alignItems: 'center',
                justifyContent: 'center',
                marginTop: 12,
  },
                paginationPill: {
                  flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: 'rgba(255, 255, 255, 0.14)',
                borderWidth: 0.75,
                borderColor: 'rgba(255, 255, 255, 0.25)',
  },
                dotTrack: {
                height: 7,
                borderRadius: 3.5,
                overflow: 'hidden',
                backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },
                dotFill: {
                  height: '100%',
                borderRadius: 3.5,
                backgroundColor: '#FFFFFF',
  },
});
