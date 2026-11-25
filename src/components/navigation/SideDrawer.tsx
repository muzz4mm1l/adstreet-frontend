import { useAppTheme } from '@/theme/useAppTheme';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
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
import { AnimationPresets, Shadows } from '@/constants/theme';

export interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Left-edge drawer in a Modal. One shared value (`x`) drives the panel, the scrim and
 * drag-to-close, so opening, closing and dragging are a single continuous UI-thread motion.
 * Android hardware back closes it (Modal's onRequestClose) before any screen-level back handler.
 */
export const SideDrawer: React.FC<SideDrawerProps> = ({ visible, onClose, children }) => {
  const { width: winW } = useWindowDimensions();
  const panelW = Math.min(Math.round(winW * 0.8), 340);
  const reduceMotion = useReducedMotion();
  const [modalOpen, setModalOpen] = useState(visible);
  const theme = useAppTheme();
  const x = useSharedValue(-panelW);

  useEffect(() => {
    if (visible) {
      setModalOpen(true);
      x.value = reduceMotion
        ? withTiming(0, { duration: 160 })
        : withSpring(0, AnimationPresets.gentleSpring);
    } else {
      x.value = withTiming(
        -panelW,
        { duration: 220, easing: Easing.bezier(0.4, 0, 1, 1) },
        (finished) => {
          'worklet';
          if (finished) scheduleOnRN(setModalOpen, false);
        }
      );
    }
  }, [visible, reduceMotion, panelW, x]);

  const pan = usePanGesture({
    activeOffsetX: -10,
    failOffsetY: [-20, 20],
    onUpdate: (e) => {
      'worklet';
      x.value = Math.min(0, x.value + e.changeX);
    },
    onDeactivate: (e) => {
      'worklet';
      if (x.value < -panelW * 0.3 || e.velocityX < -600) {
        scheduleOnRN(onClose);
      } else {
        x.value = withSpring(0, AnimationPresets.spring);
      }
    },
  });

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [-panelW, 0], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <Modal
      visible={modalOpen}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
          />
        </Animated.View>

        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.panel, { width: panelW, backgroundColor: theme.surface }, panelStyle]}>
            <View style={styles.panelClip}>{children}</View>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrim: {
    backgroundColor: 'rgba(15, 10, 12, 0.5)',
  },
  // shadow on the outer view; the inner view clips the rounded corners
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: '#FFFFFF', // light default; the live theme colour is applied inline
    ...Shadows.modal,
  },
  panelClip: {
    flex: 1,
    overflow: 'hidden',
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
  },
});
