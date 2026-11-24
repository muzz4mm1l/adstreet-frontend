import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GradientButton } from '@/components/ui/GradientButton';
import { HapticPressable } from '@/components/ui/HapticPressable';
import {
  AnimationPresets,
  BrandColors,
  Radii,
  Shadows,
  SurfaceColors,
} from '@/constants/theme';
import { ProfileTypeCard, ProfileType } from './ProfileTypeCard';
import { AvatarPickerSheet } from './AvatarPickerSheet';
import { AvatarCropper } from './AvatarCropper';
import { AvatarImage, prepareSourceImage } from './avatarImage';
import {
  EMPTY_SEEKER_DATA,
  SeekerDetailsFields,
  SeekerNameField,
  SeekerProfileData,
} from './ServiceSeekerForm';

const PROFILE_TYPES: {
  id: ProfileType;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}[] = [
  {
    id: 'seeker',
    title: 'Service Seeker',
    subtitle: 'Find and hire the right talent',
    icon: 'search-outline',
  },
  {
    id: 'provider',
    title: 'Service Provider',
    subtitle: "Offer your agency's services",
    icon: 'briefcase-outline',
  },
  {
    id: 'freelancer',
    title: 'Individual/Freelancer',
    subtitle: 'Work independently, your way',
    icon: 'person-outline',
  },
];

export interface SignUp05Data {
  phone: string;
  email: string;
  avatarUri?: string | null;
  profileType?: ProfileType | null;
  /** Only present when `profileType === 'seeker'`. */
  seeker?: SeekerProfileData;
  /** Only present when `profileType === 'provider'` (includes webLinks + portfolio). */
  provider?: SeekerProfileData;
  /** Only present when `profileType === 'freelancer'`. */
  freelancer?: SeekerProfileData;
}

export interface SignUp05ViewProps {
  phone: string;
  onChangePhone: (text: string) => void;
  email: string;
  onChangeEmail: (text: string) => void;
  onContinue: (data?: SignUp05Data) => void;
  onSkip?: () => void;
  // Optional legacy props preserved for backward compatibility
  password?: string;
  onChangePassword?: (text: string) => void;
  confirmPassword?: string;
  onChangeConfirmPassword?: (text: string) => void;
  fullName?: string;
  onChangeFullName?: (text: string) => void;
  bio?: string;
  onChangeBio?: (text: string) => void;
  location?: string;
  onChangeLocation?: (location: string) => void;
}

/**
 * Sign up 05 — Set up your profile
 * Fields:
 * - Clean Avatar Photo Placeholder with camera upload badge
 * - Phone number
 * - Email address
 * (Password was collected in Step 2 and verified via OTP in Step 3)
 */
