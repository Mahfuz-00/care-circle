/// Exceptions thrown by the data layer. They never escape into the domain or
/// presentation layers: repositories convert them to [Result] / `Failure`.
library;

/// The API answered with an error status or an unexpected envelope.
class ApiException implements Exception {
  const ApiException(
    this.message, {
    this.statusCode,
    this.fieldErrors = const <String, String>{},
  });

  final String message;
  final int? statusCode;
  final Map<String, String> fieldErrors;

  @override
  String toString() => 'ApiException($statusCode): $message';
}

/// The device could not reach the API (offline, DNS, timeout).
class NetworkException implements Exception {
  const NetworkException([
    this.message = 'We could not reach CareCircle. Check your internet connection and try again.',
  ]);

  final String message;

  @override
  String toString() => 'NetworkException: $message';
}

/// A response arrived but did not match the documented contract.
class ParseException implements Exception {
  const ParseException(this.message);

  final String message;

  @override
  String toString() => 'ParseException: $message';
}

/// A request was refused before it left the device because it targeted a
/// surface the mobile app must never use (PRD §3).
class SurfaceViolationException implements Exception {
  const SurfaceViolationException(this.url);

  final String url;

  @override
  String toString() => 'SurfaceViolationException: blocked request to $url';
}
