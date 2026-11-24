import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { BrandColors, Radii, SurfaceColors } from '@/constants/theme';

export type CodeSlotsStatus = 'idle' | 'error' | 'success';

export interface CodeSlotsProps {
  /** Number of code slots */
  length?: number;
  /** Controlled code string */
  value?: string;
  /** Uncontrolled initial code */
  defaultValue?: string;
  /** Callback fired whenever the code changes */
  onChange?: (code: string) => void;
  /** Callback fired once all slots are filled */
  onComplete?: (code: string) => void;
  /** Interactive state status: idle, error drains slots, success washes over */
  status?: CodeSlotsStatus;
  /** Show dot bullet instead of digit */
  mask?: boolean;
  /** Show blinking and sliding caret in active slot */
  caret?: boolean;
  /** Disable input */
  disabled?: boolean;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Primary accent color for active ring and success wash */
  accentColor?: string;
  /** Tint color for caret and active slot */
  inkColor?: string;
  /** Surface background of empty slot */
  slotColor?: string;
  /** Text color of entered digit */
  digitColor?: string;
  /** Danger tint color when status is error */
  dangerColor?: string;
  /** Slot width in pixels */
  slotSize?: number;
  /** Gap between slots */
  gap?: number;
  /** Corner radius */
  radius?: number;
  /** Spring overshoot bounce (0 = critically damped, 0.2 = standard) */
  bounce?: number;
  /** Settle duration in seconds */
  settle?: number;
  /** Pixels digit rises into place */
  rise?: number;
  /** Milliseconds delay between cascading slot transitions */
  cascade?: number;
  /** Accessibility label */
  ariaLabel?: string;
  /** Optional split position (e.g. 3 for 3-3 split) */
  splitIndex?: number;
  /** Container custom style */
  style?: StyleProp<ViewStyle>;
}

const digitsOf = (raw?: string | null): string =>
  String(raw ?? '').replace(/\D/g, '');

const toSlots = (raw: string, length: number): string[] => {
  const clean = digitsOf(raw).slice(0, length);
  return Array.from({ length }, (_, i) => clean[i] ?? '');
};

const firstEmptyOf = (slots: string[]): number => {
  const idx = slots.indexOf('');
  return idx === -1 ? slots.length - 1 : idx;
};

/**
 * Animated Single Slot Component
 */
interface SingleSlotProps {
  char: string;
  isActive: boolean;
  isError: boolean;
  slotSize: number;
  slotHeight: number;
  radius: number;
  slotColor: string;
  accentColor: string;
  dangerColor: string;
  digitColor: string;
  rise: number;
  bounce: number;
  settle: number;
}

