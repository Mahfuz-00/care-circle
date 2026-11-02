import '../../../../core/storage/preferences_store.dart';
import '../../domain/entities/accessibility_settings.dart';
import '../../domain/repositories/settings_repository.dart';

class SettingsRepositoryImpl implements SettingsRepository {
  const SettingsRepositoryImpl(this._preferences);

  final PreferencesStore _preferences;

  @override
  AccessibilitySettings read() => AccessibilitySettings(
        textScaleOverride: _preferences.textScaleOverride,
        highContrast: _preferences.highContrast,
        announceActions: _preferences.announceActions,
      );

  @override
  Future<void> write(AccessibilitySettings settings) async {
    await _preferences.setTextScaleOverride(settings.textScaleOverride);
    await _preferences.setHighContrast(settings.highContrast);
    await _preferences.setAnnounceActions(settings.announceActions);
  }
}
