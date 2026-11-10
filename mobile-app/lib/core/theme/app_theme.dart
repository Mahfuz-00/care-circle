import 'package:flutter/material.dart';

import 'app_colors.dart';
import 'app_sizes.dart';

/// Warm Sage theme (PRD §12) tuned for seniors (PRD §9):
///
/// * calm cream background, deep sage primary, forest teal accent;
/// * large default type (body 20sp) that still scales with the OS;
/// * every control at least [AppSizes.minTouchTarget] tall;
/// * a high-contrast variant that reaches AAA on the cream surface.
abstract final class AppTheme {
  /// Colour scheme for the given contrast mode.
  static ColorScheme scheme({bool highContrast = false}) {
    final Color primary = highContrast ? AppColors.deepSageStrong : AppColors.deepSage;
    final Color accent = highContrast ? AppColors.forestTealStrong : AppColors.forestTeal;
    final Color surface = highContrast ? AppColors.white : AppColors.cream;
    final Color ink = highContrast ? AppColors.inkHighContrast : AppColors.ink;

    return ColorScheme.light(
      primary: primary,
      onPrimary: AppColors.white,
      primaryContainer: highContrast ? AppColors.sage : AppColors.sageTint,
      onPrimaryContainer: highContrast ? AppColors.white : AppColors.ink,
      secondary: accent,
      onSecondary: AppColors.white,
      secondaryContainer: highContrast ? AppColors.forestTeal : AppColors.tealTint,
      onSecondaryContainer: highContrast ? AppColors.white : AppColors.ink,
      tertiary: AppColors.sage,
      onTertiary: AppColors.white,
      error: highContrast ? AppColors.alertStrong : AppColors.alert,
      onError: AppColors.white,
      surface: surface,
      onSurface: ink,
      surfaceContainerHighest: AppColors.creamSunken,
      onSurfaceVariant: highContrast ? AppColors.inkMutedHighContrast : AppColors.inkMuted,
      outline: highContrast ? AppColors.borderStrong : AppColors.border,
      outlineVariant: highContrast ? AppColors.borderStrong : AppColors.border,
      shadow: AppColors.ink,
      scrim: AppColors.ink,
      inverseSurface: ink,
      onInverseSurface: AppColors.white,
      inversePrimary: AppColors.sageTint,
    );
  }

