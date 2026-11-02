import 'package:shared_preferences/shared_preferences.dart';

/// Local, non-sensitive preferences (accessibility choices, device name).
class PreferencesStore {
  PreferencesStore(this._preferences);

  static const String textScaleKey = 'accessibility.text_scale';
  static const String highContrastKey = 'accessibility.high_contrast';
  static const String announceActionsKey = 'accessibility.announce_actions';
  static const String deviceNameKey = 'device.name';

  final SharedPreferences _preferences;

  /// `null` means "follow the operating system" (PRD §9).
  double? get textScaleOverride => _preferences.getDouble(textScaleKey);

  Future<void> setTextScaleOverride(double? scale) async {
    if (scale == null) {
      await _preferences.remove(textScaleKey);
      return;
    }
    await _preferences.setDouble(textScaleKey, scale);
  }

  bool get highContrast => _preferences.getBool(highContrastKey) ?? false;

  Future<void> setHighContrast(bool value) =>
      _preferences.setBool(highContrastKey, value);

  bool get announceActions => _preferences.getBool(announceActionsKey) ?? true;

  Future<void> setAnnounceActions(bool value) =>
      _preferences.setBool(announceActionsKey, value);

  String get deviceName =>
      _preferences.getString(deviceNameKey) ?? 'CareCircle Mobile';

  Future<void> setDeviceName(String value) =>
      _preferences.setString(deviceNameKey, value);
}
