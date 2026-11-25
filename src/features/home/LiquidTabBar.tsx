import React, { useCallback, useEffect } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { BrandColors, Shadows } from '@/constants/theme';

export type HomeTab = 'home' | 'chat' | 'add' | 'notifications' | 'search';

interface TabDef {
  id: HomeTab;
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  iconOutline?: React.ComponentProps<typeof Ionicons>['name'];
}

/** Slot order. `add` is the raised action button; the glass lens only rests on the other four. */
const TABS: TabDef[] = [
  { id: 'home', label: 'Home', icon: 'home', iconOutline: 'home-outline' },
  { id: 'chat', label: 'Chat', icon: 'chatbubble-ellipses', iconOutline: 'chatbubble-ellipses-outline' },
  { id: 'add', label: 'Create' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications', iconOutline: 'notifications-outline' },
  { id: 'search', label: 'Search', icon: 'search', iconOutline: 'search-outline' },
];
const ADD_INDEX = 2;
const BAR_HEIGHT = 60;
const PAD = 6;
const LENS_HEIGHT = 46;
const LIQUID_SPRING = { damping: 15, stiffness: 210, mass: 0.85 } as const;
const REDUCED_SPRING = { damping: 40, stiffness: 400, mass: 1 } as const;

/** Nearest slot the lens may rest on (never the `add` slot). */
const nearestRest = (p: number): number => {
  'worklet';
  let best = 0;
  let bestDist = 99;
  for (let i = 0; i < 5; i++) {
    if (i === ADD_INDEX) continue;
    const d = Math.abs(p - i);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
};

const selectionHaptic = () => {
  Haptics.selectionAsync().catch(() => {});
};
const lightHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

interface LiquidTabBarProps {
  active: HomeTab;
  onChange: (tab: HomeTab) => void;
}

/**
 * Floating tab bar with an iOS-26-style liquid glass lens.
 * - The lens slides between tabs on a springy, slightly overshooting curve.
 * - Touching the bar inflates the lens; dragging carries it under the finger, it stretches with
 *   velocity, rubber-bands at the ends and settles on the nearest tab on release.
 * - A selection haptic ticks every time the lens crosses into another tab.
 * All motion runs on the UI thread (transform + opacity only).
 */
export const LiquidTabBar: React.FC<LiquidTabBarProps> = ({ active, onChange }) => {
  const { width: windowWidth } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const spring = reduceMotion ? REDUCED_SPRING : LIQUID_SPRING;

  const barWidth = Math.min(windowWidth - 40, 380);
  const slotW = (barWidth - PAD * 2) / TABS.length;
  const lensW = slotW - 4;

  const activeIndex = TABS.findIndex((t) => t.id === active);
  const restIndex = activeIndex === ADD_INDEX || activeIndex < 0 ? 0 : activeIndex;

  const pos = useSharedValue(restIndex); // lens position in slot units (float)
  const target = useSharedValue(restIndex); // slot the lens is heading to / resting on
  const lensVisible = useSharedValue(active === 'add' ? 0 : 1);
  const pressed = useSharedValue(0);
  const stretch = useSharedValue(0);
  const addPressed = useSharedValue(0);
  const dragging = useSharedValue(0);
  const startPos = useSharedValue(0);
  const startX = useSharedValue(0);
  const lastHaptic = useSharedValue(restIndex);

  // Follow external changes (hardware back returning to Home, ...)
  useEffect(() => {
    lensVisible.value = withTiming(active === 'add' ? 0 : 1, { duration: 160 });
    if (active !== 'add' && target.value !== restIndex && dragging.value === 0) {
      target.value = restIndex;
      lastHaptic.value = restIndex;
      pos.value = withSpring(restIndex, spring);
    }
  }, [active, restIndex, spring, pos, target, lensVisible, dragging, lastHaptic]);

  const commit = useCallback(
    (index: number) => {
      onChange(TABS[index].id);
    },
    [onChange],
  );

  const pan = usePanGesture({
    activeOffsetX: [-6, 6],
    failOffsetY: [-28, 28],
    onBegin: (e) => {
      'worklet';
      startX.value = e.x;
      startPos.value = pos.value;
      dragging.value = 0;
      const slot = Math.floor((e.x - PAD) / slotW);
      if (slot === ADD_INDEX) {
        addPressed.value = withSpring(1, { damping: 18, stiffness: 400 });
      } else {
        pressed.value = withSpring(1, { damping: 14, stiffness: 300 });
      }
    },
    onActivate: () => {
      'worklet';
      dragging.value = 1;
      addPressed.value = withSpring(0, { damping: 18, stiffness: 400 });
      pressed.value = withSpring(1, { damping: 14, stiffness: 300 });
      lensVisible.value = withTiming(1, { duration: 120 });
    },
    onUpdate: (e) => {
      'worklet';
      let p = startPos.value + e.translationX / slotW;
      // rubber band beyond the first / last slot
      if (p < 0) p = p * 0.3;
      else if (p > 4) p = 4 + (p - 4) * 0.3;
      pos.value = p;
      stretch.value = Math.min(Math.abs(e.velocityX) / 3200, 0.28);
      const idx = nearestRest(p);
      if (idx !== lastHaptic.value) {
        lastHaptic.value = idx;
        scheduleOnRN(selectionHaptic);
      }
    },
    onDeactivate: (e) => {
      'worklet';
      // a flick carries the lens at most one extra slot
      const carry = Math.min(Math.max((e.velocityX / slotW) * 0.04, -1), 1);
      const projected = pos.value + carry;
      const idx = nearestRest(Math.min(Math.max(projected, 0), 4));
      stretch.value = withSpring(0, { damping: 12, stiffness: 260 });
      pressed.value = withSpring(0, { damping: 14, stiffness: 240 });
      pos.value = withSpring(idx, { ...spring, velocity: e.velocityX / slotW });
      target.value = idx;
      lastHaptic.value = idx;
      scheduleOnRN(commit, idx);
    },
    onFinalize: () => {
      'worklet';
      if (dragging.value === 1) {
        dragging.value = 0; // drag already handled in onDeactivate
        return;
      }
      // plain tap: the touch never became a drag
      const slot = Math.min(Math.max(Math.floor((startX.value - PAD) / slotW), 0), 4);
      pressed.value = withSpring(0, { damping: 14, stiffness: 240 });
      addPressed.value = withSpring(0, { damping: 12, stiffness: 300 });
      if (slot === ADD_INDEX) {
        scheduleOnRN(lightHaptic);
      } else {
        target.value = slot;
        lastHaptic.value = slot;
        pos.value = withSpring(slot, spring);
        scheduleOnRN(selectionHaptic);
      }
      scheduleOnRN(commit, slot);
    },
  });

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pressed.value * 0.018 }],
  }));

  const lensStyle = useAnimatedStyle(() => {
    const inflate = 1 + pressed.value * 0.1;
    return {
      opacity: lensVisible.value * (0.96 - pressed.value * 0.14),
      transform: [
        { translateX: PAD + pos.value * slotW + (slotW - lensW) / 2 },
        { scaleX: inflate * (1 + stretch.value) },
        { scaleY: inflate * (1 - stretch.value * 0.5) },
      ],
    };
  });

  const addStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - addPressed.value * 0.12 }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ width: barWidth }, barStyle]}>
        <GlassSurface
          borderRadius={999}
          intensity={65}
          tint={Platform.OS === 'ios' ? 'systemChromeMaterialDark' : 'dark'}
          fallbackColor="rgba(30, 30, 32, 0.88)"
          elevation={12}
          style={styles.glassBar}>
          <View style={styles.inner}>
            {/* the glass lens that travels under the active tab */}
            <Animated.View
              pointerEvents="none"
              style={[styles.lens, { width: lensW, left: 0 }, lensStyle]}
            />

            {TABS.map((tab, i) => (
              <View
                key={tab.id}
                accessible
                accessibilityRole="button"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: active === tab.id }}
                onAccessibilityTap={() => commit(i)}
                pointerEvents="none"
                style={[styles.slot, { left: PAD + i * slotW, width: slotW }]}>
                {tab.id === 'add' ? (
                  <Animated.View style={[styles.addButton, addStyle]}>
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                  </Animated.View>
                ) : (
                  <TabIcon tab={tab} index={i} pos={pos} visible={lensVisible} />
                )}
              </View>
            ))}
          </View>
        </GlassSurface>
      </Animated.View>
    </GestureDetector>
  );
};

