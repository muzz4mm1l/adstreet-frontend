import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SurfaceColors } from '@/constants/theme';

interface AuthHeaderProps {
  showBack?: boolean;
  onBack?: () => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ showBack = false, onBack }) => {
  return (
    <View style={styles.container}>
      <View style={styles.actionSlot}>
        {showBack && (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={SurfaceColors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.logoWrapper}>
        <Image
          source={require('@/assets/images/auth-logo-clean.png')}
          style={styles.logo}
          contentFit="contain"
          transition={200}
        />
      </View>

      <View style={styles.actionSlot} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    width: '100%',
  },
  actionSlot: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 52,
    height: 52,
  },
});
