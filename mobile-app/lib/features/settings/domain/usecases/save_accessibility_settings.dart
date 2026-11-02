import '../entities/accessibility_settings.dart';
import '../repositories/settings_repository.dart';

/// Persists the accessibility preferences.
class SaveAccessibilitySettings {
  const SaveAccessibilitySettings(this._repository);

  final SettingsRepository _repository;

  Future<void> call(AccessibilitySettings settings) => _repository.write(settings);
}
