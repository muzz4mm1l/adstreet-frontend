import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { BrandColors, Radii, Shadows, SurfaceColors } from '@/constants/theme';

export interface PortfolioAttachment {
  id: string;
  source: any;
  title?: string;
}

interface UploadPortfolioModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (attachments: PortfolioAttachment[], caption: string) => void;
}

const DEFAULT_SAMPLES: PortfolioAttachment[] = [
  {
    id: 'sample-1',
    source: require('@/assets/images/portfolio-sample-1.png'),
    title: 'Mobile App Screen',
  },
  {
    id: 'sample-2',
    source: require('@/assets/images/portfolio-sample-2.png'),
    title: 'Collage Mockup',
  },
];

export const UploadPortfolioModal: React.FC<UploadPortfolioModalProps> = ({
  visible,
  onClose,
  onUpload,
}) => {
  const [attachments, setAttachments] =
    useState<PortfolioAttachment[]>(DEFAULT_SAMPLES);
  const [caption, setCaption] = useState('');

  const handleRemoveAttachment = (id: string) => {
    Haptics.selectionAsync().catch(() => {});
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddPhoto = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    // Add another sample or allow camera simulation
    const newId = `sample-${Date.now()}`;
    setAttachments((prev) => [
      ...prev,
      {
        id: newId,
        source: require('@/assets/images/portfolio-sample-1.png'),
        title: 'New Snapshot',
      },
    ]);
  };

  const handleClose = () => {
    Haptics.selectionAsync().catch(() => {});
    onClose();
  };

  const handleSubmit = () => {
    if (attachments.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      );
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {}
    );
    onUpload(attachments, caption);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        {/* Backdrop with Fade */}
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(180)}
          style={styles.backdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Modal Card with Symmetrical Slide */}
        <Animated.View
          entering={SlideInDown.duration(280).springify().damping(18)}
          exiting={SlideOutDown.duration(200)}
          style={styles.modalCard}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.headerSpacer} />
            <Text style={styles.headerTitle}>Upload</Text>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeButton}>
              <Ionicons
                name="close"
                size={22}
                color={SurfaceColors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Media Attachments Strip */}
          <View style={styles.mediaRow}>
            {attachments.map((item) => (
              <View key={item.id} style={styles.thumbnailWrapper}>
                <Image
                  source={item.source}
                  style={styles.thumbnail}
                  contentFit="cover"
                  transition={150}
                />
                <TouchableOpacity
                  onPress={() => handleRemoveAttachment(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.removeBadge}>
                  <Ionicons name="close" size={11} color="#666666" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Photo Button (Red Circle) */}
            <HapticPressable
              haptic="light"
              borderRadius={Radii.pill}
              onPress={handleAddPhoto}
              style={styles.addPhotoButton}>
              <Feather name="camera" size={20} color="#FFFFFF" />
            </HapticPressable>
          </View>

          {/* Caption Input Field */}
          <View style={styles.captionWrapper}>
            <TextInput
              style={styles.captionInput}
              placeholder="Caption"
              placeholderTextColor={SurfaceColors.textMuted}
              value={caption}
              onChangeText={setCaption}
              returnKeyType="done"
            />
          </View>

          {/* Upload Button */}
          <HapticPressable
            haptic="medium"
            borderRadius={Radii.pill}
            onPress={handleSubmit}
            style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Upload</Text>
          </HapticPressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: SurfaceColors.card,
    borderRadius: Radii.xxl,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    ...Shadows.modal,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerSpacer: {
    width: 28,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: SurfaceColors.textPrimary,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  closeButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 24,
  },
  thumbnailWrapper: {
    position: 'relative',
    width: 68,
    height: 76,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
  },
  removeBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  addPhotoButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.buttonGlow,
  },
  captionWrapper: {
    width: '100%',
    height: 48,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  captionInput: {
    fontSize: 14,
    color: SurfaceColors.textPrimary,
    paddingVertical: 0,
  },
  uploadButton: {
    height: 48,
    backgroundColor: BrandColors.primary,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.buttonGlow,
  },
  uploadButtonText: {
    color: SurfaceColors.textInverted,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
});
