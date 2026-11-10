import 'package:flutter/material.dart';

/// CareCircle design tokens (aligned with frontend/src/index.css):
/// Canvas: crisp light slate pearl (#f8fafc)
/// Cards: pure white (#ffffff) with subtle border (#e2e8f0)
/// Primary: light navy blue (#1d4e89 / #2563a8 / #102a4d)
/// Accent: luminous sky / cyan (#0284c7 / #0369a1)
/// Ink: slate typography (#0f172a / #334155 / #64748b)
/// Status: danger (#dc2626), warning (#d97706), ok (#16a34a)
abstract final class AppColors {
  // Canvas & surface — crisp light slate pearl.
  static const Color cream = Color(0xFFF8FAFC);
  static const Color creamSurface = Color(0xFFFFFFFF);
  static const Color creamSunken = Color(0xFFF1F5F9);

  // Primary — light navy blue.
  static const Color deepSage = Color(0xFF1D4E89);
  static const Color deepSageStrong = Color(0xFF102A4D);
  static const Color sage = Color(0xFF2563A8);
  static const Color sageTint = Color(0xFFE0ECF6);

  // Accent — luminous sky / cyan.
  static const Color forestTeal = Color(0xFF0284C7);
  static const Color forestTealStrong = Color(0xFF0369A1);
  static const Color tealTint = Color(0xFFE0F2FE);

  // Ink — deep slate typography.
  static const Color ink = Color(0xFF0F172A);
  static const Color inkHighContrast = Color(0xFF020617);
  static const Color inkMuted = Color(0xFF64748B);
  static const Color inkMutedHighContrast = Color(0xFF334155);

  // Emergency / alert.
  static const Color alert = Color(0xFFDC2626);
  static const Color alertStrong = Color(0xFF991B1B);
  static const Color alertTint = Color(0xFFFEE2E2);

  // Warning & success.
  static const Color warning = Color(0xFFD97706);
  static const Color warningTint = Color(0xFFFEF3C7);
  static const Color ok = Color(0xFF16A34A);
  static const Color okTint = Color(0xFFDCFCE7);

  // Neutrals & borders.
  static const Color white = Color(0xFFFFFFFF);
  static const Color border = Color(0xFFE2E8F0);
  static const Color borderStrong = Color(0xFFCBD5E1);
  static const Color disabled = Color(0xFF94A3B8);
}
