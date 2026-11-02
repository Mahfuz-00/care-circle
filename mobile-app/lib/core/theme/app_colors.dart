import 'package:flutter/material.dart';

/// Warm Sage palette (PRD §12): calm cream background, deep sage primary,
/// forest teal accent. Contrast ratios are chosen so 18pt+ text clears WCAG AA
/// on the cream background, and the `HighContrast` set clears AAA.
abstract final class AppColors {
  // Calm cream background.
  static const Color cream = Color(0xFFF6F2E7);
  static const Color creamSurface = Color(0xFFFFFDF7);
  static const Color creamSunken = Color(0xFFEDE7D8);

  // Deep sage primary.
  static const Color deepSage = Color(0xFF3C5745);
  static const Color deepSageStrong = Color(0xFF2A4032);
  static const Color sage = Color(0xFF5F7D68);
  static const Color sageTint = Color(0xFFDCE6DB);

  // Forest teal accent.
  static const Color forestTeal = Color(0xFF13574E);
  static const Color forestTealStrong = Color(0xFF0A3A34);
  static const Color tealTint = Color(0xFFD3E5E1);

  // Warm ink.
  static const Color ink = Color(0xFF22271E);
  static const Color inkHighContrast = Color(0xFF0C0F0A);
  static const Color inkMuted = Color(0xFF4E5748);
  static const Color inkMutedHighContrast = Color(0xFF2B3226);

  // Emergency / alert.
  static const Color alert = Color(0xFF9A2A22);
  static const Color alertStrong = Color(0xFF6F1B15);
  static const Color warning = Color(0xFF7A4E0E);

  // Neutrals.
  static const Color white = Color(0xFFFFFFFF);
  static const Color border = Color(0xFFBFC7B9);
  static const Color borderStrong = Color(0xFF3F4A3A);
  static const Color disabled = Color(0xFF7C857A);
}
