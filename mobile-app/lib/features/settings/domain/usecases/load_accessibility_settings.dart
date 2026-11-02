import '../entities/accessibility_settings.dart';
import '../repositories/settings_repository.dart';

/// Reads the stored accessibility preferences.
class LoadAccessibilitySettings {
  const LoadAccessibilitySettings(this._repository);

  final SettingsRepository _repository;

  AccessibilitySettings call() => _repository.read();
}
