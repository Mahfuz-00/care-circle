import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../storage/session_store.dart';

/// Attaches the bearer token and the active care circle to every request.
///
/// The care circle header is what the API uses to fail closed when context is
/// missing (PRD §9) — we simply never send a request without it once we know
/// which circle the person is in.
class AuthHeaderInterceptor extends Interceptor {
  AuthHeaderInterceptor(this._sessionStore);

  final SessionStore _sessionStore;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final String? token = await _sessionStore.readToken();
    if (token != null && token.isNotEmpty) {
      options.headers[AppConfig.authorizationHeader] = '${AppConfig.bearerPrefix}$token';
    }

    final String? careCircleId = await _sessionStore.readActiveCareCircleId();
    if (careCircleId != null && careCircleId.isNotEmpty) {
      options.headers[AppConfig.careCircleHeader] = careCircleId;
    }

    options.headers['Accept'] = 'application/json';
    options.headers[AppConfig.clientSurfaceHeader] = AppConfig.clientSurfaceValue;

    handler.next(options);
  }
}
