import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../error/exceptions.dart';

/// Thin wrapper over [Dio] bound to the `/mobile/v1` surface.
///
/// Every response of the documented contract is wrapped in `{ "data": ... }`;
/// this class unwraps it so data sources only ever deal with the payload.
class ApiClient {
  ApiClient(this._dio);

  final Dio _dio;

  static const String _envelopeKey = 'data';

  /// Absolute URI for a `/mobile/v1` relative path (e.g. `/today`).
  Uri resolve(String path) {
    assert(
      path.isNotEmpty && path.startsWith('/'),
      'Mobile paths must start with "/" (got "$path").',
    );
    return Uri.parse('${AppConfig.mobileApiBaseUrl}$path');
  }

  Future<Map<String, dynamic>> getObject(
    String path, {
    Map<String, dynamic>? query,
  }) async {
    final Response<Object?> response = await _send(
      () => _dio.get<Object?>(resolve(path).toString(), queryParameters: query),
    );
    return _asObject(_unwrap(response.data));
  }

  Future<List<Map<String, dynamic>>> getObjects(
    String path, {
    Map<String, dynamic>? query,
  }) async {
    final Response<Object?> response = await _send(
      () => _dio.get<Object?>(resolve(path).toString(), queryParameters: query),
    );
    return _asObjects(_unwrap(response.data));
  }

  Future<Map<String, dynamic>> postObject(
    String path, {
    Object? body,
  }) async {
    final Response<Object?> response = await _send(
      () => _dio.post<Object?>(resolve(path).toString(), data: body),
    );
    return _asObject(_unwrap(response.data));
  }

  /// POST that ignores the body (logout, acknowledge, dose actions).
  Future<void> postNoContent(String path, {Object? body}) async {
    await _send(() => _dio.post<Object?>(resolve(path).toString(), data: body));
  }

  /// Unwraps `{ "data": ... }`.
  Object? _unwrap(Object? body) {
    if (body == null) return null;
    if (body is Map) {
      if (body.containsKey(_envelopeKey)) return body[_envelopeKey];
      throw const ParseException('Response is missing the "data" envelope.');
    }
    throw const ParseException('Response is not a JSON object.');
  }

  Map<String, dynamic> _asObject(Object? value) {
    if (value == null) return const <String, dynamic>{};
    if (value is Map<String, dynamic>) return value;
    if (value is Map) return Map<String, dynamic>.from(value);
    throw const ParseException('Expected a JSON object in "data".');
  }

  List<Map<String, dynamic>> _asObjects(Object? value) {
    if (value is List) {
      return value.map(_asObject).toList(growable: false);
    }
    throw const ParseException('Expected a JSON list in "data".');
  }

  Future<Response<T>> _send<T>(Future<Response<T>> Function() request) async {
    try {
      return await request();
    } on DioException catch (error) {
      throw _mapDioException(error);
    } on ApiException {
      rethrow;
    } on ParseException {
      rethrow;
    } catch (error) {
      throw ApiException('Unexpected error: $error');
    }
  }

  Object _mapDioException(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.transformTimeout:
        return const NetworkException(
          'CareCircle is taking too long to answer. Check your connection and try again.',
        );
      case DioExceptionType.connectionError:
        return const NetworkException();
      case DioExceptionType.cancel:
        return const ApiException('The request was cancelled.');
      case DioExceptionType.badCertificate:
        return const NetworkException(
          'We could not make a secure connection to CareCircle.',
        );
      case DioExceptionType.badResponse:
        final Response<Object?>? response = error.response;
        final int? status = response?.statusCode;
        final Map<String, dynamic> body = _bodyAsMap(response?.data);
        final String message = (body['message'] as String?)?.trim() ?? '';
        return ApiException(
          message.isEmpty ? _defaultMessageFor(status) : message,
          statusCode: status,
          fieldErrors: _fieldErrors(body['errors']),
        );
      case DioExceptionType.unknown:
        final Object? cause = error.error;
        if (cause is Exception) return cause;
        return const NetworkException();
    }
  }

  Map<String, dynamic> _bodyAsMap(Object? data) {
    if (data is Map<String, dynamic>) return data;
    if (data is Map) return Map<String, dynamic>.from(data);
    return const <String, dynamic>{};
  }

  Map<String, String> _fieldErrors(Object? errors) {
    if (errors is! Map) return const <String, String>{};
    final Map<String, String> mapped = <String, String>{};
    errors.forEach((Object? key, Object? value) {
      if (key is! String) return;
      if (value is List && value.isNotEmpty) {
        mapped[key] = value.first.toString();
      } else if (value is String) {
        mapped[key] = value;
      }
    });
    return mapped;
  }

  String _defaultMessageFor(int? status) {
    if (status == 401 || status == 403) {
      return 'Please sign in again to keep your care circle up to date.';
    }
    if (status == 404) return 'We could not find that information.';
    if (status == 422) return 'Please check the highlighted fields.';
    if (status != null && status >= 500) {
      return 'CareCircle is having a problem. Please try again in a moment.';
    }
    return 'Something went wrong. Please try again.';
  }
}
