import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { HapticPressable } from '@/components/ui/HapticPressable';
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
  const [secondsRemaining, setSecondsRemaining] = useState(45);
  const inputRefs = useRef<Array<any>>([]);

  // Resend code countdown timer
  useEffect(() => {
    if (secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const handleDigitChange = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const newCode = [...code];

    if (cleanText.length > 0) {
      newCode[index] = cleanText[cleanText.length - 1];
      onChangeCode(newCode);

      // Auto-advance to next input cell
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
      newCode[index] = '';
      onChangeCode(newCode);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendPress = () => {
    if (secondsRemaining === 0) {
      setSecondsRemaining(45);
      onResend?.();
    }
  };

  const formattedTimer = `00:${secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}`;
  const isCodeComplete = code.every((digit) => digit.length === 1);

  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.heading}>6-digit code</Text>
        <Text style={styles.subtitle}>
          Enter the code we sent to the email{' '}
          <Text style={styles.emailHighlight}>{email || 'abc@gmail.com'}</Text>
        </Text>
      </View>

      {/* 6-Digit Code Input Cells: [ ] [ ] [ ] - [ ] [ ] [ ] */}
      <View style={styles.otpRow}>
        {/* First 3 Cells */}
        <View style={styles.cellGroup}>
          {[0, 1, 2].map((idx) => {
            const isFilled = code[idx]?.length > 0;
            return (
              <TextInput
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                style={[styles.otpCell, isFilled && styles.otpCellFilled]}
                keyboardType="number-pad"
                maxLength={1}
                value={code[idx]}
                onChangeText={(text) => handleDigitChange(text, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                selectTextOnFocus
              />
            );
          })}
        </View>

        {/* Middle Hyphen */}
        <Text style={styles.hyphen}>—</Text>

        {/* Last 3 Cells */}
        <View style={styles.cellGroup}>
          {[3, 4, 5].map((idx) => {
            const isFilled = code[idx]?.length > 0;
            return (
              <TextInput
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                style={[styles.otpCell, isFilled && styles.otpCellFilled]}
                keyboardType="number-pad"
                maxLength={1}
                value={code[idx]}
                onChangeText={(text) => handleDigitChange(text, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                selectTextOnFocus
              />
            );
          })}
        </View>
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

      {/* Verify Primary CTA */}
      <HapticPressable
        haptic={isCodeComplete ? 'success' : 'medium'}
        borderRadius={Radii.pill}
        onPress={onVerify}
        style={styles.verifyButton}>
        <Text style={styles.verifyButtonText}>Verify</Text>
      </HapticPressable>

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
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  cellGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  otpCell: {
    width: 44,
    height: 52,
    backgroundColor: SurfaceColors.card,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: SurfaceColors.borderLight,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: SurfaceColors.textPrimary,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  otpCellFilled: {
    borderColor: BrandColors.primary,
    backgroundColor: '#FFFFFF',
  },
  hyphen: {
    fontSize: 18,
    fontWeight: '300',
    color: SurfaceColors.textMuted,
    marginHorizontal: 4,
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
  verifyButton: {
    height: 52,
    backgroundColor: BrandColors.primary,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Shadows.buttonGlow,
  },
  verifyButtonText: {
    color: SurfaceColors.textInverted,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.2,
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
