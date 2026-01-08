import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0EA5E9',
    secondary: '#06B6D4',
    accent: '#8B5CF6',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    text: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    disabled: '#CBD5E1',
    placeholder: '#94A3B8',
    backdrop: 'rgba(15, 23, 42, 0.5)',
    
    // Gradient colors
    gradientStart: '#0EA5E9',
    gradientEnd: '#06B6D4',
    gradientPurple: '#8B5CF6',
    gradientPink: '#EC4899',
    
    // Device status colors
    statusActive: '#10B981',
    statusOffline: '#EF4444',
    statusMaintenance: '#F59E0B',
    
    // Alert severity colors
    alertInfo: '#3B82F6',
    alertWarning: '#F59E0B',
    alertCritical: '#EF4444',
    
    // Command status colors
    commandPending: '#94A3B8',
    commandSent: '#3B82F6',
    commandAck: '#10B981',
    commandFailed: '#EF4444',
    commandExpired: '#F59E0B',
    
    // Card colors
    cardBackground: '#FFFFFF',
    cardShadow: 'rgba(15, 23, 42, 0.08)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    small: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export type Theme = typeof theme;
