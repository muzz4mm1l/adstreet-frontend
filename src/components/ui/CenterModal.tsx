import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, useReducedMotion } from 'react-native-reanimated';
import { useAppTheme } from '@/theme/useAppTheme';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/** Centered dialog card over a dimmed backdrop (ratings, dispute status...). */
export const CenterModal: React.FC<Props> = ({ visible, onClose, children }) => {
  const theme = useAppTheme();
  const reduceMotion = useReducedMotion();
  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(180)}
          exiting={reduceMotion ? undefined : FadeOut.duration(140)}
          style={[StyleSheet.absoluteFill, styles.backdrop]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close dialog" />
        </Animated.View>
        <View style={styles.center} pointerEvents="box-none">
          <Animated.View
            entering={reduceMotion ? undefined : ZoomIn.duration(220)}
            style={[styles.card, { backgroundColor: theme.surface }]}>
            {children}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  backdrop: { backgroundColor: 'rgba(20, 8, 10, 0.5)' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22 },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
});
