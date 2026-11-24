import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import {
  GestureDetector,
  GestureHandlerRootView,
  usePanGesture,
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimationPresets, Shadows } from '@/constants/theme';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Modal bottom sheet. One shared value (`y`) drives the sheet, the backdrop fade
 * and drag-to-dismiss, so opening, closing and dragging are a single continuous
 * UI-thread motion (the sheet never jumps when released). The Modal stays mounted
 * until the slide-out finishes.
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
}) => {
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const [modalOpen, setModalOpen] = useState(visible);
  const y = useSharedValue(winH);

  useEffect(() => {
    if (visible) {
      setModalOpen(true);
      y.value = reduceMotion
        ? withTiming(0, { duration: 160 })
        : withSpring(0, AnimationPresets.gentleSpring);
    } else {
      y.value = withTiming(
        winH,
        { duration: 220, easing: Easing.bezier(0.4, 0, 1, 1) },
        (finished) => {
          if (finished) scheduleOnRN(setModalOpen, false);
        }
      );
    }
  }, [visible, reduceMotion, winH, y]);

  const pan = usePanGesture({
    activeOffsetY: 10,
    failOffsetX: [-24, 24],
    onUpdate: (e) => {
      'worklet';
      y.value = Math.max(0, y.value + e.changeY);
    },
    onDeactivate: (e) => {
      'worklet';
      if (y.value > 90 || e.velocityY > 700) {
        scheduleOnRN(onClose);
      } else {
        y.value = withSpring(0, AnimationPresets.spring);
      }
    },
  });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [0, winH * 0.45], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <Modal
      visible={modalOpen}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          />
        </Animated.View>

        <GestureDetector gesture={pan}>
          <Animated.View
            style={[styles.sheet, { paddingBottom: insets.bottom + 16 }, sheetStyle]}>
            <View style={styles.handle} />
            {children}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: 'rgba(15, 10, 12, 0.5)',
  },
  sheet: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    ...Shadows.modal,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.14)',
    marginBottom: 16,
  },
});
