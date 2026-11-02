import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../features/appointments/data/datasources/appointment_remote_data_source.dart';
import '../../features/appointments/data/repositories/appointment_repository_impl.dart';
import '../../features/appointments/domain/repositories/appointment_repository.dart';
import '../../features/appointments/domain/usecases/list_appointments.dart';
import '../../features/appointments/presentation/bloc/appointments_bloc.dart';
import '../../features/auth/data/datasources/auth_remote_data_source.dart';
import '../../features/auth/data/repositories/auth_repository_impl.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';
import '../../features/auth/domain/usecases/has_session.dart';
import '../../features/auth/domain/usecases/load_account.dart';
import '../../features/auth/domain/usecases/login.dart';
import '../../features/auth/domain/usecases/logout.dart';
import '../../features/auth/domain/usecases/register.dart';
import '../../features/auth/domain/usecases/set_active_care_circle.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';
import '../../features/care_circle/data/datasources/care_circle_remote_data_source.dart';
import '../../features/care_circle/data/repositories/care_circle_repository_impl.dart';
import '../../features/care_circle/domain/repositories/care_circle_repository.dart';
import '../../features/care_circle/domain/usecases/get_care_circle.dart';
import '../../features/care_circle/presentation/bloc/care_circle_bloc.dart';
import '../../features/emergency/data/datasources/emergency_remote_data_source.dart';
import '../../features/emergency/data/repositories/emergency_repository_impl.dart';
import '../../features/emergency/domain/repositories/emergency_repository.dart';
import '../../features/emergency/domain/usecases/acknowledge_emergency.dart';
import '../../features/emergency/domain/usecases/get_emergency_alert.dart';
import '../../features/emergency/domain/usecases/raise_emergency.dart';
import '../../features/emergency/presentation/bloc/emergency_bloc.dart';
import '../../features/home/data/datasources/today_remote_data_source.dart';
import '../../features/home/data/repositories/today_repository_impl.dart';
import '../../features/home/domain/repositories/today_repository.dart';
import '../../features/home/domain/usecases/get_today.dart';
import '../../features/home/presentation/bloc/today_bloc.dart';
import '../../features/medications/data/datasources/dose_remote_data_source.dart';
import '../../features/medications/data/datasources/medication_remote_data_source.dart';
import '../../features/medications/data/repositories/dose_repository_impl.dart';
import '../../features/medications/data/repositories/medication_repository_impl.dart';
import '../../features/medications/domain/repositories/dose_repository.dart';
import '../../features/medications/domain/repositories/medication_repository.dart';
import '../../features/medications/domain/usecases/list_medications.dart';
import '../../features/medications/domain/usecases/skip_dose.dart';
import '../../features/medications/domain/usecases/snooze_dose.dart';
import '../../features/medications/domain/usecases/take_dose.dart';
import '../../features/medications/presentation/bloc/medications_bloc.dart';
import '../../features/settings/data/repositories/settings_repository_impl.dart';
import '../../features/settings/domain/repositories/settings_repository.dart';
import '../../features/settings/domain/usecases/load_accessibility_settings.dart';
import '../../features/settings/domain/usecases/save_accessibility_settings.dart';
import '../../features/settings/presentation/bloc/settings_bloc.dart';
import '../config/app_config.dart';
import '../network/api_client.dart';
import '../network/auth_header_interceptor.dart';
import '../network/mobile_surface_guard_interceptor.dart';
import '../router/app_router.dart';
import '../storage/preferences_store.dart';
import '../storage/secure_session_store.dart';
import '../storage/session_store.dart';

/// The app's service locator.
final GetIt sl = GetIt.instance;

/// Registers everything the app needs, in dependency order.
///
/// Layers: config -> storage -> network -> data sources -> repositories ->
/// use cases -> blocs -> router.
Future<void> configureDependencies() async {
  await _registerStorage();
  _registerNetwork();
  _registerDataSources();
  _registerRepositories();
  _registerUseCases();
  _registerBlocs();
  _registerRouter();
}

