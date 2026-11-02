import '../../../../core/config/app_config.dart';
import '../../../../core/error/result.dart';
import '../../../../core/network/failure_mapper.dart';
import '../../../../core/storage/session_store.dart';
import '../../domain/entities/auth_session.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_data_source.dart';
import '../models/account_model.dart';
import '../models/auth_session_model.dart';

/// Talks to `/mobile/v1/auth/*` and owns the stored token.
class AuthRepositoryImpl implements AuthRepository {
  const AuthRepositoryImpl({
    required AuthRemoteDataSource remote,
    required SessionStore sessionStore,
  })  : _remote = remote,
        _sessionStore = sessionStore;

  final AuthRemoteDataSource _remote;
  final SessionStore _sessionStore;

  @override
  Future<bool> hasSession() async {
    final String? token = await _sessionStore.readToken();
    return token != null && token.isNotEmpty;
  }

  @override
  Future<Result<AuthSession>> login({
    required String email,
    required String password,
  }) async {
    try {
      final AuthSessionModel response = await _remote.login(
        LoginRequestModel(
          email: email.trim(),
          password: password,
          deviceName: await _deviceName(),
        ),
      );
      final AuthSession session = response.toEntity();
      await _sessionStore.writeToken(session.token);
      return Ok<AuthSession>(session);
    } catch (error) {
      return Err<AuthSession>(failureFromException(error));
    }
  }

  @override
  Future<Result<AuthSession>> register(RegisterRequest request) async {
    try {
      final AuthSessionModel response = await _remote.register(
        RegisterRequestModel.fromEntity(request, deviceName: await _deviceName()),
      );
      final AuthSession session = response.toEntity();
      await _sessionStore.writeToken(session.token);
      await _sessionStore.writeActiveCareCircleId(session.careCircle?.id);
      return Ok<AuthSession>(session);
    } catch (error) {
      return Err<AuthSession>(failureFromException(error));
    }
  }

  @override
  Future<Result<AuthAccount>> loadAccount() async {
    try {
      final AccountModel response = await _remote.me();
      final AuthAccount account = response.toEntity();
      await _sessionStore.writeActiveCareCircleId(account.activeCareCircle?.id);
      return Ok<AuthAccount>(account);
    } catch (error) {
      return Err<AuthAccount>(failureFromException(error));
    }
  }

  @override
  Future<Result<void>> logout() async {
    Object? failure;
    try {
      await _remote.logout();
    } catch (error) {
      // The session is cleared regardless: someone tapping "Sign out" must
      // always end up signed out on this device.
      failure = error;
    }
    await _sessionStore.clearSession();
    if (failure != null) {
      return Err<void>(failureFromException(failure));
    }
    return const Ok<void>(null);
  }

  @override
  Future<Result<void>> setActiveCareCircle(String careCircleId) async {
    try {
      await _sessionStore.writeActiveCareCircleId(careCircleId);
      return const Ok<void>(null);
    } catch (error) {
      return Err<void>(failureFromException(error));
    }
  }

  Future<String> _deviceName() async {
    final String? stored = await _sessionStore.readDeviceName();
    if (stored == null || stored.isEmpty) return AppConfig.defaultDeviceName;
    return stored;
  }
}
