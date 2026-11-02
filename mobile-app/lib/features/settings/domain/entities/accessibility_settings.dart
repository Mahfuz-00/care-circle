import 'package:equatable/equatable.dart';

const Object _unset = Object();

/// Accessibility preferences (PRD §9).
class AccessibilitySettings extends Equatable {
  const AccessibilitySettings({
    this.textScaleOverride,
    this.highContrast = false,
    this.announceActions = true,
  });

  /// `null` means "follow the operating system text size".
  final double? textScaleOverride;

  /// Extra contrast for the Warm Sage palette.
  final bool highContrast;

  /// Speak short confirmations through the screen reader where supported.
  final bool announceActions;

  bool get followsDeviceTextScale => textScaleOverride == null;

  AccessibilitySettings copyWith({
    Object? textScaleOverride = _unset,
    bool? highContrast,
    bool? announceActions,
  }) =>
      AccessibilitySettings(
        textScaleOverride: identical(textScaleOverride, _unset)
            ? this.textScaleOverride
            : textScaleOverride as double?,
        highContrast: highContrast ?? this.highContrast,
        announceActions: announceActions ?? this.announceActions,
      );

  @override
  List<Object?> get props =>
      <Object?>[textScaleOverride, highContrast, announceActions];
}