Future<void> _registerStorage() async {
  final SharedPreferences preferences = await SharedPreferences.getInstance();
  sl.registerLazySingleton<PreferencesStore>(() => PreferencesStore(preferences));
  sl.registerLazySingleton<SessionStore>(
    () => SecureSessionStore(
      preferences: preferences,
      secureStorage: const FlutterSecureStorage(),
    ),
  );
}

void _registerNetwork() {
  sl.registerLazySingleton<Dio>(() {
    final Dio dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.mobileApiBaseUrl,
        connectTimeout: AppConfig.connectTimeout,
        receiveTimeout: AppConfig.receiveTimeout,
        sendTimeout: AppConfig.sendTimeout,
        contentType: Headers.jsonContentType,
        responseType: ResponseType.json,
      ),
    );
    dio.interceptors.addAll(<Interceptor>[
      // Refuses anything outside /mobile/v1 before it leaves the device.
      const MobileSurfaceGuardInterceptor(),
      AuthHeaderInterceptor(sl<SessionStore>()),
    ]);
    return dio;
  });
  sl.registerLazySingleton<ApiClient>(() => ApiClient(sl<Dio>()));
}

void _registerDataSources() {
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(sl<ApiClient>()),
  );
  sl.registerLazySingleton<TodayRemoteDataSource>(
    () => TodayRemoteDataSourceImpl(sl<ApiClient>()),
  );
  sl.registerLazySingleton<MedicationRemoteDataSource>(
    () => MedicationRemoteDataSourceImpl(sl<ApiClient>()),
  );
  sl.registerLazySingleton<DoseRemoteDataSource>(
    () => DoseRemoteDataSourceImpl(sl<ApiClient>()),
  );
  sl.registerLazySingleton<AppointmentRemoteDataSource>(
    () => AppointmentRemoteDataSourceImpl(sl<ApiClient>()),
  );
  sl.registerLazySingleton<EmergencyRemoteDataSource>(
    () => EmergencyRemoteDataSourceImpl(sl<ApiClient>()),
  );
  sl.registerLazySingleton<CareCircleRemoteDataSource>(
    () => CareCircleRemoteDataSourceImpl(sl<ApiClient>()),
  );
}

void _registerRepositories() {
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remote: sl<AuthRemoteDataSource>(),
      sessionStore: sl<SessionStore>(),
    ),
  );
  sl.registerLazySingleton<TodayRepository>(
    () => TodayRepositoryImpl(sl<TodayRemoteDataSource>()),
  );
  sl.registerLazySingleton<MedicationRepository>(
    () => MedicationRepositoryImpl(sl<MedicationRemoteDataSource>()),
  );
  sl.registerLazySingleton<DoseRepository>(
    () => DoseRepositoryImpl(sl<DoseRemoteDataSource>()),
  );
  sl.registerLazySingleton<AppointmentRepository>(
    () => AppointmentRepositoryImpl(sl<AppointmentRemoteDataSource>()),
  );
  sl.registerLazySingleton<EmergencyRepository>(
    () => EmergencyRepositoryImpl(sl<EmergencyRemoteDataSource>()),
  );
  sl.registerLazySingleton<CareCircleRepository>(
    () => CareCircleRepositoryImpl(sl<CareCircleRemoteDataSource>()),
  );
  sl.registerLazySingleton<SettingsRepository>(
    () => SettingsRepositoryImpl(sl<PreferencesStore>()),
  );
}

