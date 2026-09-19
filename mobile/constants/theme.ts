import { Platform, type ViewStyle } from 'react-native';

export const AppColors = {
  primary: '#F4B400', primaryPressed: '#D99F00', primarySoft: '#FFF2BF',
  accent: '#F28C28', accentSoft: '#FFF0DC', background: '#FFFDF9', surface: '#FFFFFF',
  section: '#FFF8EF', text: '#2F241C', textSecondary: '#7B6A5D', border: '#F1DFC7',
  success: '#2E8B64', successSoft: '#EAF7F0', danger: '#D95645', dangerSoft: '#FFF0ED',
  info: '#45689B', infoSoft: '#EEF3FA', warning: '#855C00', warningSoft: '#FFF2BF',
  dangerText: '#B53D31', accentText: '#A6530C', disabled: '#CFC5B9', overlay: 'rgba(47,36,28,0.48)',
} as const;

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40 } as const;
export const Radius = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 } as const;
export const FontFamily = { body: 'Inter_400Regular', bodyMedium: 'Inter_500Medium', bodySemiBold: 'Inter_600SemiBold', heading: 'Manrope_600SemiBold', headingBold: 'Manrope_700Bold' } as const;

export const TypeScale = {
  display: { fontFamily: FontFamily.headingBold, fontSize: 32, lineHeight: 39 },
  h1: { fontFamily: FontFamily.headingBold, fontSize: 28, lineHeight: 35 },
  h2: { fontFamily: FontFamily.headingBold, fontSize: 22, lineHeight: 29 },
  h3: { fontFamily: FontFamily.heading, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: FontFamily.body, fontSize: 14, lineHeight: 21 },
  bodyMedium: { fontFamily: FontFamily.bodyMedium, fontSize: 14, lineHeight: 21 },
  label: { fontFamily: FontFamily.bodySemiBold, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: FontFamily.body, fontSize: 12, lineHeight: 17 },
} as const;

export const TouchTarget = 48;
export const Motion = { fast: 150, normal: 240 } as const;
export const AmberGradient = [AppColors.primarySoft, '#FFD373', AppColors.accent] as const;

export const WarmShadow: ViewStyle = Platform.select({
  web: { boxShadow: '0 10px 28px rgba(106, 73, 37, 0.10)' } as ViewStyle,
  default: { shadowColor: '#6A4925', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 3 },
});

export const Colors = {
  light: { text: AppColors.text, background: AppColors.background, tint: AppColors.accent, icon: AppColors.textSecondary, tabIconDefault: '#A39282', tabIconSelected: AppColors.accent },
  dark: { text: AppColors.text, background: AppColors.background, tint: AppColors.accent, icon: AppColors.textSecondary, tabIconDefault: '#A39282', tabIconSelected: AppColors.accent },
};

export const Fonts = Platform.select({
  ios: { sans: FontFamily.body, serif: 'ui-serif', rounded: FontFamily.heading, mono: 'ui-monospace' },
  default: { sans: FontFamily.body, serif: 'serif', rounded: FontFamily.heading, mono: 'monospace' },
  web: { sans: `${FontFamily.body}, Inter, system-ui, sans-serif`, serif: "Georgia, 'Times New Roman', serif", rounded: `${FontFamily.heading}, Manrope, system-ui, sans-serif`, mono: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
});
