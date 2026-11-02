import 'package:equatable/equatable.dart';

/// Events for accessibility preferences.
sealed class SettingsEvent extends Equatable {
  const SettingsEvent();

  @override
  List<Object?> get props => const <Object?>[];
}

/// Load the stored preferences (dispatched at start-up).
final class SettingsRequested extends SettingsEvent {
  const SettingsRequested();
}

/// `null` follows the operating system text size.
final class SettingsTextScaleChanged extends SettingsEvent {
  const SettingsTextScaleChanged(this.textScale);

  final double? textScale;

  @override
  List<Object?> get props => <Object?>[textScale];
}

final class SettingsHighContrastToggled extends SettingsEvent {
  const SettingsHighContrastToggled(this.enabled);

  final bool enabled;

  @override
  List<Object?> get props => <Object?>[enabled];
}

final class SettingsAnnounceActionsToggled extends SettingsEvent {
  const SettingsAnnounceActionsToggled(this.enabled);

  final bool enabled;

  @override
  List<Object?> get props => <Object?>[enabled];
}
