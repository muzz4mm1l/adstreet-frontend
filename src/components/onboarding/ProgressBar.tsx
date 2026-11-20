import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { HapticPressable } from '@/components/ui/HapticPressable';

interface ProgressBarProps {
  totalSteps: number;
  currentStep: number;
  onSkip?: () => void;
  showSkip?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  totalSteps = 3,
  currentStep = 0,
  onSkip,
  showSkip = true,
}) => {
  return (
    <View style={styles.container}>
      {/* Segmented Indicators */}
      <View style={styles.segmentsRow}>
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;

          return (
            <View
              key={idx}
              style={[
                styles.segment,
                isActive && styles.activeSegment,
                isCompleted && styles.completedSegment,
              ]}
            />
          );
        })}
      </View>

      {/* Skip Pill Button */}
      {showSkip && (
        <HapticPressable
          haptic="selection"
          onPress={onSkip}
          borderRadius={16}
          style={styles.skipButton}
          hitSlop={10}>
          <Text style={styles.skipText}>Skip</Text>
        </HapticPressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    width: '100%',
  },
  segmentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 16,
  },
  segment: {
    height: 3.5,
    flex: 1,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  activeSegment: {
    backgroundColor: '#FFFFFF',
  },
  completedSegment: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  skipButton: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
