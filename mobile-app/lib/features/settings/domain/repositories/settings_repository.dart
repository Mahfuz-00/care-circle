import '../entities/accessibility_settings.dart';

/// Stores the accessibility choices on the device.
abstract interface class SettingsRepository {
  AccessibilitySettings read();

  Future<void> write(AccessibilitySettings settings);
}
