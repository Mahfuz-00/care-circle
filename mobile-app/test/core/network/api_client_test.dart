import 'dart:convert';
import 'dart:typed_data';

import 'package:care_circle_mobile/core/error/exceptions.dart';
import 'package:care_circle_mobile/core/error/failure.dart';
import 'package:care_circle_mobile/core/network/api_client.dart';
import 'package:care_circle_mobile/core/network/auth_header_interceptor.dart';
import 'package:care_circle_mobile/core/network/failure_mapper.dart';
import 'package:care_circle_mobile/core/network/mobile_surface_guard_interceptor.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/fakes.dart';

/// Answers every request locally and remembers the headers it saw.
class _StubAdapter implements HttpClientAdapter {
  _StubAdapter(this.body, {this.statusCode = 200});

  final Object body;
  final int statusCode;
  RequestOptions? lastRequest;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    lastRequest = options;
    return ResponseBody.fromString(
      jsonEncode(body),
      statusCode,
      headers: <String, List<String>>{
        Headers.contentTypeHeader: <String>[Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

void main() {
  group('MobileSurfaceGuardInterceptor', () {
    test('blocks the dashboard surface (/api/v1)', () async {
      final Dio dio = Dio()..interceptors.add(const MobileSurfaceGuardInterceptor());

      await expectLater(
        dio.get<Object?>('https://api.example.test/api/v1/medications'),
        throwsA(
          isA<DioException>().having(
            (DioException error) => error.error,
            'error',
            isA<SurfaceViolationException>(),
          ),
        ),
      );
    });

    test('blocks the landlord console (/api/v1/platform/*)', () async {
      final Dio dio = Dio()..interceptors.add(const MobileSurfaceGuardInterceptor());

      await expectLater(
        dio.get<Object?>('https://api.example.test/api/v1/platform/system-health'),
        throwsA(
          isA<DioException>().having(
            (DioException error) => error.error,
            'error',
            isA<SurfaceViolationException>(),
          ),
        ),
      );
    });

    test('refuses any path outside /mobile/v1', () async {
      final Dio dio = Dio()..interceptors.add(const MobileSurfaceGuardInterceptor());

      await expectLater(
        dio.get<Object?>('https://api.example.test/health'),
        throwsA(isA<DioException>()),
      );
    });

    test('lets a /mobile/v1 request through', () async {
      final _StubAdapter adapter = _StubAdapter(<String, dynamic>{'data': <String, dynamic>{}});
      final Dio dio = Dio()
        ..httpClientAdapter = adapter
        ..interceptors.add(const MobileSurfaceGuardInterceptor());

      await dio.get<Object?>('https://api.example.test/mobile/v1/today');

      expect(adapter.lastRequest, isNotNull);
    });
  });

  group('AuthHeaderInterceptor', () {
    test('sends the bearer token and the active care circle', () async {
      final _StubAdapter adapter = _StubAdapter(<String, dynamic>{'data': <String, dynamic>{}});
      final Dio dio = Dio()..httpClientAdapter = adapter;
      dio.interceptors.add(
        AuthHeaderInterceptor(
          FakeSessionStore(token: 'mobile-token', careCircleId: 'cc-42'),
        ),
      );

      final ApiClient client = ApiClient(dio);
      final Map<String, dynamic> body = await client.getObject('/today');

      expect(body, isEmpty);
      expect(adapter.lastRequest?.headers['Authorization'], 'Bearer mobile-token');
      expect(adapter.lastRequest?.headers['X-Care-Circle'], 'cc-42');
      expect(adapter.lastRequest?.headers['X-Care-Circle-Surface'], 'mobile');
      expect(
        adapter.lastRequest?.uri.toString(),
        'http://10.0.2.2:8000/mobile/v1/today',
      );
    });

    test('omits the care circle header when none is chosen yet', () async {
      final _StubAdapter adapter = _StubAdapter(<String, dynamic>{'data': <String, dynamic>{}});
      final Dio dio = Dio()..httpClientAdapter = adapter;
      dio.interceptors.add(AuthHeaderInterceptor(FakeSessionStore(token: 't')));

      await ApiClient(dio).getObject('/auth/me');

      expect(adapter.lastRequest?.headers.containsKey('X-Care-Circle'), isFalse);
    });
  });

  group('ApiClient', () {
    test('unwraps the { data: ... } envelope', () async {
      final _StubAdapter adapter = _StubAdapter(<String, dynamic>{
        'data': <String, dynamic>{'unread_alerts': 2},
      });
      final Dio dio = Dio()..httpClientAdapter = adapter;

      final Map<String, dynamic> body = await ApiClient(dio).getObject('/today');

      expect(body['unread_alerts'], 2);
    });

    test('reads a list payload', () async {
      final _StubAdapter adapter = _StubAdapter(<String, dynamic>{
        'data': <Map<String, dynamic>>[
          <String, dynamic>{'id': 1, 'name': 'Metformin'},
        ],
      });
      final Dio dio = Dio()..httpClientAdapter = adapter;

      final List<Map<String, dynamic>> items = await ApiClient(dio).getObjects('/medications');

      expect(items, hasLength(1));
      expect(items.first['id'], 1);
    });

    test('maps a 422 to a validation failure with field errors', () async {
      final _StubAdapter adapter = _StubAdapter(
        <String, dynamic>{
          'message': 'The given data was invalid.',
          'errors': <String, dynamic>{
            'email': <String>['That email is already registered.'],
          },
        },
        statusCode: 422,
      );
      final Dio dio = Dio()..httpClientAdapter = adapter;

      Object? captured;
      try {
        await ApiClient(dio).postObject('/auth/register', body: <String, dynamic>{});
      } catch (error) {
        captured = error;
      }

      final Failure failure = failureFromException(captured!);
      expect(failure, isA<ValidationFailure>());
      expect((failure as ValidationFailure).fieldErrors['email'],
          'That email is already registered.');
    });

    test('maps a 401 to an authorization failure', () async {
      final _StubAdapter adapter = _StubAdapter(
        <String, dynamic>{'message': 'Unauthenticated.'},
        statusCode: 401,
      );
      final Dio dio = Dio()..httpClientAdapter = adapter;

      Object? captured;
      try {
        await ApiClient(dio).getObject('/today');
      } catch (error) {
        captured = error;
      }

      expect(failureFromException(captured!), isA<UnauthorizedFailure>());
    });

    test('maps a blocked surface to a surface violation failure', () {
      expect(
        failureFromException(const SurfaceViolationException('/api/v1/medications')),
        isA<SurfaceViolationFailure>(),
      );
    });
  });
}
