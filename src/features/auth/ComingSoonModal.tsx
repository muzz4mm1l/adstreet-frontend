import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { SocialProvider } from './SocialButton';
import { Radii, Shadows, SurfaceColors } from '@/constants/theme';

interface ComingSoonModalProps {
  visible: boolean;
  provider: SocialProvider | null;
  onClose: () => void;
}

/**
 * ComingSoonModal
 * Clean, high-taste modal displaying only the provider logo and "Coming Soon" text.
 */
export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  visible,
  provider,
  onClose,
}) => {
  if (!visible || !provider) return null;

  const renderLogo = () => {
    switch (provider) {
      case 'google':
        return (
          <View style={[styles.logoCircle, { backgroundColor: '#FDF2F2' }]}>
            <FontAwesome5 name="google" size={38} color="#EA4335" />
          </View>
        );
      case 'facebook':
        return (
          <View style={[styles.logoCircle, { backgroundColor: '#EEF4FF' }]}>
            <FontAwesome name="facebook-square" size={42} color="#1877F2" />
          </View>
        );
      case 'apple':
        return (
          <View style={[styles.logoCircle, { backgroundColor: '#F3F4F6' }]}>
            <FontAwesome5 name="apple" size={40} color="#000000" />
          </View>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View
          entering={ZoomIn.duration(250).springify().damping(18)}
          exiting={ZoomOut.duration(150)}
          style={styles.cardContainer}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.card}>
              {/* Provider Logo */}
              {renderLogo()}

              {/* Coming Soon Text */}
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  card: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...Shadows.modal,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  comingSoonText: {
    fontSize: 20,
    fontWeight: '700',
    color: SurfaceColors.textPrimary,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
    letterSpacing: -0.2,
  },
});
