import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'session_store.dart';

/// Real implementation: the token lives in the platform keychain/keystore,
/// everything else in shared preferences.
class SecureSessionStore implements SessionStore {
  SecureSessionStore({
    required SharedPreferences preferences,
    FlutterSecureStorage secureStorage = const FlutterSecureStorage(),
  })  : _preferences = preferences,
        _secureStorage = secureStorage;

  static const String _tokenKey = 'carecircle.mobile.token';
  static const String _careCircleKey = 'carecircle.mobile.active_care_circle';
  static const String _deviceNameKey = 'carecircle.mobile.device_name';

  final SharedPreferences _preferences;
  final FlutterSecureStorage _secureStorage;

  @override
  Future<String?> readToken() => _secureStorage.read(key: _tokenKey);

  @override
  Future<void> writeToken(String token) =>
      _secureStorage.write(key: _tokenKey, value: token);

  @override
  Future<String?> readActiveCareCircleId() async =>
      _preferences.getString(_careCircleKey);

  @override
  Future<void> writeActiveCareCircleId(String? careCircleId) async {
    if (careCircleId == null || careCircleId.isEmpty) {
      await _preferences.remove(_careCircleKey);
      return;
    }
    await _preferences.setString(_careCircleKey, careCircleId);
  }

  @override
  Future<String?> readDeviceName() async =>
      _preferences.getString(_deviceNameKey);

  @override
  Future<void> writeDeviceName(String deviceName) =>
      _preferences.setString(_deviceNameKey, deviceName);

  @override
  Future<void> clearSession() async {
    await _secureStorage.delete(key: _tokenKey);
    await _preferences.remove(_careCircleKey);
  }
}
