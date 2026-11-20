import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SplashScreenView } from '@/features/splash/SplashScreenView';
import { OnboardingScreenView } from '@/features/onboarding/OnboardingScreenView';
import { SignUpFlow } from '@/features/auth/SignUpFlow';

type AppScreen = 'splash' | 'onboarding' | 'signup';

export default function AppEntry() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');

  const handleSplashFinish = () => {
    setCurrentScreen('onboarding');
  };

  const handleOnboardingProceed = () => {
    setCurrentScreen('signup');
  };

  const handleBackToOnboarding = () => {
    setCurrentScreen('onboarding');
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'splash' && (
        <SplashScreenView onFinish={handleSplashFinish} />
      )}

      {currentScreen === 'onboarding' && (
        <OnboardingScreenView
          onGetStarted={handleOnboardingProceed}
          onSkip={handleOnboardingProceed}
        />
      )}

      {currentScreen === 'signup' && (
        <SignUpFlow
          onBackToOnboarding={handleBackToOnboarding}
          onComplete={() => setCurrentScreen('onboarding')}
        />
      )}

      {/* Dev helper pill for fast UI inspection */}
      {__DEV__ && (
        <View style={styles.devBar}>
          <TouchableOpacity
            style={styles.devButton}
            onPress={() => {
              if (currentScreen === 'splash') setCurrentScreen('onboarding');
              else if (currentScreen === 'onboarding') setCurrentScreen('signup');
              else setCurrentScreen('splash');
            }}>
            <Text style={styles.devButtonText}>
              {currentScreen === 'splash' && 'Next: Onboarding ➔'}
              {currentScreen === 'onboarding' && 'Next: Sign Up ➔'}
              {currentScreen === 'signup' && '↺ Replay Splash'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  devBar: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    zIndex: 999,
    opacity: 0.65,
  },
  devButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  devButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
