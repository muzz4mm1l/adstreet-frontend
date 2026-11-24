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
            <Ionicons name="chevron-back" size={20} color="#0F172A" />
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
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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
