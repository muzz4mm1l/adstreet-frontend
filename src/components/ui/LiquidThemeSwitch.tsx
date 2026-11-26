import React, { useContext, useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { DrawerGestureContext } from '@/components/navigation/SideDrawer';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { useAppTheme } from '@/theme/useAppTheme';

const TRACK_W = 112;
const TRACK_H = 38;
const KNOB = 50;
const OVERSHOOT = 4; // the glass lens slightly overhangs both ends of the track
const TRAVEL = TRACK_W - KNOB + OVERSHOOT * 2;
const SPRING = { damping: 19, stiffness: 230, mass: 0.85 } as const;
const tick = () => {
  Haptics.selectionAsync().catch(() => {});
};

interface Props {
  dark: boolean;
  onChange: (dark: boolean) => void;
}

/**
 * Light / Dark switch with a liquid-glass lens. The lens glides across the track on a springy
 * curve, inflates under the finger, stretches while it travels and refracts the track beneath it.
 * iOS 26 gets the native Liquid Glass; iOS < 26 a blur; Android a hand-built glass (translucent
 * body, specular sheen and rim light) so it looks the same everywhere. UI-thread animation only.
 */
export const LiquidThemeSwitch: React.FC<Props> = ({ dark, onChange }) => {
  const theme = useAppTheme();
  const reduceMotion = useReducedMotion();
  const p = useSharedValue(dark ? 1 : 0);
  const press = useSharedValue(0);
  const stretch = useSharedValue(0);

  const darkSv = useSharedValue(dark ? 1 : 0);
  const startP = useSharedValue(0);
  const dragging = useSharedValue(0);
  const drawerPan = useContext(DrawerGestureContext) as any;

  useEffect(() => {
    darkSv.value = dark ? 1 : 0;
    if (reduceMotion) {
      p.value = withTiming(dark ? 1 : 0, { duration: 120 });
      return;
    }
    p.value = withSpring(dark ? 1 : 0, SPRING);
    stretch.value = withSequence(withTiming(1, { duration: 120 }), withSpring(0, { damping: 13, stiffness: 240, mass: 0.8 }));
  }, [dark, reduceMotion, p, stretch, darkSv]);

  const commit = (next: boolean) => {
    tick();
    onChange(next);
  };

  // Drag the lens or just tap. One gesture handles both (a touch that never moves is a tap).
  // It blocks the side drawer's swipe-to-close so dragging towards the left does not shut the menu.
  const pan = usePanGesture({
    block: drawerPan,
    activeOffsetX: [-4, 4],
    failOffsetY: [-30, 30],
    onBegin: () => {
      'worklet';
      startP.value = p.value;
      dragging.value = 0;
      press.value = withSpring(1, { damping: 16, stiffness: 300 });
    },
    onActivate: () => {
      'worklet';
      dragging.value = 1;
    },
    onUpdate: (e) => {
      'worklet';
      let v = startP.value + e.translationX / (TRAVEL - OVERSHOOT * 2);
      if (v < 0) v = v * 0.3;
      else if (v > 1) v = 1 + (v - 1) * 0.3;
      p.value = v;
    },
    onDeactivate: (e) => {
      'worklet';
      const projected = p.value + e.velocityX / (TRAVEL * 6);
      const next = projected > 0.5 ? 1 : 0;
      if (next === darkSv.value) {
        p.value = withSpring(next, SPRING); // dragged back where it started
      } else {
        scheduleOnRN(commit, next === 1);
      }
    },
    onFinalize: () => {
      'worklet';
      press.value = withSpring(0, { damping: 14, stiffness: 240 });
      if (dragging.value === 1) {
        dragging.value = 0;
        return;
      }
      scheduleOnRN(commit, darkSv.value !== 1); // plain tap
    },
  });

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], ['#B6B8BE', '#26262A']),
  }));
  const knobStyle = useAnimatedStyle(() => {
    const inflate = 1 + press.value * 0.1;
    return {
      transform: [
        { translateX: interpolate(p.value, [0, 1], [-OVERSHOOT, TRAVEL - OVERSHOOT]) },
        { scaleX: inflate * (1 + stretch.value * 0.14) },
        { scaleY: inflate * (1 - stretch.value * 0.06) },
      ],
    };
  });
  const sunStyle = useAnimatedStyle(() => ({
    opacity: 1 - Math.min(p.value * 1.4, 1),
    transform: [{ rotate: `${p.value * 110}deg` }, { scale: 1 - p.value * 0.4 }],
  }));
  const moonStyle = useAnimatedStyle(() => ({
    opacity: Math.min(Math.max(p.value * 1.4 - 0.4, 0), 1),
    transform: [{ rotate: `${(1 - p.value) * -110}deg` }, { scale: 0.6 + p.value * 0.4 }],
  }));
  const lightLabel = useAnimatedStyle(() => ({ opacity: 1 - p.value, transform: [{ translateX: p.value * -10 }] }));
  const darkLabel = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateX: (1 - p.value) * 10 }] }));

  const isDarkTheme = theme.scheme === 'dark';

  return (
    <GestureDetector gesture={pan}>
    <View
      accessible
      accessibilityRole="switch"
      accessibilityLabel="Dark mode"
      accessibilityState={{ checked: dark }}
      onAccessibilityTap={() => commit(!dark)}
      style={styles.hit}>
      {/* track */}
      <Animated.View style={[styles.track, trackStyle]}>
        <LinearGradient
          colors={['rgba(0,0,0,0.22)', 'rgba(0,0,0,0)', 'rgba(255,255,255,0.12)']}
          style={StyleSheet.absoluteFill}
        />
        <Animated.Text style={[styles.label, styles.labelRight, lightLabel]}>Light</Animated.Text>
        <Animated.Text style={[styles.label, styles.labelLeft, darkLabel]}>Dark</Animated.Text>
      </Animated.View>

      {/* glass lens */}
      <Animated.View pointerEvents="none" style={[styles.knobWrap, knobStyle]}>
        <GlassSurface
          borderRadius={KNOB / 2}
          intensity={40}
          tint={Platform.OS === 'ios' ? 'systemUltraThinMaterialLight' : 'light'}
          fallbackColor={isDarkTheme ? 'rgba(70,70,76,0.9)' : 'rgba(214,216,222,0.92)'}
          elevation={0}
          colorScheme={isDarkTheme ? 'dark' : 'light'}
          style={styles.knob}>
          {/* specular sheen + rim light */}
          <LinearGradient
            colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0)']}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.7, y: 0.9 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(170,225,255,0.35)']}
            start={{ x: 0.35, y: 0.55 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.iconBox}>
            <Animated.View style={[styles.iconLayer, sunStyle]}>
              <Ionicons name="sunny" size={22} color="#FFFFFF" />
            </Animated.View>
            <Animated.View style={[styles.iconLayer, moonStyle]}>
              <Ionicons name="moon" size={20} color="#FFFFFF" />
            </Animated.View>
          </View>
        </GlassSurface>
      </Animated.View>
    </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  hit: {
    width: TRACK_W,
    height: KNOB + 6,
    justifyContent: 'center',
  },
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
  },
  labelRight: { right: 16 },
  labelLeft: { left: 16 },
  knobWrap: {
    position: 'absolute',
    left: 0,
    top: 3,
    width: KNOB,
    height: KNOB,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
      default: {},
    }),
  },
  knob: {
    width: KNOB,
    height: KNOB,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
  },
  iconBox: {
    width: 24,
    height: 24,
  },
  iconLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
