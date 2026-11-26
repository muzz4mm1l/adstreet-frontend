import React, { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { AppTheme, withAlpha } from '@/theme/colors';
import { REGIONS, Region, setRegion, useRegion } from '@/theme/regionStore';
import { useAppTheme, useThemedStyles } from '@/theme/useAppTheme';

interface Anchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ROW_H = 46;
const POP_PAD = 6;

/** "Region Selector" label + glass pill; tapping opens an iOS-style mini glass popover of cities. */
export const RegionSelector: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const theme = useAppTheme();
  const reduceMotion = useReducedMotion();
  const { width: winW, height: winH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const region = useRegion();
  const pillRef = useRef<React.ComponentRef<typeof View>>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [mounted, setMounted] = useState(false);
  const progress = useSharedValue(0);
  const chevron = useSharedValue(0);

  const open = () => {
    pillRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setMounted(true);
      chevron.value = withSpring(1, { damping: 14, stiffness: 220 });
      progress.value = reduceMotion
        ? withTiming(1, { duration: 120 })
        : withSpring(1, { damping: 15, stiffness: 240, mass: 0.8 });
    });
  };

  const unmount = () => setMounted(false);
  const close = () => {
    chevron.value = withSpring(0, { damping: 14, stiffness: 220 });
    progress.value = withTiming(0, { duration: 140 }, (finished) => {
      'worklet';
      if (finished) scheduleOnRN(unmount);
    });
  };

  const choose = (r: Region) => {
    Haptics.selectionAsync().catch(() => {});
    setRegion(r);
    close();
  };

  const chevronStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${chevron.value * 180}deg` }] }));
  const popStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.6], [0, 1], 'clamp'),
    transform: [
      { scale: interpolate(progress.value, [0, 1], [0.6, 1]) },
    ],
  }));

  // Bubble placement: grows out of the pill, on whichever side has room, never off-screen.
  const GAP = 8;
  const EDGE = 12;
  const popW = anchor ? Math.min(Math.max(anchor.width, 230), winW - 32) : 230;
  const fullH = REGIONS.length * ROW_H + POP_PAD * 2;
  const below = anchor ? winH - insets.bottom - EDGE - (anchor.y + anchor.height + GAP) : 0;
  const above = anchor ? anchor.y - GAP - insets.top - EDGE : 0;
  const openUp = !!anchor && fullH > below && above > below;
  const room = Math.max(openUp ? above : below, 120);
  const popH = Math.min(fullH, room);
  const popTop = anchor ? (openUp ? anchor.y - GAP - popH : anchor.y + anchor.height + GAP) : 0;
  const popLeft = anchor ? Math.max(16, Math.min(anchor.x, winW - popW - 16)) : 0;

  return (
    <View style={styles.block}>
      <Text style={styles.label}>Region Selector</Text>
      <View ref={pillRef} collapsable={false}>
        <HapticPressable
          haptic="selection"
          scaleTo={0.98}
          borderRadius={16}
          onPress={open}
          accessibilityRole="button"
          accessibilityLabel={`Region: ${region.city}, ${region.country}. Change region`}
          accessibilityState={{ expanded: mounted }}
          style={styles.pill}>
          <Text style={styles.flag}>{region.flag}</Text>
          <Text style={styles.city} numberOfLines={1}>
            {region.city}, {region.country}
          </Text>
          <Animated.View style={chevronStyle}>
            <Ionicons name="chevron-down" size={20} color={theme.text} />
          </Animated.View>
        </HapticPressable>
      </View>

      <Modal transparent visible={mounted} animationType="none" onRequestClose={close} statusBarTranslucent>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close region list" />
        {anchor && (
          <Animated.View
            style={[
              styles.popWrap,
              {
                left: popLeft,
                top: popTop,
                width: popW,
                transformOrigin: openUp ? 'left bottom' : 'left top',
              },
              popStyle,
            ]}>
            <GlassSurface
              borderRadius={28}
              intensity={70}
              tint="systemChromeMaterial"
              fallbackColor={theme.scheme === 'dark' ? 'rgba(44,44,48,0.94)' : 'rgba(255,255,255,0.94)'}
              colorScheme={theme.scheme}
              elevation={14}
              style={[styles.pop, { height: popH }]}>
              <ScrollView showsVerticalScrollIndicator={false} bounces={fullH > popH}>
              {REGIONS.map((r, i) => {
                const selected = r.id === region.id;
                return (
                  <HapticPressable
                    key={r.id}
                    haptic="none"
                    scaleTo={0.98}
                    borderRadius={16}
                    onPress={() => choose(r)}
                    accessibilityRole="menuitem"
                    accessibilityLabel={`${r.city}, ${r.country}`}
                    accessibilityState={{ selected }}
                    style={[styles.row, selected && styles.rowOn, i > 0 && !selected && styles.rowSep]}>
                    <Text style={styles.flag}>{r.flag}</Text>
                    <Text style={[styles.rowText, selected && styles.rowTextOn]}>
                      {r.city}, {r.country}
                    </Text>
                    {selected && <Ionicons name="checkmark" size={18} color={theme.primary} />}
                  </HapticPressable>
                );
              })}
              </ScrollView>
            </GlassSurface>
          </Animated.View>
        )}
      </Modal>
    </View>
  );
};

const createStyles = (t: AppTheme) =>
  StyleSheet.create({
    block: { marginBottom: 14, gap: 8 },
    label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.4, color: t.textMuted, paddingStart: 4 },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      height: 48,
      paddingHorizontal: 14,
      backgroundColor: withAlpha(t.text, 0.06),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
    },
    flag: { fontSize: 20 },
    city: { flex: 1, fontSize: 16, fontWeight: '600', color: t.text },
    popWrap: { position: 'absolute' },
    pop: { padding: POP_PAD },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10, height: ROW_H, paddingHorizontal: 12 },
    rowSep: {},
    rowOn: { backgroundColor: withAlpha(t.primary, 0.12) },
    rowText: { flex: 1, fontSize: 15.5, fontWeight: '500', color: t.text },
    rowTextOn: { fontWeight: '700' },
  });
