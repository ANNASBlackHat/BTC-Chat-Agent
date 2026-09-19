import { Platform } from 'react-native';

/** Dark "trading terminal" theme mirroring the web app's dark palette. */
export const colors = {
  bg: '#09090b',
  card: '#101013',
  cardBorder: '#232328',
  text: '#fafafa',
  textMuted: '#a1a1aa',
  accent: '#10b981',
  accentDim: 'rgba(16, 185, 129, 0.15)',
  danger: '#f43f5e',
  up: '#22c55e',
  down: '#ef4444',
};

export const isIOS = Platform.OS === 'ios';
