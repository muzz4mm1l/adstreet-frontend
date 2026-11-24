import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { GradientButton } from '@/components/ui/GradientButton';
import { CodeSlots, CodeSlotsStatus } from '@/components/ui/CodeSlots';
import { BrandColors, Radii, Shadows, SurfaceColors } from '@/constants/theme';

interface SignUp03ViewProps {
  email: string;
  code: string[];
  onChangeCode: (code: string[]) => void;
  onVerify: () => void;
  onChangeEmail: () => void;
  onResend?: () => void;
}

export const SignUp03View: React.FC<SignUp03ViewProps> = ({
  email,
  code,
  onChangeCode,
  onVerify,
  onChangeEmail,
  onResend,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const [secondsRemaining, setSecondsRemaining] = useState(45);
  const [status, setStatus] = useState<CodeSlotsStatus>('idle');

  // Fully responsive slot size and spacing calibrated for all screen densities and zoom levels
  const horizontalPadding = windowWidth < 360 ? 16 : 24;
  const availableWidth = windowWidth - horizontalPadding * 2;
  const responsiveGap = windowWidth < 360 ? 5 : windowWidth < 390 ? 6 : 7;
  const hyphenAllowance = 14 + responsiveGap;
  const totalWidthForSlots = availableWidth - (5 * responsiveGap + hyphenAllowance);
  const responsiveSlotSize = Math.min(46, Math.max(38, Math.floor(totalWidthForSlots / 6)));

  // Resend code countdown timer
  useEffect(() => {
    if (secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const handleCodeChange = (newCodeStr: string) => {
    setStatus('idle');
    const newCodeArr = Array.from({ length: 6 }, (_, i) => newCodeStr[i] ?? '');
    onChangeCode(newCodeArr);
  };

  const handleVerify = () => {
    // Dummy OTP mode: accept any value without requiring authentication or 6-digit validation
    setStatus('success');
    // Allow the delightful success wash & checkmark animation to land before advancing
    setTimeout(() => {
      onVerify();
    }, 400);
  };

  const handleResendPress = () => {
    if (secondsRemaining === 0) {
      setSecondsRemaining(45);
      setStatus('idle');
      onChangeCode(['', '', '', '', '', '']);
      onResend?.();
    }
  };

  const formattedTimer = `00:${secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}`;
  const isCodeComplete = code.filter(Boolean).length === 6;

  return (
    <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.heading}>6-digit code</Text>
        <Text style={styles.subtitle}>
          Enter the code we sent to the email{' '}
          <Text style={styles.emailHighlight}>{email || 'abc@gmail.com'}</Text>
        </Text>
      </View>

      {/* React Bits CodeSlots Animated Component */}
      <View style={styles.codeSlotsWrapper}>
        <CodeSlots
          length={6}
          splitIndex={3}
          value={code.join('')}
          status={status}
          onChange={handleCodeChange}
          onComplete={handleVerify}
          autoFocus={true}
          accentColor={BrandColors.primary}
          inkColor={BrandColors.primary}
          slotColor={SurfaceColors.card}
          digitColor={SurfaceColors.textPrimary}
          dangerColor={BrandColors.primary}
          slotSize={responsiveSlotSize}
          gap={responsiveGap}
          radius={Radii.md}
          bounce={0.2}
          settle={0.3}
          rise={8}
          cascade={20}
        />
      </View>

      {/* Resend Code Timer */}
      <View style={styles.resendSection}>
        {secondsRemaining > 0 ? (
          <Text style={styles.timerText}>
            Resend Code <Text style={styles.timerHighlight}>{formattedTimer}</Text>
          </Text>
        ) : (
          <TouchableOpacity
            onPress={handleResendPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.resendActiveText}>Resend Code</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Verify Primary CTA with Gradient & Arrow */}
      <GradientButton
        title="Verify"
        showArrow={true}
        onPress={handleVerify}
        style={styles.ctaButtonWrapper}
      />

      {/* Change Email Action */}
      <View style={styles.changeEmailSection}>
        <HapticPressable
          haptic="selection"
          borderRadius={Radii.pill}
          onPress={onChangeEmail}
          style={styles.changeEmailButton}>
          <Text style={styles.changeEmailText}>Change email</Text>
        </HapticPressable>
      </View>
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
    marginBottom: 32,
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
  emailHighlight: {
    color: SurfaceColors.textPrimary,
    fontWeight: '600',
  },
  codeSlotsWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  resendSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  timerText: {
    fontSize: 13,
    color: SurfaceColors.textSecondary,
    fontWeight: '400',
  },
  timerHighlight: {
    color: BrandColors.primary,
    fontWeight: '600',
  },
  resendActiveText: {
    fontSize: 13,
    color: BrandColors.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  ctaButtonWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  changeEmailSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 24,
  },
  changeEmailButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: Radii.pill,
  },
  changeEmailText: {
    fontSize: 13,
    color: SurfaceColors.textSecondary,
    fontWeight: '600',
  },
});