  /// Large, generous type ramp. Sizes scale with the OS text scale factor on
  /// top of these defaults (PRD §9).
  static TextTheme textTheme({bool highContrast = false}) {
    final Color ink = highContrast ? AppColors.inkHighContrast : AppColors.ink;
    return const TextTheme(
      displayMedium: TextStyle(fontSize: 40, fontWeight: FontWeight.w700, height: 1.2),
      displaySmall: TextStyle(fontSize: 36, fontWeight: FontWeight.w700, height: 1.2),
      headlineLarge: TextStyle(fontSize: 34, fontWeight: FontWeight.w700, height: 1.25),
      headlineMedium: TextStyle(fontSize: 32, fontWeight: FontWeight.w700, height: 1.25),
      headlineSmall: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, height: 1.3),
      titleLarge: TextStyle(fontSize: 26, fontWeight: FontWeight.w700, height: 1.3),
      titleMedium: TextStyle(fontSize: 22, fontWeight: FontWeight.w600, height: 1.3),
      titleSmall: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, height: 1.35),
      bodyLarge: TextStyle(fontSize: 20, height: 1.4),
      bodyMedium: TextStyle(fontSize: 18, height: 1.4),
      bodySmall: TextStyle(fontSize: 16, height: 1.4),
      labelLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, height: 1.3),
      labelMedium: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, height: 1.3),
      labelSmall: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, height: 1.3),
    ).apply(bodyColor: ink, displayColor: ink);
  }

  /// Full theme.
  static ThemeData light({bool highContrast = false}) {
    final ColorScheme colors = scheme(highContrast: highContrast);
    final TextTheme text = textTheme(highContrast: highContrast);
    final BorderSide borderSide = BorderSide(
      color: highContrast ? AppColors.borderStrong : AppColors.border,
      width: highContrast ? 2 : 1.5,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: colors,
      textTheme: text,
      scaffoldBackgroundColor: colors.surface,
      canvasColor: colors.surface,
      // Keeps every tappable at >= 48dp without per-widget padding.
      materialTapTargetSize: MaterialTapTargetSize.padded,
      visualDensity: VisualDensity.standard,
      iconTheme: const IconThemeData(size: AppSizes.iconSize),
      appBarTheme: AppBarTheme(
        backgroundColor: colors.surface,
        foregroundColor: colors.onSurface,
        surfaceTintColor: colors.surface,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        toolbarHeight: 72,
        titleTextStyle: text.titleLarge,
        iconTheme: const IconThemeData(size: AppSizes.iconSize),
      ),
      cardTheme: CardThemeData(
        color: highContrast ? AppColors.white : AppColors.creamSurface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSizes.radius),
          side: borderSide,
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(AppSizes.minTouchTarget, AppSizes.secondaryButtonHeight),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: text.labelLarge,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          tapTargetSize: MaterialTapTargetSize.padded,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(AppSizes.minTouchTarget, AppSizes.secondaryButtonHeight),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: text.labelLarge,
          side: BorderSide(color: colors.primary, width: 2),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          tapTargetSize: MaterialTapTargetSize.padded,
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          minimumSize: const Size(AppSizes.minTouchTarget, AppSizes.secondaryButtonHeight),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          textStyle: text.labelLarge,
          foregroundColor: colors.secondary,
          tapTargetSize: MaterialTapTargetSize.padded,
        ),
      ),
      iconButtonTheme: IconButtonThemeData(
        style: IconButton.styleFrom(
          minimumSize: const Size(AppSizes.minTouchTarget, AppSizes.minTouchTarget),
          iconSize: AppSizes.iconSize,
        ),
      ),
      inputDecorationTheme: InputDecorationThemeData(
        filled: true,
        fillColor: highContrast ? AppColors.white : AppColors.creamSurface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: borderSide),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: borderSide),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: colors.secondary, width: 3),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: colors.error, width: 2),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: colors.error, width: 3),
        ),
        labelStyle: text.titleSmall?.copyWith(color: colors.onSurfaceVariant),
        floatingLabelStyle: text.titleSmall?.copyWith(color: colors.secondary),
        hintStyle: text.bodyLarge?.copyWith(color: colors.onSurfaceVariant),
        errorStyle: text.bodyMedium?.copyWith(color: colors.error),
        helperStyle: text.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
        helperMaxLines: 3,
        errorMaxLines: 3,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: highContrast ? AppColors.creamSunken : AppColors.sageTint,
        labelStyle: text.labelMedium,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        side: borderSide,
      ),
      listTileTheme: ListTileThemeData(
        minVerticalPadding: 14,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        titleTextStyle: text.titleMedium,
        subtitleTextStyle: text.bodyMedium,
        iconColor: colors.onSurface,
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: highContrast ? AppColors.white : AppColors.creamSurface,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: text.titleLarge,
        contentTextStyle: text.bodyLarge,
        insetPadding: const EdgeInsets.symmetric(horizontal: AppSizes.screenPadding, vertical: 24),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: highContrast ? AppColors.inkHighContrast : AppColors.deepSageStrong,
        contentTextStyle: text.bodyLarge?.copyWith(color: AppColors.white),
        actionTextColor: AppColors.tealTint,
        behavior: SnackBarBehavior.floating,
        insetPadding: const EdgeInsets.all(AppSizes.screenPadding),
      ),
      radioTheme: RadioThemeData(
        materialTapTargetSize: MaterialTapTargetSize.padded,
        visualDensity: VisualDensity.standard,
      ),
      checkboxTheme: CheckboxThemeData(
        materialTapTargetSize: MaterialTapTargetSize.padded,
        side: borderSide,
      ),
      switchTheme: SwitchThemeData(
        materialTapTargetSize: MaterialTapTargetSize.padded,
        thumbColor: WidgetStateProperty.resolveWith((Set<WidgetState> states) {
          if (states.contains(WidgetState.disabled)) return AppColors.disabled;
          return states.contains(WidgetState.selected) ? AppColors.white : AppColors.creamSurface;
        }),
        trackColor: WidgetStateProperty.resolveWith((Set<WidgetState> states) {
          if (states.contains(WidgetState.disabled)) return AppColors.creamSunken;
          return states.contains(WidgetState.selected) ? colors.primary : AppColors.border;
        }),
      ),
      dividerTheme: DividerThemeData(color: borderSide.color, thickness: borderSide.width, space: 1),
      progressIndicatorTheme: ProgressIndicatorThemeData(color: colors.primary),
      tooltipTheme: TooltipThemeData(
        textStyle: text.bodyMedium?.copyWith(color: AppColors.white),
        decoration: BoxDecoration(
          color: AppColors.ink,
          borderRadius: BorderRadius.circular(10),
        ),
      ),
      // A field shape reused by inline surfaces (e.g. the medication name).
      extensions: const <ThemeExtension<dynamic>>[],
    );
  }

  /// Shared shape for input outlines, used by inline widgets.
  static ShapeBorder get fieldShape => RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: AppColors.border),
      );

  /// Tabular (fixed-width) figures for quantities, times and day counts.
  ///
  /// A number whose glyphs change width shifts the text around it every time the
  /// value changes — noticeable while a timer or a count updates. Prose keeps
  /// proportional figures; only numeric values take this.
  static TextStyle? tabular(TextStyle? style) => style?.copyWith(
        fontFeatures: const <FontFeature>[FontFeature.tabularFigures()],
      );
}
