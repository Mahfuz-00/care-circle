import 'package:care_circle_mobile/core/di/injection.dart';
import 'package:care_circle_mobile/core/network/api_client.dart';
import 'package:care_circle_mobile/core/network/auth_header_interceptor.dart';
import 'package:care_circle_mobile/core/network/mobile_surface_guard_interceptor.dart';
import 'package:care_circle_mobile/core/router/app_router.dart';
import 'package:care_circle_mobile/core/storage/session_store.dart';
import 'package:care_circle_mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:care_circle_mobile/features/home/presentation/bloc/today_bloc.dart';
import 'package:care_circle_mobile/features/medications/presentation/bloc/medications_bloc.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues(<String, Object>{});
    await resetDependencies();
  });

  tearDown(() async {
    await resetDependencies();
  });

  test('registers the whole dependency graph', () async {
    await configureDependencies();

    expect(sl<ApiClient>(), isNotNull);
    expect(sl<SessionStore>(), isNotNull);
    expect(sl<AuthBloc>(), isNotNull);
    expect(sl<TodayBloc>(), isNotNull);
    expect(sl<MedicationsBloc>(), isNotNull);
    expect(sl<AppRouter>().router, isNotNull);
  });

  test('the HTTP client is guarded and authenticated', () async {
    await configureDependencies();

    final Dio dio = sl<Dio>();

    expect(dio.interceptors.whereType<MobileSurfaceGuardInterceptor>(), hasLength(1));
    expect(dio.interceptors.whereType<AuthHeaderInterceptor>(), hasLength(1));
    expect(dio.options.baseUrl, contains('/mobile/v1'));
  });

  test('blocs are shared instances, so the router sees the same session', () async {
    await configureDependencies();

    expect(identical(sl<AuthBloc>(), sl<AuthBloc>()), isTrue);
  });
}