void _registerUseCases() {
  sl.registerLazySingleton<HasSession>(() => HasSession(sl<AuthRepository>()));
  sl.registerLazySingleton<Login>(() => Login(sl<AuthRepository>()));
  sl.registerLazySingleton<Register>(() => Register(sl<AuthRepository>()));
  sl.registerLazySingleton<LoadAccount>(() => LoadAccount(sl<AuthRepository>()));
  sl.registerLazySingleton<Logout>(() => Logout(sl<AuthRepository>()));
  sl.registerLazySingleton<SetActiveCareCircle>(
    () => SetActiveCareCircle(sl<AuthRepository>()),
  );
  sl.registerLazySingleton<GetToday>(() => GetToday(sl<TodayRepository>()));
  sl.registerLazySingleton<ListMedications>(
    () => ListMedications(sl<MedicationRepository>()),
  );
  sl.registerLazySingleton<TakeDose>(() => TakeDose(sl<DoseRepository>()));
  sl.registerLazySingleton<SkipDose>(() => SkipDose(sl<DoseRepository>()));
  sl.registerLazySingleton<SnoozeDose>(() => SnoozeDose(sl<DoseRepository>()));
  sl.registerLazySingleton<ListAppointments>(
    () => ListAppointments(sl<AppointmentRepository>()),
  );
  sl.registerLazySingleton<RaiseEmergency>(
    () => RaiseEmergency(sl<EmergencyRepository>()),
  );
  sl.registerLazySingleton<GetEmergencyAlert>(
    () => GetEmergencyAlert(sl<EmergencyRepository>()),
  );
  sl.registerLazySingleton<AcknowledgeEmergency>(
    () => AcknowledgeEmergency(sl<EmergencyRepository>()),
  );
  sl.registerLazySingleton<GetCareCircle>(
    () => GetCareCircle(sl<CareCircleRepository>()),
  );
  sl.registerLazySingleton<LoadAccessibilitySettings>(
    () => LoadAccessibilitySettings(sl<SettingsRepository>()),
  );
  sl.registerLazySingleton<SaveAccessibilitySettings>(
    () => SaveAccessibilitySettings(sl<SettingsRepository>()),
  );
}

void _registerBlocs() {
  // Blocs are app-lifetime singletons: the router reads the same AuthBloc the
  // widget tree provides, and each screen shares one source of truth.
  sl.registerLazySingleton<AuthBloc>(
    () => AuthBloc(
      hasSession: sl<HasSession>(),
      login: sl<Login>(),
      register: sl<Register>(),
      loadAccount: sl<LoadAccount>(),
      logout: sl<Logout>(),
      setActiveCareCircle: sl<SetActiveCareCircle>(),
    ),
  );
  sl.registerLazySingleton<TodayBloc>(
    () => TodayBloc(
      getToday: sl<GetToday>(),
      takeDose: sl<TakeDose>(),
      skipDose: sl<SkipDose>(),
      snoozeDose: sl<SnoozeDose>(),
    ),
  );
  sl.registerLazySingleton<MedicationsBloc>(
    () => MedicationsBloc(listMedications: sl<ListMedications>()),
  );
  sl.registerLazySingleton<AppointmentsBloc>(
    () => AppointmentsBloc(listAppointments: sl<ListAppointments>()),
  );
  sl.registerLazySingleton<EmergencyBloc>(
    () => EmergencyBloc(
      raiseEmergency: sl<RaiseEmergency>(),
      getEmergencyAlert: sl<GetEmergencyAlert>(),
      acknowledgeEmergency: sl<AcknowledgeEmergency>(),
    ),
  );
  sl.registerLazySingleton<CareCircleBloc>(
    () => CareCircleBloc(getCareCircle: sl<GetCareCircle>()),
  );
  sl.registerLazySingleton<SettingsBloc>(
    () => SettingsBloc(
      loadSettings: sl<LoadAccessibilitySettings>(),
      saveSettings: sl<SaveAccessibilitySettings>(),
    ),
  );
}

void _registerRouter() {
  sl.registerLazySingleton<AppRouter>(() => AppRouter(authBloc: sl<AuthBloc>()));
}

/// Test seam: forget every registration.
Future<void> resetDependencies() => sl.reset(dispose: false);
