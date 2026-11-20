import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { BrandColors, Radii, Shadows, SurfaceColors } from '@/constants/theme';

interface SignUp05ViewProps {
  fullName: string;
  onChangeFullName: (text: string) => void;
  bio: string;
  onChangeBio: (text: string) => void;
  location: string;
  onChangeLocation: (location: string) => void;
  onContinue: () => void;
  onSkip: () => void;
}

const AVAILABLE_LOCATIONS = [
  'Karachi, Pakistan',
  'Lahore, Pakistan',
  'Islamabad, Pakistan',
  'Rawalpindi, Pakistan',
  'Faisalabad, Pakistan',
  'Peshawar, Pakistan',
  'Dubai, UAE',
  'Riyadh, Saudi Arabia',
  'London, United Kingdom',
  'Remote Worldwide',
];

export const SignUp05View: React.FC<SignUp05ViewProps> = ({
  fullName,
  onChangeFullName,
  bio,
  onChangeBio,
  location,
  onChangeLocation,
  onContinue,
  onSkip,
}) => {
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleSelectLocation = (loc: string) => {
    onChangeLocation(loc);
    setShowLocationPicker(false);
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

      {/* Avatar Photo Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <Image
            source={require('@/assets/images/profile-avatar-sample.png')}
            style={styles.avatarImage}
            contentFit="cover"
            transition={200}
          />
          {/* Camera Upload Badge */}
          <TouchableOpacity
            style={styles.cameraBadge}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="camera" size={13} color={BrandColors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Form Fields */}
      <View style={styles.formGroup}>
        {/* Full Name */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            placeholderTextColor={SurfaceColors.textMuted}
            value={fullName}
            onChangeText={onChangeFullName}
            autoCapitalize="words"
          />
        </View>

        {/* Short Bio */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Short Bio"
            placeholderTextColor={SurfaceColors.textMuted}
            value={bio}
            onChangeText={onChangeBio}
          />
        </View>

        {/* Location Dropdown */}
        <TouchableOpacity
          style={[styles.input, styles.dropdownInput]}
          activeOpacity={0.7}
          onPress={() => setShowLocationPicker(true)}>
          <Text
            style={[
              styles.dropdownText,
              !location && styles.dropdownPlaceholder,
            ]}>
            {location || 'Location *'}
          </Text>
          <Ionicons
            name="chevron-down"
            size={18}
            color={SurfaceColors.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Primary Continue CTA */}
      <HapticPressable
        haptic="medium"
        borderRadius={Radii.pill}
        onPress={onContinue}
        style={styles.continueButton}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </HapticPressable>

      {/* Skip Action */}
      <View style={styles.skipSection}>
        <HapticPressable
          haptic="selection"
          borderRadius={Radii.pill}
          onPress={onSkip}
          style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </HapticPressable>
      </View>

      {/* Location Selection Modal */}
      <Modal
        visible={showLocationPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <TouchableOpacity
                onPress={() => setShowLocationPicker(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close" size={22} color={SurfaceColors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={AVAILABLE_LOCATIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.locationOption,
                    location === item && styles.selectedLocationOption,
                  ]}
                  onPress={() => handleSelectLocation(item)}>
                  <Text
                    style={[
                      styles.locationOptionText,
                      location === item && styles.selectedLocationOptionText,
                    ]}>
                    {item}
                  </Text>
                  {location === item && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={BrandColors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
    marginBottom: 24,
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
    marginBottom: 28,
  },
  avatarWrapper: {
    position: 'relative',
    width: 84,
    height: 84,
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -4,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 14,
  },
  input: {
    height: 50,
    backgroundColor: SurfaceColors.card,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: SurfaceColors.borderLight,
    paddingHorizontal: 20,
    fontSize: 14.5,
    color: SurfaceColors.textPrimary,
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dropdownText: {
    fontSize: 14.5,
    color: SurfaceColors.textPrimary,
  },
  dropdownPlaceholder: {
    color: SurfaceColors.textMuted,
  },
  continueButton: {
    height: 52,
    backgroundColor: BrandColors.primary,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 14,
    ...Shadows.buttonGlow,
  },
  continueButtonText: {
    color: SurfaceColors.textInverted,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.2,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: SurfaceColors.card,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    maxHeight: '60%',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: SurfaceColors.borderHairline,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: SurfaceColors.textPrimary,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  selectedLocationOption: {
    backgroundColor: '#FFF1F2',
    borderRadius: Radii.md,
  },
  locationOptionText: {
    fontSize: 14.5,
    color: SurfaceColors.textPrimary,
  },
  selectedLocationOptionText: {
    fontWeight: '600',
    color: BrandColors.primary,
  },
});
