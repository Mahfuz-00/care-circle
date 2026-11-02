/// Session-scoped values the app keeps on the device.
///
/// Kept as an interface so the network layer and repositories can be tested
/// without touching the keychain or shared preferences.
abstract interface class SessionStore {
  /// Sanctum bearer token minted on the `/mobile/v1` surface.
  Future<String?> readToken();

  Future<void> writeToken(String token);

  /// Care circle whose data the app is showing; sent as `X-Care-Circle`.
  Future<String?> readActiveCareCircleId();

  Future<void> writeActiveCareCircleId(String? careCircleId);

  /// Name attached to register/login so caregivers can tell devices apart.
  Future<String?> readDeviceName();

  Future<void> writeDeviceName(String deviceName);

  /// Clears everything belonging to the signed-in person.
  Future<void> clearSession();
}
