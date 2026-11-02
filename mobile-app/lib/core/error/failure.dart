import 'package:equatable/equatable.dart';

/// A failure the presentation layer can show a person.
///
/// Copy rules (PRD §9): plain language, no blame, **never medical advice**.
sealed class Failure extends Equatable {
  const Failure(this.message);

  /// Human readable, ready to be shown (and announced) as-is.
  final String message;

  @override
  List<Object?> get props => <Object?>[message];
}

/// The device could not reach CareCircle.
final class NetworkFailure extends Failure {
  const NetworkFailure([
    super.message =
        'We could not reach CareCircle. Check your internet connection and try again.',
  ]);
}

/// Token missing, expired, or minted for another surface.
final class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure([
    super.message = 'Please sign in again to keep your care circle up to date.',
  ]);
}

/// The API rejected the data the person typed in.
final class ValidationFailure extends Failure {
  const ValidationFailure(
    super.message, {
    this.fieldErrors = const <String, String>{},
  });

  /// Field name -> first error message, as returned by the API.
  final Map<String, String> fieldErrors;

  @override
  List<Object?> get props => <Object?>[message, fieldErrors];
}

/// The requested record does not exist (or is not visible in this circle).
final class NotFoundFailure extends Failure {
  const NotFoundFailure([
    super.message = 'We could not find that information.',
  ]);
}

/// The API answered with a 5xx.
final class ServerFailure extends Failure {
  const ServerFailure([
    super.message = 'CareCircle is having a problem. Please try again in a moment.',
    this.statusCode,
  ]);

  final int? statusCode;

  @override
  List<Object?> get props => <Object?>[message, statusCode];
}

/// Something unexpected happened that we could not classify.
final class UnexpectedFailure extends Failure {
  const UnexpectedFailure([
    super.message = 'Something went wrong. Please try again.',
  ]);
}

/// The app tried to reach a surface it is not allowed to touch.
final class SurfaceViolationFailure extends Failure {
  const SurfaceViolationFailure([
    super.message = 'This app can only use the CareCircle mobile service.',
  ]);
}
