/**
 * Theme Provider for DeCap SDK
 * 
 * Provides theme context and CSS custom properties injection
 * for consistent theming across all components.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Theme, lightTheme, darkTheme, generateThemeCSS } from './index';

export interface ThemeContextValue {
  theme: Theme;
  themeName: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark' | 'auto';
  useTheme?: () => 'light' | 'dark';
  defaultTheme?: 'light' | 'dark';
}

/**
 * Hook to detect system theme preference
 */
const useSystemTheme = (): 'light' | 'dark' => {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return systemTheme;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme = 'light',
  useTheme,
  defaultTheme = 'light'
}) => {
  const systemTheme = useSystemTheme();
  
  // Determine current theme
  const currentThemeName = useMemo(() => {
    if (theme === 'auto') {
      return useTheme ? useTheme() : systemTheme;
    }
    return theme;
  }, [theme, useTheme, systemTheme]);
  
  const currentTheme = useMemo(() => {
    return currentThemeName === 'dark' ? darkTheme : lightTheme;
  }, [currentThemeName]);
  
  // Inject CSS custom properties and theme data attribute
  useEffect(() => {
    const styleId = 'decap-theme-variables';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    const cssVariables = generateThemeCSS(currentTheme);
    styleElement.textContent = `:root { ${cssVariables} }`;
    
    // Set theme data attribute on document element
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-decap-theme', currentThemeName);
    }
    
    return () => {
      // Cleanup on unmount
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
      if (typeof document !== 'undefined') {
        document.documentElement.removeAttribute('data-decap-theme');
      }
    };
  }, [currentTheme, currentThemeName]);
  
  const contextValue: ThemeContextValue = useMemo(() => ({
    theme: currentTheme,
    themeName: currentThemeName,
    setTheme: () => {}, // Not implemented for controlled themes
    toggleTheme: () => {}, // Not implemented for controlled themes
  }), [currentTheme, currentThemeName]);
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context
 */
export const useDeCapTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useDeCapTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Higher-order component for theme injection
 */
export function withTheme<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P & { theme?: 'light' | 'dark' | 'auto'; useTheme?: () => 'light' | 'dark' }> {
  return function ThemedComponent(props) {
    const { theme, useTheme, ...componentProps } = props as any;
    
    return (
      <ThemeProvider theme={theme} useTheme={useTheme}>
        <Component {...(componentProps as P)} />
      </ThemeProvider>
    );
  };
}

export default ThemeProvider;