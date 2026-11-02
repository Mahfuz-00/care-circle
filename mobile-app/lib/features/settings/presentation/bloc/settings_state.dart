import 'package:equatable/equatable.dart';

import '../../domain/entities/accessibility_settings.dart';

class SettingsState extends Equatable {
  const SettingsState({
    this.settings = const AccessibilitySettings(),
    this.loaded = false,
  });

  final AccessibilitySettings settings;

  /// Whether the stored preferences have been read.
  final bool loaded;

  double? get textScaleOverride => settings.textScaleOverride;

  bool get highContrast => settings.highContrast;

  bool get announceActions => settings.announceActions;

  SettingsState copyWith({
    AccessibilitySettings? settings,
    bool? loaded,
  }) =>
      SettingsState(
        settings: settings ?? this.settings,
        loaded: loaded ?? this.loaded,
      );

  @override
  List<Object?> get props => <Object?>[settings, loaded];
}