export const SignUp05View: React.FC<SignUp05ViewProps> = ({
  phone,
  onChangePhone,
  email,
  onChangeEmail,
  onContinue,
  onSkip,
}) => {
  const reduceMotion = useReducedMotion();
  // Cropped avatar shown in the profile, and the uncropped source it came from
  // (kept so "Adjust current photo" can re-crop from the original, not the crop).
  const [avatar, setAvatar] = useState<AvatarImage | null>(null);
  const [source, setSource] = useState<AvatarImage | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSession, setCropSession] = useState(0);
  const [profileType, setProfileType] = useState<ProfileType | null>(null);
  const avatarUri = avatar?.uri ?? null;
  const [seeker, setSeeker] = useState<SeekerProfileData>(EMPTY_SEEKER_DATA);
  const updateSeeker = (patch: Partial<SeekerProfileData>) =>
    setSeeker((prev) => ({ ...prev, ...patch }));
  const isSeeker = profileType === 'seeker';
  const isProvider = profileType === 'provider';
  const isFreelancer = profileType === 'freelancer';
  // All three profile types share one form component with a per-type field layout.
  const hasProfileForm = profileType !== null;

  // Small pop whenever the photo changes (skipped on first render).
  const pop = useSharedValue(1);
  const popReady = useRef(false);
  useEffect(() => {
    if (!popReady.current) {
      popReady.current = true;
      return;
    }
    if (reduceMotion) return;
    pop.value = withSequence(
      withTiming(1.07, { duration: 120 }),
      withSpring(1, AnimationPresets.bouncySpring)
    );
  }, [avatarUri, reduceMotion, pop]);
  const avatarPopStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onContinue({
      phone: phone.trim(),
      email: email.trim(),
      avatarUri,
      profileType,
      seeker: isSeeker ? seeker : undefined,
      provider: isProvider ? seeker : undefined,
      freelancer: isFreelancer ? seeker : undefined,
    });
  };

  const handlePickAvatar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSheetOpen(true);
  };

  // The system picker/camera can't present while our sheet is still animating away.
  const afterSheetCloses = (action: () => void | Promise<void>) => {
    setSheetOpen(false);
    setTimeout(() => {
      void action();
    }, 380);
  };

  const openCropper = (image: AvatarImage) => {
    setSource(image);
    setCropSession((n) => n + 1);
    setCropOpen(true);
  };

  const cropPickedAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      const prepared = await prepareSourceImage({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      });
      openCropper(prepared);
    } catch {
      Alert.alert('Photo unavailable', "We couldn't open that photo. Please try another one.");
    }
  };

  const handleChooseLibrary = () =>
    afterSheetCloses(async () => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'images',
          allowsEditing: false,
          quality: 1,
        });
        if (!result.canceled && result.assets[0]) {
          await cropPickedAsset(result.assets[0]);
        }
      } catch {
        Alert.alert('Photos unavailable', "We couldn't open your photo library.");
      }
    });

  const handleTakePhoto = () =>
    afterSheetCloses(async () => {
      try {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            'Camera access needed',
            'Allow camera access in Settings to take a profile photo.',
            [
              { text: 'Not now', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: 'images',
          allowsEditing: false,
          quality: 1,
        });
        if (!result.canceled && result.assets[0]) {
          await cropPickedAsset(result.assets[0]);
        }
      } catch {
        Alert.alert('Camera unavailable', "We couldn't open the camera on this device.");
      }
    });

  const handleAdjustCurrent = () =>
    afterSheetCloses(() => {
      if (source) openCropper(source);
    });

  const handleRemove = () => {
    setSheetOpen(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setAvatar(null);
    setSource(null);
  };

  const handleCropDone = (result: AvatarImage, croppedFrom: AvatarImage) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setAvatar(result);
    setSource(croppedFrom);
    setCropOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.heading}>Set up your profile</Text>
        <Text style={styles.subtitle}>
          Provide your details to complete your profile
        </Text>
      </View>

      {/* Avatar Photo Section with Fixed Placeholder */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          {/* Shadow lives on this non-clipping wrapper; the pressable clips (overflow hidden) */}
          <Animated.View style={[styles.avatarShadow, avatarPopStyle]}>
            <HapticPressable
              haptic="light"
              scaleTo={0.96}
              borderRadius={46}
              onPress={handlePickAvatar}
              accessibilityRole="button"
              accessibilityLabel={avatarUri ? 'Change profile photo' : 'Add profile photo'}
              style={styles.avatarPressable}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatarImage}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={42} color="#94A3B8" />
                </View>
              )}
            </HapticPressable>
          </Animated.View>

          {/* Camera / edit badge */}
          <View style={styles.cameraBadgeShadow}>
            <HapticPressable
              haptic="light"
              borderRadius={16}
              onPress={handlePickAvatar}
              accessibilityRole="button"
              accessibilityLabel={avatarUri ? 'Edit profile photo' : 'Add profile photo'}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.cameraBadge}>
              <Feather
                name={avatarUri ? 'edit-2' : 'camera'}
                size={14}
                color={BrandColors.primary}
              />
            </HapticPressable>
          </View>
        </View>
      </View>

      {/* Profile type: single choice */}
      <View style={styles.typeGroup} accessibilityRole="radiogroup">
        {PROFILE_TYPES.map((type, index) => (
          <ProfileTypeCard
            key={type.id}
            index={index}
            title={type.title}
            subtitle={type.subtitle}
            icon={type.icon}
            selected={profileType === type.id}
            onSelect={() => setProfileType(type.id)}
          />
        ))}
      </View>

      {/* Seeker / Provider: name sits above the shared phone + email */}
      {hasProfileForm && <SeekerNameField data={seeker} onChange={updateSeeker} />}

      {/* Form Fields: Phone & Email */}
      <View style={[styles.formGroup, hasProfileForm && styles.formGroupSeeker]}>
        {/* 1. Phone Field */}
        <View style={styles.inputWrapper}>
          <Ionicons
            name="call-outline"
            size={18}
            color="#94A3B8"
            style={styles.leftInputIcon}
          />
          <TextInput
            style={[styles.input, styles.inputWithLeftIcon]}
            placeholder="Phone number"
            placeholderTextColor={SurfaceColors.textMuted}
            value={phone}
            onChangeText={onChangePhone}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>

        {/* 2. Email Field */}
        <View style={styles.inputWrapper}>
          <Ionicons
            name="mail-outline"
            size={18}
            color="#94A3B8"
            style={styles.leftInputIcon}
          />
          <TextInput
            style={[styles.input, styles.inputWithLeftIcon]}
            placeholder="Email address"
            placeholderTextColor={SurfaceColors.textMuted}
            value={email}
            onChangeText={onChangeEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />
        </View>
      </View>

      {/* Seeker / Provider: remaining fields + terms */}
      {profileType && (
        <SeekerDetailsFields data={seeker} onChange={updateSeeker} variant={profileType} />
      )}

      {/* CTA + skip glide into place as the seeker fields appear/disappear */}
      <Animated.View layout={LinearTransition.duration(240)}>
        {/* Primary Continue CTA with Premium Red Gradient */}
        <GradientButton
          title="Continue"
          showArrow={true}
          onPress={handleContinue}
          style={styles.ctaButtonWrapper}
        />

        {/* Optional Skip Action */}
        {onSkip && (
          <View style={styles.skipSection}>
            <HapticPressable
              haptic="selection"
              borderRadius={Radii.pill}
              onPress={onSkip}
              style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </HapticPressable>
          </View>
        )}
      </Animated.View>

      <AvatarPickerSheet
        visible={sheetOpen}
        hasPhoto={!!avatarUri}
        onClose={() => setSheetOpen(false)}
        onTakePhoto={handleTakePhoto}
        onChooseLibrary={handleChooseLibrary}
        onAdjustCurrent={handleAdjustCurrent}
        onRemove={handleRemove}
      />

      {source && (
        <AvatarCropper
          key={cropSession}
          visible={cropOpen}
          image={source}
          onCancel={() => setCropOpen(false)}
          onDone={handleCropDone}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 24,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 'bold',
    color: SurfaceColors.textPrimary,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: SurfaceColors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  avatarSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  typeGroup: {
    gap: 10,
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarShadow: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#F1F5F9',
    ...Shadows.card,
  },
  avatarPressable: {
    width: 92,
    height: 92,
  },
  avatarImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadgeShadow: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  cameraBadge: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  formGroup: {
    marginBottom: 18,
  },
  // The seeker block below supplies its own top spacing (inputWrapper already adds 14).
  formGroupSeeker: {
    marginBottom: 0,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  leftInputIcon: {
    position: 'absolute',
    left: 18,
    top: 17,
    zIndex: 2,
  },
  input: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 20,
    fontSize: 14.5,
    color: SurfaceColors.textPrimary,
    ...Shadows.card,
  },
  inputWithLeftIcon: {
    paddingStart: 46,
  },
  ctaButtonWrapper: {
    width: '100%',
    marginTop: 8,
    marginBottom: 14,
  },
  skipSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  skipButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: Radii.pill,
  },
  skipButtonText: {
    fontSize: 13,
    color: SurfaceColors.textSecondary,
    fontWeight: '500',
  },
});
