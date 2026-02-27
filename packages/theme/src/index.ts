/**
 * MaternaCare theme configuration.
 */

export const STORAGE_KEY = 'maternacare-theme';

export type ThemeMode = 'light' | 'dark' | 'system';

export const brandPalette = {
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

export const semanticTokens = {
  light: {
    bgPrimary: '#ffffff',
    bgSecondary: '#f8fafc',
    bgTertiary: '#f1f5f9',
    bgCard: '#ffffff',
    bgSidebar: '#ffffff',
    bgInput: '#ffffff',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#94a3b8',
    textInverse: '#ffffff',
    borderPrimary: '#e2e8f0',
    borderSecondary: '#f1f5f9',
  },
  dark: {
    bgPrimary: '#0f172a',
    bgSecondary: '#1e293b',
    bgTertiary: '#334155',
    bgCard: '#1e293b',
    bgSidebar: '#1e293b',
    bgInput: '#334155',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textTertiary: '#64748b',
    textInverse: '#0f172a',
    borderPrimary: '#334155',
    borderSecondary: '#1e293b',
  },
} as const;

export const statusColors = {
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
} as const;

export const riskLevelColors = {
  low: { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
  medium: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
  high: { bg: '#ffedd5', text: '#9a3412', border: '#f97316' },
  very_high: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
} as const;

/**
 * Initialize theme from localStorage or system preference.
 */
export function initializeTheme(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light' || stored === 'system') {
    return stored;
  }
  return 'system';
}

/**
 * Apply theme class to document.
 */
export function applyTheme(mode: ThemeMode): void {
  const isDark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  localStorage.setItem(STORAGE_KEY, mode);
}
