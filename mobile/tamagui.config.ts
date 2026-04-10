import { createTamagui, createTokens, createFont } from 'tamagui';

// ============================================================
// Tamagui Config do FinChat
// Tokens baseados no DESIGN.md
// ============================================================

const k2dFont = createFont({
  family: 'K2D_400Regular',
  size: {
    1: 12,   // body-sm, label-sm
    2: 14,   // body-md, label, button
    3: 16,   // body-lg, button-lg
    4: 18,   // heading-sm
    5: 20,   // heading-md
    6: 24,   // heading-lg
    7: 28,   // heading-xl
  },
  lineHeight: {
    1: 16,
    2: 20,
    3: 22,
    4: 24,
    5: 28,
    6: 32,
    7: 36,
  },
  weight: {
    1: '400', // Regular
    2: '500', // Medium
    3: '600', // SemiBold
    4: '700', // Bold
  },
  letterSpacing: {
    1: 0,
    2: -0.2,
    3: -0.4,
  },
  face: {
    400: { normal: 'K2D_400Regular' },
    500: { normal: 'K2D_500Medium' },
    600: { normal: 'K2D_600SemiBold' },
    700: { normal: 'K2D_700Bold' },
  },
});

const tokens = createTokens({
  color: {
    // Superfície
    background: '#0F110E',
    surface: '#161616',
    surfaceElevated: '#1B1B1B',
    borderSubtle: '#2D2D2D',
    border: '#303030',

    // Acento
    accent: '#57F2BE',
    accentDark: '#001C12',
    accentMuted: '#57F2BE',

    // Texto
    textPrimary: '#FFFFFF',
    textSecondary: '#B2B2B2',
    textTertiary: '#777777',
    textOnAccent: '#001C12',

    // Semânticas
    success: '#8FF48E',
    warning: '#FFA235',
    error: '#E61E32',

    // Categorias
    catAlimentacao: '#FFA235',
    catTransporte: '#4DA6FF',
    catMoradia: '#B07DFF',
    catPets: '#8FF48E',
    catLazer: '#FF6B9D',
    catSaude: '#FF6B6B',
    catEducacao: '#6BC5FF',
    catVestuario: '#FFD93D',
    catOutros: '#888888',

    // Auxiliares
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
  space: {
    0: 0,
    1: 4,   // xxs
    2: 8,   // xs
    3: 12,  // sm
    4: 16,  // md
    5: 20,  // lg
    6: 24,  // xl
    7: 32,  // xxl
    true: 16, // default
  },
  size: {
    0: 0,
    1: 32,  // tab horizontal
    2: 40,  // botão
    3: 42,  // input
    4: 48,  // chat input bar
    5: 56,  // bottom tab bar
    6: 95,  // card de lançamento
    7: 141, // card de categoria
    true: 40, // default
  },
  radius: {
    0: 0,
    1: 4,    // sm
    2: 6,    // md
    3: 8,    // lg
    4: 12,   // xl
    5: 22,   // round
    6: 9999, // full
    true: 6, // default
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
  },
});

const config = createTamagui({
  fonts: {
    heading: k2dFont,
    body: k2dFont,
  },
  tokens,
  themes: {
    dark: {
      background: tokens.color.background,
      backgroundHover: tokens.color.surface,
      backgroundPress: tokens.color.surfaceElevated,
      backgroundFocus: tokens.color.surface,
      color: tokens.color.textPrimary,
      colorHover: tokens.color.textPrimary,
      colorPress: tokens.color.textSecondary,
      borderColor: tokens.color.borderSubtle,
      borderColorHover: tokens.color.border,
      shadowColor: tokens.color.black,
      shadowColorHover: tokens.color.black,
      placeholderColor: tokens.color.textTertiary,
    },
  },
  media: {
    sm: { maxWidth: 400 },
    md: { maxWidth: 768 },
    lg: { maxWidth: 1024 },
    short: { maxHeight: 700 },
  },
  shorthands: {
    px: 'paddingHorizontal',
    py: 'paddingVertical',
    mx: 'marginHorizontal',
    my: 'marginVertical',
    f: 'flex',
    w: 'width',
    h: 'height',
    bg: 'backgroundColor',
    br: 'borderRadius',
  } as const,
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
