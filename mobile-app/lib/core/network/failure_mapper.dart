import '../error/exceptions.dart';
import '../error/failure.dart';

/// Converts whatever the data layer threw into a [Failure] the UI can show.
Failure failureFromException(Object error) {
  if (error is SurfaceViolationException) {
    return const SurfaceViolationFailure();
  }
  if (error is NetworkException) {
    return NetworkFailure(error.message);
  }
  if (error is ParseException) {
    return const UnexpectedFailure(
      'We could not read the answer from CareCircle. Please try again.',
    );
  }
  if (error is ApiException) {
    final int? status = error.statusCode;
    if (status == 401 || status == 403) {
      return UnauthorizedFailure(error.message.isEmpty
          ? 'Please sign in again to keep your care circle up to date.'
          : error.message);
    }
    if (status == 404) {
      return NotFoundFailure(error.message.isEmpty ? 'We could not find that information.' : error.message);
    }
    if (status == 422) {
      return ValidationFailure(
        error.message.isEmpty ? 'Please check the highlighted fields.' : error.message,
        fieldErrors: error.fieldErrors,
      );
    }
    if (status != null && status >= 500) {
      return ServerFailure(
        error.message.isEmpty
            ? 'CareCircle is having a problem. Please try again in a moment.'
            : error.message,
        status,
      );
    }
    return UnexpectedFailure(
      error.message.isEmpty ? 'Something went wrong. Please try again.' : error.message,
    );
  }
  return const UnexpectedFailure();
}
