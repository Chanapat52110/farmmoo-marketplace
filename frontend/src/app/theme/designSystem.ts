/**
 * FarmMoo Design System
 * Unified colors, spacing, typography, and shadows
 */

// Colors
export const colors = {
  primary: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A360E',
    900: '#7C2D12',
  },
  stone: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
  },
  green: {
    50: '#F0FDF4',
    500: '#16A34A',
    600: '#15803D',
  },
  red: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
  },
  yellow: {
    50: '#FFFBEB',
    500: '#EAB308',
    600: '#CA8A04',
  },
};

// Spacing (4px base unit)
export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
};

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
  '3xl': '3rem',
  full: '9999px',
};

// Shadows
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

// Typography
export const typography = {
  display: {
    fontSize: 32,
    fontWeight: 800,
    lineHeight: 1.2,
  },
  h1: {
    fontSize: 28,
    fontWeight: 800,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.3,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.4,
  },
  body: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.5,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 1.5,
  },
  caption: {
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.4,
  },
  captionSmall: {
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1.3,
  },
};

// Transitions
export const transitions = {
  fast: 'all 0.15s ease-in-out',
  normal: 'all 0.3s ease-in-out',
  slow: 'all 0.5s ease-in-out',
};

// Z-index
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  notification: 50,
  tooltip: 60,
};
