import React, { useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { HapticPressable } from '@/components/ui/HapticPressable';
import {
  AnimationPresets,
  BrandColors,
  Radii,
  Shadows,
  SurfaceColors,
} from '@/constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const ICON_COLOR = '#94A3B8';

/* -------------------------------------------------------------------------- */
/* ProfileTextField                                                           */
/* -------------------------------------------------------------------------- */

export interface ProfileTextFieldProps
  extends Pick<
    TextInputProps,
    | 'keyboardType'
    | 'autoCapitalize'
    | 'autoComplete'
    | 'textContentType'
    | 'returnKeyType'
    | 'onSubmitEditing'
    | 'maxLength'
  > {
  icon: IconName;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  /** Reads "(optional)" to screen readers; add the suffix to `placeholder` yourself. */
  optional?: boolean;
}

/** Pill text input matching the profile form, with an animated brand focus ring. */
export const ProfileTextField: React.FC<ProfileTextFieldProps> = ({
  icon,
  placeholder,
  value,
  onChangeText,
  optional,
  ...inputProps
}) => {
  const focus = useSharedValue(0);
  const ringStyle = useAnimatedStyle(() => ({ opacity: focus.value }));

  return (
    <View style={styles.fieldShell}>
      <Ionicons name={icon} size={18} color={ICON_COLOR} style={styles.leftIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={SurfaceColors.textMuted}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        accessibilityLabel={optional ? `${placeholder.replace(/\s*\(optional\)$/i, '')}, optional` : placeholder}
        onFocus={() => {
          focus.value = withTiming(1, { duration: 160 });
        }}
        onBlur={() => {
          focus.value = withTiming(0, { duration: 160 });
        }}
        {...inputProps}
      />
      <Animated.View pointerEvents="none" style={[styles.focusRing, ringStyle]} />
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* OptionPickerSheet + SelectField                                            */
/* -------------------------------------------------------------------------- */

export interface OptionPickerSheetProps {
  visible: boolean;
  title: string;
  icon: IconName;
  /** Provide the list once data exists; until then an empty state is shown. */
  options?: string[];
  selected?: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export const OptionPickerSheet: React.FC<OptionPickerSheetProps> = ({
  visible,
  title,
  icon,
  options,
  selected,
  onSelect,
  onClose,
}) => {
  const hasOptions = !!options && options.length > 0;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.sheetHeading}>{title}</Text>

      {hasOptions ? (
        <View style={styles.optionList}>
          {options.map((option) => {
            const isSelected = option === selected;
            return (
              <HapticPressable
                key={option}
                haptic="selection"
                borderRadius={Radii.lg}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                style={[styles.optionRow, isSelected && styles.optionRowSelected]}>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={20} color={BrandColors.primary} />
                )}
              </HapticPressable>
            );
          })}
        </View>
      ) : (
        <View style={styles.empty}>
          <View style={styles.emptyTile}>
            <Ionicons name={icon} size={26} color="#64748B" />
          </View>
          <Text style={styles.emptyTitle}>Options coming soon</Text>
          <Text style={styles.emptyBody}>
            The list of {title.toLowerCase()} will appear here shortly.
          </Text>
        </View>
      )}

      <HapticPressable
        haptic="selection"
        borderRadius={Radii.pill}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={styles.closeButton}>
        <Text style={styles.closeText}>Close</Text>
      </HapticPressable>
    </BottomSheet>
  );
};

export interface SelectFieldProps {
  icon: IconName;
  /** Shown as the placeholder and as the sheet title. */
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  options?: string[];
}

/** Pill-shaped field that opens a picker sheet instead of the keyboard. */
export const SelectField: React.FC<SelectFieldProps> = ({
  icon,
  label,
  value,
  onChange,
  options,
}) => {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const flip = useSharedValue(0);

  useEffect(() => {
    flip.value = reduceMotion
      ? open ? 1 : 0
      : withSpring(open ? 1 : 0, AnimationPresets.spring);
  }, [open, reduceMotion, flip]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${flip.value * 180}deg` }],
  }));

  const title = label.replace(/\s*\(optional\)$/i, '');

  return (
    <>
      {/* Shadow on a non-clipping wrapper; HapticPressable clips (overflow hidden) */}
      <View style={styles.selectShadow}>
        <HapticPressable
          haptic="light"
          scaleTo={0.98}
          borderRadius={Radii.pill}
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={value ? `${title}: ${value}` : title}
          accessibilityHint="Opens a list to choose from"
          style={styles.selectField}>
          <Ionicons name={icon} size={18} color={ICON_COLOR} style={styles.selectIcon} />
          <Text
            style={[styles.selectText, !value && styles.selectPlaceholder]}
            numberOfLines={1}>
            {value ?? label}
          </Text>
          <Animated.View style={chevronStyle}>
            <Ionicons name="chevron-down" size={18} color={ICON_COLOR} />
          </Animated.View>
        </HapticPressable>
      </View>

      <OptionPickerSheet
        visible={open}
        title={title}
        icon={icon}
        options={options}
        selected={value}
        onSelect={onChange}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* TermsCheckbox                                                              */
/* -------------------------------------------------------------------------- */

export interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const TermsCheckbox: React.FC<TermsCheckboxProps> = ({ checked, onChange }) => {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(checked ? 1 : 0);
  const pop = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = checked ? 1 : 0;
      return;
    }
    progress.value = withSpring(checked ? 1 : 0, AnimationPresets.spring);
    if (checked) {
      pop.value = withSequence(
        withTiming(1.15, { duration: 100 }),
        withSpring(1, AnimationPresets.bouncySpring)
      );
    }
  }, [checked, reduceMotion, progress, pop]);

  const fillStyle = useAnimatedStyle(() => ({
    opacity: Math.min(Math.max(progress.value, 0), 1),
  }));
  const checkStyle = useAnimatedStyle(() => ({
    opacity: Math.min(Math.max(progress.value, 0), 1),
    transform: [{ scale: progress.value }],
  }));
  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));

  return (
    <HapticPressable
      haptic="selection"
      scaleTo={0.985}
      borderRadius={Radii.md}
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityLabel="Accept Terms of Use and Privacy Policy"
      accessibilityState={{ checked }}
      style={styles.termsRow}>
      <Animated.View style={[styles.checkbox, boxStyle]}>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.checkboxFill, fillStyle]}
        />
        <Animated.View style={checkStyle}>
          <Ionicons name="checkmark" size={15} color="#FFFFFF" />
        </Animated.View>
      </Animated.View>
      <Text style={styles.termsText}>
        Accept <Text style={styles.termsLink}>Terms of Use</Text> and{' '}
        <Text style={styles.termsLink}>Privacy Policy</Text>
      </Text>
    </HapticPressable>
  );
};

/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  fieldShell: {
    position: 'relative',
    height: 52,
    borderRadius: Radii.pill,
    backgroundColor: '#FFFFFF',
    ...Shadows.card,
  },
  leftIcon: {
    position: 'absolute',
    left: 18,
    top: 17,
    zIndex: 2,
  },
  input: {
    height: 52,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    paddingStart: 46,
    paddingEnd: 20,
    // Android adds its own vertical padding / top-aligns text; centre it like iOS
    paddingVertical: 0,
    textAlignVertical: 'center',
    fontSize: 14.5,
    color: SurfaceColors.textPrimary,
  },
  focusRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Radii.pill,
    borderWidth: 1.5,
    borderColor: BrandColors.primary,
  },

  selectShadow: {
    height: 52,
    borderRadius: Radii.pill,
    backgroundColor: '#FFFFFF',
    ...Shadows.card,
  },
  selectField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingStart: 18,
    paddingEnd: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: '#FFFFFF',
  },
  selectIcon: {
    marginEnd: 10, // text lines up with ProfileTextField's 46px start padding
  },
  selectText: {
    flex: 1,
    fontSize: 14.5,
    color: SurfaceColors.textPrimary,
    marginEnd: 8,
  },
  selectPlaceholder: {
    color: SurfaceColors.textMuted,
  },

  sheetHeading: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: 'bold',
    color: SurfaceColors.textPrimary,
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  optionList: {
    gap: 8,
    maxHeight: 360,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: SurfaceColors.borderLight,
    backgroundColor: '#FFFFFF',
  },
  optionRowSelected: {
    borderColor: BrandColors.primary,
    backgroundColor: BrandColors.primaryLight,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: SurfaceColors.textPrimary,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  emptyTile: {
    width: 56,
    height: 56,
    borderRadius: Radii.lg,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: SurfaceColors.textPrimary,
  },
  emptyBody: {
    fontSize: 12.5,
    lineHeight: 18,
    color: SurfaceColors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  closeButton: {
    height: 50,
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  closeText: {
    fontSize: 15,
    fontWeight: '600',
    color: SurfaceColors.textSecondary,
  },

  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.22)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginEnd: 12,
  },
  checkboxFill: {
    backgroundColor: BrandColors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: SurfaceColors.textSecondary,
  },
  termsLink: {
    fontWeight: '700',
    color: BrandColors.primary,
  },
});
