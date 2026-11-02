/// Compile-time configuration for the CareCircle mobile surface.
///
/// PRD §3 / AGENTS.md rule 1: the mobile app talks **only** to `/mobile/v1`
/// with a `mobile`-ability token. `/api/v1` and the landlord console
/// (`/api/v1/platform/*`) are deliberately absent from this surface — they are
/// blocked on the device by [MobileSurfaceGuardInterceptor], which refuses any
/// request outside [mobileApiPrefix] or matching [forbiddenPathPrefixes].
class AppConfig {
  const AppConfig._();

  /// Product name used in the app bar and copy.
  static const String appName = 'CareCircle';

  /// Base host of the API. Override with
  /// `--dart-define=API_BASE_URL=https://api.example.com`.
  ///
  /// Defaults to `http://10.0.2.2:8000` (the Android emulator's alias for the
  /// developer machine).
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8000',
  );

  /// The only API prefix this app is allowed to reach (PRD §3).
  static const String mobileApiPrefix = '/mobile/v1';

  /// Fully qualified base URL of the mobile surface.
  static const String mobileApiBaseUrl = '$apiBaseUrl$mobileApiPrefix';

  /// Prefixes that must never be called from mobile. `/api/v1` is the
  /// dashboard surface, `/platform` is the landlord console.
  static const List<String> forbiddenPathPrefixes = <String>['/api/v1', '/platform'];

  /// Header carrying the Sanctum bearer token.
  static const String authorizationHeader = 'Authorization';

  /// Header naming the active care circle (PRD §9 fail-closed context).
  static const String careCircleHeader = 'X-Care-Circle';

  /// Header advertising the client surface to the API.
  static const String clientSurfaceHeader = 'X-Care-Circle-Surface';
  static const String clientSurfaceValue = 'mobile';

  static const String bearerPrefix = 'Bearer ';

  /// Number dialled by the "Call for help" action. Override per country with
  /// `--dart-define=EMERGENCY_CALL_NUMBER=911`.
  static const String emergencyCallNumber = String.fromEnvironment(
    'EMERGENCY_CALL_NUMBER',
    defaultValue: '112',
  );

  /// Registration role used when the API needs a default.
  static const String defaultRole = 'self';

  /// Human readable device name attached to register/login payloads.
  static const String defaultDeviceName = String.fromEnvironment(
    'DEVICE_NAME',
    defaultValue: 'CareCircle Mobile',
  );

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 20);
  static const Duration sendTimeout = Duration(seconds: 20);

  /// Snooze options offered on the dose card (minutes).
  static const List<int> snoozeMinutesOptions = <int>[10, 30, 60];
}