const SingleSlot: React.FC<SingleSlotProps> = ({
  char,
  isActive,
  isError,
  slotSize,
  slotHeight,
  radius,
  slotColor,
  accentColor,
  dangerColor,
  digitColor,
  rise,
  bounce,
  settle,
}) => {
  const fillScale = useSharedValue(char ? 1 : 0);
  const digitRise = useSharedValue(char ? 0 : rise);
  const digitOpacity = useSharedValue(char ? 1 : 0);
  const digitSink = useSharedValue(0);

  const prevCharRef = useRef(char);

  useEffect(() => {
    const hasChar = Boolean(char);
    const hadChar = Boolean(prevCharRef.current);
    prevCharRef.current = char;

    if (hasChar && !hadChar) {
      // Landing animation
      const damping = Math.max(10, 18 - bounce * 15);
      fillScale.value = withSpring(1, { damping, stiffness: 220 });
      digitRise.value = withSpring(0, { damping: 16, stiffness: 240 });
      digitOpacity.value = withTiming(1, { duration: settle * 1000 });
    } else if (!hasChar && hadChar) {
      // Draining / backspace animation
      fillScale.value = withTiming(0, { duration: 160 });
      digitOpacity.value = withTiming(0, { duration: 120 });
      digitRise.value = withTiming(rise, { duration: 160 });
    }
  }, [char, bounce, settle, rise, fillScale, digitRise, digitOpacity]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fillScale.value }],
  }));

  const animatedDigitStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: digitRise.value + digitSink.value },
    ],
    opacity: digitOpacity.value,
  }));

  return (
    <View
      style={[
        styles.slotBase,
        {
          width: slotSize,
          height: slotHeight,
          borderRadius: radius,
          backgroundColor: slotColor,
          borderColor: isError
            ? dangerColor
            : isActive
            ? accentColor
            : SurfaceColors.borderLight,
        },
        isActive && styles.slotActiveBorder,
        isError && styles.slotErrorBorder,
      ]}>
      {/* Animated Landing Fill Surface */}
      <Animated.View
        style={[
          styles.slotFill,
          {
            borderRadius: radius,
            backgroundColor: isError ? 'rgba(227, 30, 36, 0.12)' : 'rgba(227, 30, 36, 0.05)',
          },
          animatedFillStyle,
        ]}
      />

      {/* Animated Digit */}
      {char ? (
        <Animated.View style={[styles.digitWrapper, animatedDigitStyle]}>
          <Text
            style={[
              styles.digitText,
              {
                color: isError ? dangerColor : digitColor,
                fontSize: Math.round(slotSize * 0.52),
              },
            ]}>
            {char}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
};

export const CodeSlots: React.FC<CodeSlotsProps> = ({
  length = 6,
  value,
  defaultValue = '',
  onChange,
  onComplete,
  status = 'idle',
  mask = false,
  caret = true,
  disabled = false,
  autoFocus = false,
  accentColor = BrandColors.primary,
  inkColor = BrandColors.primary,
  slotColor = SurfaceColors.card,
  digitColor = SurfaceColors.textPrimary,
  dangerColor = '#E31E24',
  slotSize = 44,
  gap = 8,
  radius = Radii.md,
  bounce = 0.2,
  settle = 0.3,
  rise = 8,
  cascade = 20,
  ariaLabel = 'One-time code',
  splitIndex,
  style,
}) => {
  const inputRef = useRef<any>(null);
  const [internalCode, setInternalCode] = useState(() =>
    digitsOf(value ?? defaultValue).slice(0, length)
  );
  const [isFocused, setIsFocused] = useState(false);
  const prevStatusRef = useRef(status);

  // Synchronize controlled value
  useEffect(() => {
    if (value !== undefined) {
      const clean = digitsOf(value).slice(0, length);
      setInternalCode(clean);
    }
  }, [value, length]);

  const slots = toSlots(internalCode, length);
  const activeIndex = Math.min(
    firstEmptyOf(slots),
    Math.max(0, length - 1)
  );

  const slotHeight = Math.round(slotSize * 1.18);
  const pitch = slotSize + gap;
  const extraSplitOffset = splitIndex !== undefined ? 14 + gap : 0;

  // Caret Animation Values
  const caretOpacity = useSharedValue(1);
  const caretX = useSharedValue(0);

  // Shake & Error Animation Values
  const shakeX = useSharedValue(0);

  // Success Wash & Checkmark Animation Values
  const washProgress = useSharedValue(status === 'success' ? 1 : 0);
  const checkScale = useSharedValue(status === 'success' ? 1 : 0);
  const checkRise = useSharedValue(status === 'success' ? 0 : 8);

  // Compute Caret target X
  const computeCaretX = useCallback(
    (index: number) => {
      let x = index * pitch + (slotSize / 2 - 1);
      if (splitIndex !== undefined && index >= splitIndex) {
        x += extraSplitOffset;
      }
      return x;
    },
    [pitch, slotSize, splitIndex, extraSplitOffset]
  );

  // Update Caret position smoothly
  useEffect(() => {
    const targetX = computeCaretX(activeIndex);
    caretX.value = withSpring(targetX, {
      damping: 20,
      stiffness: 260,
    });
  }, [activeIndex, computeCaretX, caretX]);

  // Caret Blinking Loop
  useEffect(() => {
    if (isFocused && caret && !disabled && status === 'idle' && internalCode.length < length) {
      caretOpacity.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 450, easing: Easing.linear }),
          withTiming(1, { duration: 450, easing: Easing.linear })
        ),
        -1,
        true
      );
    } else {
      caretOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [isFocused, caret, disabled, status, internalCode.length, length, caretOpacity]);

  // Handle Error Drain & Shake Animation
  useEffect(() => {
    if (status === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});

      // Horizontal Shake Physics
      shakeX.value = withSequence(
        withTiming(-8, { duration: 45 }),
        withTiming(8, { duration: 45 }),
        withTiming(-6, { duration: 45 }),
        withTiming(6, { duration: 45 }),
        withTiming(-3, { duration: 40 }),
        withTiming(0, { duration: 40 })
      );

      // Drain backward with cascade
      const filledCount = internalCode.length;
      const totalDrainTime = (filledCount * cascade) + (settle * 1000);

      const timer = setTimeout(() => {
        setInternalCode('');
        onChange?.('');
      }, Math.max(250, totalDrainTime));

      return () => clearTimeout(timer);
    }
  }, [status, internalCode.length, cascade, settle, shakeX, onChange]);

  // Handle Success Wash Animation
  useEffect(() => {
    if (status === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

      washProgress.value = withTiming(1, {
        duration: 320,
        easing: Easing.bezier(0.23, 1, 0.32, 1),
      });

      checkScale.value = withDelay(
        180,
        withSpring(1, { damping: 14, stiffness: 220 })
      );
      checkRise.value = withDelay(
        180,
        withSpring(0, { damping: 14, stiffness: 220 })
      );
    } else if (prevStatusRef.current === 'success') {
      washProgress.value = withTiming(0, { duration: 200 });
      checkScale.value = withTiming(0, { duration: 150 });
      checkRise.value = withTiming(8, { duration: 150 });
    }
    prevStatusRef.current = status;
  }, [status, washProgress, checkScale, checkRise]);

  // Input Handling
  const handleTextChange = (text: string) => {
    if (disabled || status === 'success') return;

    const clean = digitsOf(text).slice(0, length);
    const prevLen = internalCode.length;
    const newLen = clean.length;

    // Haptic feedback
    if (newLen > prevLen) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (newLen < prevLen) {
      Haptics.selectionAsync().catch(() => {});
    }

    setInternalCode(clean);
    onChange?.(clean);

    if (clean.length === length && prevLen < length) {
      onComplete?.(clean);
    }
  };

  const handleContainerPress = () => {
    if (disabled || status === 'success') return;
    inputRef.current?.focus();
  };

  // Reanimated Animated Styles
  const animatedRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const animatedCaretStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: caretX.value }],
    opacity: caretOpacity.value,
  }));

  const animatedWashStyle = useAnimatedStyle(() => ({
    opacity: washProgress.value,
    transform: [{ scale: 0.96 + washProgress.value * 0.04 }],
  }));

  const animatedCheckStyle = useAnimatedStyle(() => ({
    opacity: checkScale.value,
    transform: [
      { scale: checkScale.value },
      { translateY: checkRise.value },
    ],
  }));

  return (
    <Pressable
      onPress={handleContainerPress}
      accessibilityLabel={ariaLabel}
      accessibilityRole="text"
      style={[styles.rootContainer, style]}>
      {/* Invisible Native Input covering interaction area */}
      <TextInput
        ref={inputRef}
        value={internalCode}
        onChangeText={handleTextChange}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        editable={!disabled && status !== 'success'}
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        style={styles.hiddenInput}
        caretHidden
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {/* Animated Slots Row */}
      <Animated.View style={[styles.slotsRow, { gap }, animatedRowStyle]}>
        {slots.map((char, index) => {
          const isSlotActive = isFocused && index === activeIndex;
          const displayChar = mask && char ? '•' : char;
          const showSplitHyphen =
            splitIndex !== undefined && index === splitIndex - 1;

          return (
            <React.Fragment key={`slot-node-${index}`}>
              <SingleSlot
                char={displayChar}
                isActive={isSlotActive}
                isError={status === 'error'}
                slotSize={slotSize}
                slotHeight={slotHeight}
                radius={radius}
                slotColor={slotColor}
                accentColor={accentColor}
                dangerColor={dangerColor}
                digitColor={digitColor}
                rise={rise}
                bounce={bounce}
                settle={settle}
              />

              {showSplitHyphen ? (
                <View style={styles.splitHyphenWrapper}>
                  <Text style={styles.splitHyphenText}>—</Text>
                </View>
              ) : null}
            </React.Fragment>
          );
        })}

        {/* Sliding & Blinking Caret */}
        {caret && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.caretBar,
              {
                backgroundColor: inkColor,
                height: Math.round(slotHeight * 0.44),
                top: Math.round(slotHeight * 0.28),
              },
              animatedCaretStyle,
            ]}
          />
        )}

        {/* Success Wash & Checkmark Layer */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.successWash,
            {
              backgroundColor: accentColor,
              borderRadius: radius,
            },
            animatedWashStyle,
          ]}>
          <Animated.View style={animatedCheckStyle}>
            <Feather
              name="check"
              size={Math.round(slotSize * 0.65)}
              color="#FFFFFF"
            />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0,
    zIndex: 10,
  },
  slotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
  },
  slotBase: {
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  slotActiveBorder: {
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  slotErrorBorder: {
    shadowColor: '#E31E24',
    shadowOpacity: 0.15,
  },
  slotFill: {
    ...StyleSheet.absoluteFill,
  },
  digitWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: {
    fontWeight: '700',
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    fontVariant: ['tabular-nums'],
  },
  caretBar: {
    position: 'absolute',
    left: 0,
    width: 2,
    borderRadius: 1,
    zIndex: 5,
  },
  splitHyphenWrapper: {
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitHyphenText: {
    fontSize: 14,
    fontWeight: '300',
    color: SurfaceColors.textMuted,
  },
  successWash: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
  },
});
