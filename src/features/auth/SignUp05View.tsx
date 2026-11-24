import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GradientButton } from '@/components/ui/GradientButton';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { BrandColors, Radii, Shadows, SurfaceColors } from '@/constants/theme';
import { ProfileTypeCard, ProfileType } from './ProfileTypeCard';

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
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [profileType, setProfileType] = useState<ProfileType | null>(null);

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onContinue({
      phone: phone.trim(),
      email: email.trim(),
      avatarUri,
      profileType,
    });
  };

  const handlePickAvatar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Alert.alert('Profile Photo', 'Choose an option for your profile picture.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Choose from Gallery',
        onPress: () => {
          // Previews a clean uploaded avatar state
          setAvatarUri('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');
        },
      },
      {
        text: 'Remove Photo',
        style: 'destructive',
        onPress: () => setAvatarUri(null),
      },
    ]);
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

          {/* Camera Upload Badge */}
          <TouchableOpacity
            style={styles.cameraBadge}
            activeOpacity={0.8}
            onPress={handlePickAvatar}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Feather name="camera" size={14} color={BrandColors.primary} />
          </TouchableOpacity>
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

      {/* Form Fields: Phone & Email */}
      <View style={styles.formGroup}>
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
  avatarImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Shadows.card,
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
    ...Shadows.card,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  formGroup: {
    marginBottom: 18,
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
