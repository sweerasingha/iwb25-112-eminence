import { StyleSheet } from "react-native";
import { COLORS, FONTS, SPACING, LAYOUT } from "./tokens";

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.xl,
  },
  contentHorizontal: {
    paddingHorizontal: SPACING.xl,
  },
  contentVertical: {
    paddingVertical: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.huge,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...LAYOUT.shadows.sm,
  },
  cardElevated: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...LAYOUT.shadows.md,
  },
  cardPremium: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.borderRadius.xl,
    padding: SPACING.xxl,
    borderWidth: 2,
    borderColor: COLORS.primaryAccent,
    ...LAYOUT.shadows.lg,
  },
  cardGlass: {
    backgroundColor: COLORS.glass,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  displayLarge: {
    fontSize: FONTS.sizes.massive,
    fontWeight: FONTS.weights.black,
    color: COLORS.textPrimary,
    lineHeight: FONTS.sizes.massive * FONTS.lineHeights.tight,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: FONTS.sizes.giant,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    lineHeight: FONTS.sizes.giant * FONTS.lineHeights.tight,
    letterSpacing: -0.3,
  },
  h1: {
    fontSize: FONTS.sizes.huge,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    lineHeight: FONTS.sizes.huge * FONTS.lineHeights.tight,
    letterSpacing: -0.2,
  },
  h2: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    lineHeight: FONTS.sizes.xxxl * FONTS.lineHeights.normal,
  },
  h3: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    lineHeight: FONTS.sizes.xxl * FONTS.lineHeights.normal,
  },
  h4: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    lineHeight: FONTS.sizes.xl * FONTS.lineHeights.normal,
  },
  h5: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    lineHeight: FONTS.sizes.lg * FONTS.lineHeights.normal,
  },
  h6: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    lineHeight: FONTS.sizes.md * FONTS.lineHeights.normal,
  },
  bodyLarge: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.regular,
    color: COLORS.textPrimary,
    lineHeight: FONTS.sizes.lg * FONTS.lineHeights.relaxed,
  },
  body: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.regular,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.md * FONTS.lineHeights.relaxed,
  },
  bodySmall: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.regular,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.sm * FONTS.lineHeights.relaxed,
  },
  caption: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.regular,
    color: COLORS.textTertiary,
    lineHeight: FONTS.sizes.xs * FONTS.lineHeights.normal,
  },
  overline: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    lineHeight: FONTS.sizes.xs * FONTS.lineHeights.normal,
  },

  button: {
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
    borderRadius: LAYOUT.borderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    ...LAYOUT.shadows.sm,
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
    ...LAYOUT.shadows.sm,
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonGhost: {
    backgroundColor: "transparent",
  },
  buttonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    textAlign: "center",
  },
  buttonTextPrimary: {
    color: COLORS.textInverse,
  },
  buttonTextSecondary: {
    color: COLORS.textInverse,
  },
  buttonTextOutline: {
    color: COLORS.primary,
  },
  buttonTextGhost: {
    color: COLORS.primary,
  },

  inputContainer: {
    marginBottom: SPACING.lg,
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: LAYOUT.borderRadius.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    fontSize: FONTS.sizes.lg,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
    minHeight: 56,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    ...LAYOUT.shadows.sm,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputDisabled: {
    backgroundColor: COLORS.backgroundSecondary,
    color: COLORS.textDisabled,
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  labelRequired: {
    color: COLORS.error,
  },
  helperText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textTertiary,
    marginTop: SPACING.sm,
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    marginTop: SPACING.sm,
    fontWeight: FONTS.weights.medium,
  },

  badge: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: LAYOUT.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeSuccess: {
    backgroundColor: COLORS.successBg,
  },
  badgeWarning: {
    backgroundColor: COLORS.warningBg,
  },
  badgeError: {
    backgroundColor: COLORS.errorBg,
  },
  badgeInfo: {
    backgroundColor: COLORS.infoBg,
  },
  badgeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
  },
  badgeTextSuccess: {
    color: COLORS.success,
  },
  badgeTextWarning: {
    color: COLORS.warning,
  },
  badgeTextError: {
    color: COLORS.error,
  },
  badgeTextInfo: {
    color: COLORS.info,
  },

  //  Spacing utilities
  p0: { padding: 0 },
  p1: { padding: SPACING.sm },
  p2: { padding: SPACING.md },
  p3: { padding: SPACING.lg },
  p4: { padding: SPACING.xl },
  p5: { padding: SPACING.xxl },
  p6: { padding: SPACING.xxxl },

  px0: { paddingHorizontal: 0 },
  px1: { paddingHorizontal: SPACING.sm },
  px2: { paddingHorizontal: SPACING.md },
  px3: { paddingHorizontal: SPACING.lg },
  px4: { paddingHorizontal: SPACING.xl },
  px5: { paddingHorizontal: SPACING.xxl },
  px6: { paddingHorizontal: SPACING.xxxl },

  py0: { paddingVertical: 0 },
  py1: { paddingVertical: SPACING.sm },
  py2: { paddingVertical: SPACING.md },
  py3: { paddingVertical: SPACING.lg },
  py4: { paddingVertical: SPACING.xl },
  py5: { paddingVertical: SPACING.xxl },
  py6: { paddingVertical: SPACING.xxxl },

  m0: { margin: 0 },
  m1: { margin: SPACING.sm },
  m2: { margin: SPACING.md },
  m3: { margin: SPACING.lg },
  m4: { margin: SPACING.xl },
  m5: { margin: SPACING.xxl },
  m6: { margin: SPACING.xxxl },

  mx0: { marginHorizontal: 0 },
  mx1: { marginHorizontal: SPACING.sm },
  mx2: { marginHorizontal: SPACING.md },
  mx3: { marginHorizontal: SPACING.lg },
  mx4: { marginHorizontal: SPACING.xl },
  mx5: { marginHorizontal: SPACING.xxl },
  mx6: { marginHorizontal: SPACING.xxxl },

  my0: { marginVertical: 0 },
  my1: { marginVertical: SPACING.sm },
  my2: { marginVertical: SPACING.md },
  my3: { marginVertical: SPACING.lg },
  my4: { marginVertical: SPACING.xl },
  my5: { marginVertical: SPACING.xxl },
  my6: { marginVertical: SPACING.xxxl },

  mb1: { marginBottom: SPACING.sm },
  mb2: { marginBottom: SPACING.md },
  mb3: { marginBottom: SPACING.lg },
  mb4: { marginBottom: SPACING.xl },
  mb5: { marginBottom: SPACING.xxl },
  mb6: { marginBottom: SPACING.xxxl },

  mt1: { marginTop: SPACING.sm },
  mt2: { marginTop: SPACING.md },
  mt3: { marginTop: SPACING.lg },
  mt4: { marginTop: SPACING.xl },
  mt5: { marginTop: SPACING.xxl },
  mt6: { marginTop: SPACING.xxxl },

  //  Flex utilities
  row: { flexDirection: "row" },
  rowReverse: { flexDirection: "row-reverse" },
  column: { flexDirection: "column" },
  columnReverse: { flexDirection: "column-reverse" },
  
  alignStart: { alignItems: "flex-start" },
  alignCenter: { alignItems: "center" },
  alignEnd: { alignItems: "flex-end" },
  alignStretch: { alignItems: "stretch" },
  
  justifyStart: { justifyContent: "flex-start" },
  justifyCenter: { justifyContent: "center" },
  justifyEnd: { justifyContent: "flex-end" },
  justifyBetween: { justifyContent: "space-between" },
  justifyAround: { justifyContent: "space-around" },
  justifyEvenly: { justifyContent: "space-evenly" },
  
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  flex3: { flex: 3 },
  flexNone: { flex: 0 },
  
  wrap: { flexWrap: "wrap" },
  nowrap: { flexWrap: "nowrap" },

  // Position utilities
  absolute: { position: "absolute" },
  relative: { position: "relative" },
  
  // Border utilities
  borderTop: { borderTopWidth: 1, borderTopColor: COLORS.border },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  borderLeft: { borderLeftWidth: 1, borderLeftColor: COLORS.border },
  borderRight: { borderRightWidth: 1, borderRightColor: COLORS.border },
  border: { borderWidth: 1, borderColor: COLORS.border },
  
  // Text alignment
  textLeft: { textAlign: "left" },
  textCenter: { textAlign: "center" },
  textRight: { textAlign: "right" },

  // Opacity utilities
  opacity25: { opacity: 0.25 },
  opacity50: { opacity: 0.5 },
  opacity75: { opacity: 0.75 },
  opaque: { opacity: 1 },

  // Background utilities
  bgPrimary: { backgroundColor: COLORS.primary },
  bgSecondary: { backgroundColor: COLORS.secondary },
  bgSuccess: { backgroundColor: COLORS.success },
  bgWarning: { backgroundColor: COLORS.warning },
  bgError: { backgroundColor: COLORS.error },
  bgInfo: { backgroundColor: COLORS.info },
  bgSurface: { backgroundColor: COLORS.surface },
  bgBackground: { backgroundColor: COLORS.background },
});
