import 'failure.dart';

/// A tiny, dependency-free result type.
///
/// Use cases return `Result<T>` so the presentation layer never sees a Dio or
/// platform exception — and so "succeeded" / "failed" is explicit.
sealed class Result<T> {
  const Result();

  bool get isOk => this is Ok<T>;

  bool get isErr => this is Err<T>;

  T? get valueOrNull => switch (this) {
    Ok<T>(value: final T value) => value,
    Err<T>() => null,
  };

  Failure? get failureOrNull => switch (this) {
    Ok<T>() => null,
    Err<T>(failure: final Failure failure) => failure,
  };

  /// Collapses both branches into a single value.
  R fold<R>(R Function(T value) onOk, R Function(Failure failure) onErr) =>
      switch (this) {
        Ok<T>(value: final T value) => onOk(value),
        Err<T>(failure: final Failure failure) => onErr(failure),
      };

  /// Transforms the success value, keeping a failure untouched.
  Result<R> map<R>(R Function(T value) transform) => switch (this) {
    Ok<T>(value: final T value) => Ok<R>(transform(value)),
    Err<T>(failure: final Failure failure) => Err<R>(failure),
  };

  /// Transforms the success value into another [Result].
  Result<R> flatMap<R>(Result<R> Function(T value) transform) => switch (this) {
    Ok<T>(value: final T value) => transform(value),
    Err<T>(failure: final Failure failure) => Err<R>(failure),
  };
}

final class Ok<T> extends Result<T> {
  const Ok(this.value);

  final T value;
}

final class Err<T> extends Result<T> {
  const Err(this.failure);

  final Failure failure;
}
