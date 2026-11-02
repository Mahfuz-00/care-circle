import 'package:care_circle_mobile/core/error/failure.dart';
import 'package:care_circle_mobile/core/error/result.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Result', () {
    test('carries a value on success', () {
      const Result<int> result = Ok<int>(7);

      expect(result.isOk, isTrue);
      expect(result.isErr, isFalse);
      expect(result.valueOrNull, 7);
      expect(result.failureOrNull, isNull);
    });

    test('carries a failure on error', () {
      const Result<int> result = Err<int>(NetworkFailure('offline'));

      expect(result.isErr, isTrue);
      expect(result.valueOrNull, isNull);
      expect(result.failureOrNull, isA<NetworkFailure>());
      expect(result.failureOrNull?.message, 'offline');
    });

    test('fold collapses both branches', () {
      expect(const Ok<int>(2).fold((int v) => 'ok:$v', (Failure f) => 'err'), 'ok:2');
      expect(
        const Err<int>(UnexpectedFailure()).fold((int v) => 'ok', (Failure f) => f.message),
        const UnexpectedFailure().message,
      );
    });

    test('map transforms success and passes failures through', () {
      expect(const Ok<int>(2).map((int v) => v * 3).valueOrNull, 6);

      final Result<String> mapped =
          const Err<int>(NotFoundFailure()).map((int v) => '$v');
      expect(mapped.isErr, isTrue);
      expect(mapped.failureOrNull, isA<NotFoundFailure>());
    });

    test('flatMap chains results', () {
      expect(
        const Ok<int>(2).flatMap((int v) => Ok<String>('v$v')).valueOrNull,
        'v2',
      );
      expect(
        const Err<int>(NetworkFailure()).flatMap((int v) => Ok<String>('v$v')).isErr,
        isTrue,
      );
    });
  });
}
