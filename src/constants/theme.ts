/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    card: '#ffffff',
    cardBorder: '#E0E0E0',
    textMuted: '#828282',
    accent: '#6750A4',
    accentTrack: '#E8DEF8',
    available: '#DEF7E5',
    availableText: '#17733B',
    inUse: '#D9D0EC',
    inUseBorder: '#4D318B',
    inUseText: '#4D318B',
    broken: '#FEE8E8',
    brokenText: '#991C1C',
    pickup: '#FFF2C7',
    pickupText: '#8C6105',
    bannerGreen: '#DFFFD8',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    card: '#1A1B1D',
    cardBorder: '#33353A',
    textMuted: '#9A9EA6',
    accent: '#B69DF8',
    accentTrack: '#3A3352',
    available: '#123821',
    availableText: '#5FD98A',
    inUse: '#2E2650',
    inUseBorder: '#B69DF8',
    inUseText: '#D5C6FB',
    broken: '#3A1414',
    brokenText: '#F29B9B',
    pickup: '#3A3014',
    pickupText: '#F2CF6E',
    bannerGreen: '#173A22',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
/** The web tab bar renders as a floating pill pinned to the top of the screen. */
export const WebTopTabBarInset = Platform.select({ web: 64, default: 0 });
