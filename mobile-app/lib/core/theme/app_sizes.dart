/// Senior-first sizing rules (PRD §9, AGENTS.md mobile conventions).
abstract final class AppSizes {
  /// Absolute minimum tap target for any control.
  static const double minTouchTarget = 48;

  /// The emergency button is never smaller than this, on any screen.
  static const double emergencyButtonHeight = 96;

  /// Large primary action (dose actions, sign in, ...).
  static const double primaryButtonHeight = 64;

  /// Secondary action.
  static const double secondaryButtonHeight = 56;

  static const double screenPadding = 20;
  static const double gap = 12;
  static const double gapLarge = 20;

  /// Icon size that pairs with the large text scale.
  static const double iconSize = 28;

  /// Corner radius used across cards, buttons and fields.
  static const double radius = 18;

  static const Duration standardAnimation = Duration(milliseconds: 180);

  /// Longest text scale we render fully; beyond this the layout stays intact
  /// because every list wraps instead of truncating.
  static const double maxSupportedTextScale = 3;
}
