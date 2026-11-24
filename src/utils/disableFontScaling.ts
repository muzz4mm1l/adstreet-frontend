import * as ReactNative from 'react-native';
import React from 'react';

// Capture the genuine original Text and TextInput primitives
const OriginalText = ReactNative.Text;
const OriginalTextInput = ReactNative.TextInput;

/**
 * Patched Text Component
 * Strictly enforces allowFontScaling: false and maxFontSizeMultiplier: 1
 * to ignore phone system font size settings while preserving the app's exact designed font size.
 */
export const FixedText = React.forwardRef<any, ReactNative.TextProps>((props, ref) => {
  return React.createElement(OriginalText, {
    allowFontScaling: false,
    maxFontSizeMultiplier: 1,
    ...props,
    ref,
  });
});

/**
 * Patched TextInput Component
 * Strictly enforces allowFontScaling: false and maxFontSizeMultiplier: 1
 * to ignore phone system font size settings while preserving the app's exact designed font size.
 */
export const FixedTextInput = React.forwardRef<any, ReactNative.TextInputProps>((props, ref) => {
  return React.createElement(OriginalTextInput, {
    allowFontScaling: false,
    maxFontSizeMultiplier: 1,
    ...props,
    ref,
  });
});

// Set defaultProps for components/engines that inspect them
try {
  const origTextAny = OriginalText as any;
  if (origTextAny.defaultProps == null) {
    origTextAny.defaultProps = {};
  }
  origTextAny.defaultProps.allowFontScaling = false;
  origTextAny.defaultProps.maxFontSizeMultiplier = 1;

  const origInputAny = OriginalTextInput as any;
  if (origInputAny.defaultProps == null) {
    origInputAny.defaultProps = {};
  }
  origInputAny.defaultProps.allowFontScaling = false;
  origInputAny.defaultProps.maxFontSizeMultiplier = 1;
} catch {}

// Override the react-native exports via property descriptor
try {
  Object.defineProperty(ReactNative, 'Text', {
    get() {
      return FixedText;
    },
    configurable: true,
    enumerable: true,
  });

  Object.defineProperty(ReactNative, 'TextInput', {
    get() {
      return FixedTextInput;
    },
    configurable: true,
    enumerable: true,
  });
} catch {}
