// Theme system - placeholder for now

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    error: string;
    warning: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

export const lightTheme: Theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '6px',
    md: '12px',
    lg: '16px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
};

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
  },
};

/**
 * Get theme based on preference and system detection
 */
export function getTheme(
  preference: 'light' | 'dark' | 'auto',
  useTheme?: () => 'light' | 'dark'
): Theme {
  if (preference === 'auto' && useTheme) {
    return useTheme() === 'dark' ? darkTheme : lightTheme;
  }
  return preference === 'dark' ? darkTheme : lightTheme;
}

/**
 * Generate CSS custom properties from theme
 */
export function generateThemeCSS(theme: Theme): string {
  return `
    --decap-color-primary: ${theme.colors.primary};
    --decap-color-secondary: ${theme.colors.secondary};
    --decap-color-background: ${theme.colors.background};
    --decap-color-surface: ${theme.colors.surface};
    --decap-color-text: ${theme.colors.text};
    --decap-color-text-secondary: ${theme.colors.textSecondary};
    --decap-color-success: ${theme.colors.success};
    --decap-color-error: ${theme.colors.error};
    --decap-color-warning: ${theme.colors.warning};
    --decap-spacing-xs: ${theme.spacing.xs};
    --decap-spacing-sm: ${theme.spacing.sm};
    --decap-spacing-md: ${theme.spacing.md};
    --decap-spacing-lg: ${theme.spacing.lg};
    --decap-spacing-xl: ${theme.spacing.xl};
    --decap-border-radius-sm: ${theme.borderRadius.sm};
    --decap-border-radius-md: ${theme.borderRadius.md};
    --decap-border-radius-lg: ${theme.borderRadius.lg};
    --decap-shadow-sm: ${theme.shadows.sm};
    --decap-shadow-md: ${theme.shadows.md};
    --decap-shadow-lg: ${theme.shadows.lg};
  `;
}