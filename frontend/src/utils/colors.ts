/**
 * MaternaCare brand color palette.
 */
export const brandColors = {
  50: '#FDF2F8',
  100: '#FCE7F3',
  200: '#FBCFE8',
  300: '#F9A8D4',
  400: '#F472B6',
  500: '#EC4899',
  600: '#DB2777',
  700: '#BE185D',
  800: '#9D174D',
  900: '#831843',
  950: '#500724',
} as const;

export type BrandColorShade = keyof typeof brandColors;

/**
 * Risk level colors for consistent UI representation.
 */
export const riskColors = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  very_high: '#ef4444',
} as const;

/**
 * Alert severity colors.
 */
export const severityColors = {
  info: '#3b82f6',
  warning: '#f59e0b',
  critical: '#ef4444',
} as const;
