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
import { Ionicons } from '@expo/vector-icons';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { BrandColors, Radii, Shadows, SurfaceColors } from '@/constants/theme';

interface SignUp06ViewProps {
  category: string;
  onChangeCategory: (category: string) => void;
  skills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  startingPrice: string;
  onChangeStartingPrice: (price: string) => void;
  onContinue: () => void;
  onSkip: () => void;
}

const CATEGORIES = [
  'Creative & Design',
  'Media Planning & Buying',
  'Copywriting & Content',
  'Video & TV Production',
  'Digital & Performance Marketing',
  'Public Relations (PR)',
  'Brand Strategy & Consulting',
];

const SUGGESTED_SKILLS = [
  'Design',
  'Prototype',
  'Art Direction',
  'Copywriting',
  'UI/UX',
  'Branding',
  'Video Editing',
  'Animation',
  'Campaign Strategy',
];

export const SignUp06View: React.FC<SignUp06ViewProps> = ({
  category,
  onChangeCategory,
  skills,
  onAddSkill,
  onRemoveSkill,
  startingPrice,
  onChangeStartingPrice,
  onContinue,
  onSkip,
}) => {
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const handleAddSkillFromInput = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      onAddSkill(skillInput.trim());
      setSkillInput('');
    }
  };

  const handlePriceStep = (delta: number) => {
    const current = parseInt(startingPrice.replace(/[^0-9]/g, ''), 10) || 0;
    const next = Math.max(0, current + delta);
    onChangeStartingPrice(next.toString());
  };

  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.heading}>Choose your services/skills</Text>
        <Text style={styles.subtitle}>
          Provide your details to complete your profile
        </Text>
      </View>

      {/* Form Fields */}
      <View style={styles.formGroup}>
        {/* Service Category Dropdown */}
        <TouchableOpacity
          style={[styles.input, styles.dropdownInput]}
          activeOpacity={0.7}
          onPress={() => setShowCategoryPicker(true)}>
          <Text
            style={[
              styles.dropdownText,
              !category && styles.dropdownPlaceholder,
            ]}>
            {category || 'Service Category'}
          </Text>
          <Ionicons
            name="chevron-down"
            size={18}
            color={SurfaceColors.textMuted}
          />
        </TouchableOpacity>

        {/* Skills Tag Input Box */}
        <View style={styles.skillsContainer}>
          <View style={styles.chipsRow}>
            {skills.map((skill) => (
              <View key={skill} style={styles.skillChip}>
                <Text style={styles.skillChipText}>{skill}</Text>
                <TouchableOpacity
                  onPress={() => onRemoveSkill(skill)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.chipRemoveButton}>
                  <Text style={styles.chipRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TextInput
              style={styles.skillTextInput}
              placeholder={skills.length === 0 ? 'Select Skills' : 'Add...'}
              placeholderTextColor={SurfaceColors.textMuted}
              value={skillInput}
              onChangeText={setSkillInput}
              onSubmitEditing={handleAddSkillFromInput}
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Quick Skill Suggestions */}
        <View style={styles.suggestionsRow}>
          {SUGGESTED_SKILLS.filter((s) => !skills.includes(s))
            .slice(0, 4)
            .map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.suggestionPill}
                onPress={() => onAddSkill(s)}>
                <Text style={styles.suggestionPillText}>+ {s}</Text>
              </TouchableOpacity>
            ))}
        </View>

        {/* Starting Price Field with Stepper */}
        <View style={styles.priceWrapper}>
          <TextInput
            style={[styles.input, styles.priceInput]}
            placeholder="Starting Price *"
            placeholderTextColor={SurfaceColors.textMuted}
            keyboardType="numeric"
            value={startingPrice ? `$${startingPrice.replace('$', '')}` : ''}
            onChangeText={(val) => onChangeStartingPrice(val.replace('$', ''))}
          />
          <View style={styles.stepperControls}>
            <TouchableOpacity
              onPress={() => handlePriceStep(25)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              style={styles.stepperButton}>
              <Ionicons name="chevron-up" size={14} color={SurfaceColors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handlePriceStep(-25)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              style={styles.stepperButton}>
              <Ionicons name="chevron-down" size={14} color={SurfaceColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
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

      {/* Category Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Service Category</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryPicker(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close" size={22} color={SurfaceColors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    category === item && styles.selectedCategoryOption,
                  ]}
                  onPress={() => {
                    onChangeCategory(item);
                    setShowCategoryPicker(false);
                  }}>
                  <Text
                    style={[
                      styles.categoryOptionText,
                      category === item && styles.selectedCategoryOptionText,
                    ]}>
                    {item}
                  </Text>
                  {category === item && (
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
    marginBottom: 28,
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
  formGroup: {
    marginBottom: 16,
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
  skillsContainer: {
    minHeight: 50,
    backgroundColor: SurfaceColors.card,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: SurfaceColors.borderLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE8EA',
    borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  skillChipText: {
    fontSize: 12.5,
    color: BrandColors.primary,
    fontWeight: '600',
    marginRight: 6,
  },
  chipRemoveButton: {
    padding: 2,
  },
  chipRemoveText: {
    fontSize: 11,
    color: BrandColors.primary,
    fontWeight: 'bold',
  },
  skillTextInput: {
    minWidth: 80,
    height: 32,
    fontSize: 13.5,
    color: SurfaceColors.textPrimary,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  suggestionPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: Radii.pill,
  },
  suggestionPillText: {
    fontSize: 11.5,
    color: SurfaceColors.textSecondary,
    fontWeight: '500',
  },
  priceWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  priceInput: {
    paddingRight: 44,
  },
  stepperControls: {
    position: 'absolute',
    right: 14,
    top: 8,
    bottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButton: {
    padding: 2,
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
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  selectedCategoryOption: {
    backgroundColor: '#FFF1F2',
    borderRadius: Radii.md,
  },
  categoryOptionText: {
    fontSize: 14.5,
    color: SurfaceColors.textPrimary,
  },
  selectedCategoryOptionText: {
    fontWeight: '600',
    color: BrandColors.primary,
  },
});