const TabIcon: React.FC<{
  tab: TabDef;
  index: number;
  pos: SharedValue<number>;
  visible: SharedValue<number>;
}> = ({ tab, index, pos, visible }) => {
  // 1 when the lens is centred on this tab, 0 once it is a full slot away
  const filledStyle = useAnimatedStyle(() => {
    const p = (1 - Math.min(Math.abs(pos.value - index), 1)) * visible.value;
    return { opacity: p, transform: [{ scale: 0.9 + p * 0.18 }] };
  });
  const outlineStyle = useAnimatedStyle(() => {
    const p = (1 - Math.min(Math.abs(pos.value - index), 1)) * visible.value;
    return { opacity: 1 - p };
  });
  return (
    <View style={styles.iconBox}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.iconCenter, outlineStyle]}>
        <Ionicons name={tab.iconOutline!} size={20} color="rgba(255, 255, 255, 0.78)" />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.iconCenter, filledStyle]}>
        <Ionicons name={tab.icon!} size={20} color={BrandColors.primary} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  glassBar: {
    width: '100%',
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  inner: {
    height: BAR_HEIGHT,
  },
  lens: {
    position: 'absolute',
    top: (BAR_HEIGHT - LENS_HEIGHT) / 2,
    height: LENS_HEIGHT,
    borderRadius: LENS_HEIGHT / 2,
    backgroundColor: '#FFFFFF',
    ...Shadows.card,
    ...Platform.select({ android: { elevation: 5 } }),
  },
  slot: {
    position: 'absolute',
    top: 0,
    height: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 28,
    height: 28,
  },
  iconCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E31E24',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    ...Shadows.buttonGlow,
  },
});
