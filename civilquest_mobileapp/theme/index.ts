export * from "./tokens";
export * from "./styles";

import { COLORS, FONTS, SPACING, LAYOUT } from "./tokens";

export const theme = {
  colors: COLORS,
  fonts: FONTS,
  spacing: SPACING,
  layout: LAYOUT,
} as const;

export type Theme = typeof theme;
