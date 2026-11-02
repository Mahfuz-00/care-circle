import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../error/exceptions.dart';

/// Fails closed on the device: no request may leave the app unless it targets
/// the `/mobile/v1` surface with a mobile-shaped path.
///
/// This mirrors PRD §3 / AGENTS.md rule 1 — a token minted for the dashboard
/// (or the landlord console) must never be requested from mobile, and the app
/// must not even be able to try.
class MobileSurfaceGuardInterceptor extends Interceptor {
  const MobileSurfaceGuardInterceptor();

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final String path = options.uri.path;
    final bool forbidden = AppConfig.forbiddenPathPrefixes.any(path.contains);
    final bool missingMobilePrefix = !path.startsWith(AppConfig.mobileApiPrefix);

    if (forbidden || missingMobilePrefix) {
      handler.reject(
        DioException(
          requestOptions: options,
          type: DioExceptionType.unknown,
          error: SurfaceViolationException(options.uri.toString()),
          message:
              'Blocked: the mobile app may only call ${AppConfig.mobileApiPrefix}. '
              'Dashboards use /api/v1 and the landlord console is not available on mobile.',
        ),
      );
      return;
    }

    handler.next(options);
  }
}
