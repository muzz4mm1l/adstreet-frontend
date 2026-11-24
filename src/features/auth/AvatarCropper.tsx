import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  GestureDetector,
  GestureHandlerRootView,
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientButton } from '@/components/ui/GradientButton';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { AnimationPresets, Radii } from '@/constants/theme';
import { AvatarImage, cropSquare, rotateImage } from './avatarImage';

const MAX_ZOOM = 4;
const DOUBLE_TAP_ZOOM = 2.4;
const DIM = 'rgba(8, 8, 10, 0.68)';

const clamp = (v: number, lo: number, hi: number) => {
  'worklet';
  return Math.min(Math.max(v, lo), hi);
};

export interface AvatarCropperProps {
  visible: boolean;
  image: AvatarImage;
  onCancel: () => void;
  /** `source` is the (possibly rotated) uncropped image, so it can be re-cropped later. */
  onDone: (result: AvatarImage, source: AvatarImage) => void;
}

/**
 * Full-screen square crop editor with a circular preview mask.
 * Gestures: drag to reposition, pinch to zoom (about the fingers), double-tap to
 * toggle zoom. All per-frame work is a single transform on the UI thread; JS only
 * runs on rotate / save.
 */
export const AvatarCropper: React.FC<AvatarCropperProps> = ({
  visible,
  image,
  onCancel,
  onDone,
}) => {
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();
  const [src, setSrc] = useState<AvatarImage>(image);
  const [busy, setBusy] = useState<'save' | 'rotate' | null>(null);

  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // Crop frame (square, shown through a circle) and the stage the image lives in.
  const frame = Math.min(winW - 48, 340);
  const stageW = winW;
  const stageH = Math.max(
    frame + 40,
    Math.min(frame + 140, winH - insets.top - insets.bottom - 280)
  );
  // Scale at which the image exactly covers the frame; user zoom multiplies it.
  const base = frame / Math.min(src.width, src.height);
  const baseW = src.width * base;
  const baseH = src.height * base;

  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const pan = usePanGesture({
    onUpdate: (e) => {
      'worklet';
      const mx = Math.max(0, (baseW * scale.value - frame) / 2);
      const my = Math.max(0, (baseH * scale.value - frame) / 2);
      tx.value = clamp(tx.value + e.changeX, -mx, mx);
      ty.value = clamp(ty.value + e.changeY, -my, my);
    },
  });

  const pinch = usePinchGesture({
    onUpdate: (e) => {
      'worklet';
      const prev = scale.value;
      const next = clamp(prev * e.scaleChange, 1, MAX_ZOOM);
      const ratio = next / prev;
      // keep the content under the fingers fixed while zooming
      const fx = e.focalX - stageW / 2;
      const fy = e.focalY - stageH / 2;
      const mx = Math.max(0, (baseW * next - frame) / 2);
      const my = Math.max(0, (baseH * next - frame) / 2);
      scale.value = next;
      tx.value = clamp(fx - (fx - tx.value) * ratio, -mx, mx);
      ty.value = clamp(fy - (fy - ty.value) * ratio, -my, my);
    },
  });

  const doubleTap = useTapGesture({
    numberOfTaps: 2,
    onActivate: () => {
      'worklet';
      const target = scale.value > 1.5 ? 1 : DOUBLE_TAP_ZOOM;
      const mx = Math.max(0, (baseW * target - frame) / 2);
      const my = Math.max(0, (baseH * target - frame) / 2);
      scale.value = withSpring(target, AnimationPresets.spring);
      tx.value = withSpring(clamp(tx.value, -mx, mx), AnimationPresets.spring);
      ty.value = withSpring(clamp(ty.value, -my, my), AnimationPresets.spring);
    },
  });

  const gesture = useSimultaneousGestures(pan, pinch, doubleTap);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  const handleReset = () => {
    Haptics.selectionAsync().catch(() => {});
    scale.value = withSpring(1, AnimationPresets.spring);
    tx.value = withSpring(0, AnimationPresets.spring);
    ty.value = withSpring(0, AnimationPresets.spring);
  };

  const handleRotate = async () => {
    if (busy) return;
    Haptics.selectionAsync().catch(() => {});
    setBusy('rotate');
    try {
      const rotated = await rotateImage(src, 90);
      if (!alive.current) return;
      scale.value = 1;
      tx.value = 0;
      ty.value = 0;
      setSrc(rotated);
    } catch {
      if (alive.current) Alert.alert('Rotate failed', 'Please try again.');
    } finally {
      if (alive.current) setBusy(null);
    }
  };

  const handleDone = async () => {
    if (busy) return;
    setBusy('save');
    try {
      const eff = base * scale.value;
      const size = Math.min(frame / eff, src.width, src.height);
      // the frame centre, in image pixels, is the image centre shifted opposite to the pan
      const originX = src.width / 2 - tx.value / eff - size / 2;
      const originY = src.height / 2 - ty.value / eff - size / 2;
      const out = await cropSquare(src, { originX, originY, size });
      if (alive.current) onDone(out, src);
    } catch {
      if (alive.current) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        Alert.alert('Could not save photo', 'Please try again.');
      }
    } finally {
      if (alive.current) setBusy(null);
    }
  };

  // Dimming mask: a huge ring whose hole is exactly the crop circle.
  const ring = Math.max(stageW, stageH);
  const maskSize = frame + ring * 2;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={onCancel}>
      <GestureHandlerRootView style={styles.root}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <HapticPressable
            haptic="selection"
            borderRadius={20}
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            hitSlop={8}
            style={styles.iconButton}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </HapticPressable>
          <Text style={styles.title}>Adjust photo</Text>
          <View style={styles.iconSpacer} />
        </View>

        <Animated.View
          entering={FadeIn.duration(280)}
          style={{ width: stageW, height: stageH, overflow: 'hidden' }}>
          <GestureDetector gesture={gesture}>
            <View style={{ width: stageW, height: stageH }}>
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    width: baseW,
                    height: baseH,
                    left: (stageW - baseW) / 2,
                    top: (stageH - baseH) / 2,
                  },
                  imageStyle,
                ]}>
                <Image
                  source={{ uri: src.uri }}
                  style={StyleSheet.absoluteFill}
                  contentFit="fill"
                />
              </Animated.View>
            </View>
          </GestureDetector>

          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: maskSize,
              height: maskSize,
              left: (stageW - maskSize) / 2,
              top: (stageH - maskSize) / 2,
              borderRadius: maskSize / 2,
              borderWidth: ring,
              borderColor: DIM,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              // slightly oversized so it covers the anti-aliased seam of the mask hole
              width: frame + 2,
              height: frame + 2,
              left: (stageW - frame - 2) / 2,
              top: (stageH - frame - 2) / 2,
              borderRadius: (frame + 2) / 2,
              borderWidth: 3,
              borderColor: 'rgba(255, 255, 255, 0.92)',
            }}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(120).duration(300)}
          style={styles.tools}>
          <ToolButton
            icon="refresh-outline"
            label="Rotate"
            onPress={handleRotate}
            disabled={busy !== null}
          />
          <ToolButton
            icon="scan-outline"
            label="Reset"
            onPress={handleReset}
            disabled={busy !== null}
          />
        </Animated.View>

        <Text style={styles.hint}>
          Drag to reposition · Pinch or double-tap to zoom
        </Text>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <GradientButton
            title={busy === 'save' ? 'Saving…' : 'Use this photo'}
            onPress={handleDone}
            loading={busy !== null}
            haptic="medium"
          />
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const ToolButton: React.FC<{
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  disabled?: boolean;
}> = ({ icon, label, onPress, disabled }) => (
  <HapticPressable
    haptic="none"
    borderRadius={Radii.pill}
    disabled={disabled}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled: !!disabled }}
    style={[styles.tool, disabled && styles.toolDisabled]}>
    <Ionicons name={icon} size={18} color="#FFFFFF" />
    <Text style={styles.toolLabel}>{label}</Text>
  </HapticPressable>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B0B0D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  iconSpacer: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    letterSpacing: -0.1,
  },
  tools: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 18,
  },
  tool: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  toolDisabled: {
    opacity: 0.5,
  },
  toolLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hint: {
    textAlign: 'center',
    marginTop: 14,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
});
