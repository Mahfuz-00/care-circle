import '../../../../core/network/api_client.dart';
import '../../domain/entities/auth_session.dart';
import '../models/account_model.dart';
import '../models/auth_session_model.dart';

/// Request body for `POST /auth/login`.
class LoginRequestModel {
  const LoginRequestModel({
    required this.email,
    required this.password,
    required this.deviceName,
  });

  final String email;
  final String password;
  final String deviceName;

  Map<String, dynamic> toJson() => <String, dynamic>{
        'email': email,
        'password': password,
        'device_name': deviceName,
      };
}

/// Request body for `POST /auth/register`.
class RegisterRequestModel {
  const RegisterRequestModel({
    required this.name,
    required this.email,
    required this.password,
    required this.role,
    required this.timezone,
    required this.deviceName,
  });

  factory RegisterRequestModel.fromEntity(
    RegisterRequest request, {
    required String deviceName,
  }) =>
      RegisterRequestModel(
        name: request.name,
        email: request.email,
        password: request.password,
        role: request.role.apiValue,
        timezone: request.timezone,
        deviceName: deviceName,
      );

  final String name;
  final String email;
  final String password;
  final String role;
  final String timezone;
  final String deviceName;

  Map<String, dynamic> toJson() => <String, dynamic>{
        'name': name,
        'email': email,
        'password': password,
        'role': role,
        'timezone': timezone,
        'device_name': deviceName,
      };
}

/// Access to the `/mobile/v1/auth/*` endpoints.
abstract interface class AuthRemoteDataSource {
  Future<AuthSessionModel> register(RegisterRequestModel request);

  Future<AuthSessionModel> login(LoginRequestModel request);

  Future<AccountModel> me();

  Future<void> logout();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  const AuthRemoteDataSourceImpl(this._client);

  final ApiClient _client;

  @override
  Future<AuthSessionModel> register(RegisterRequestModel request) async {
    final Map<String, dynamic> body =
        await _client.postObject('/auth/register', body: request.toJson());
    return AuthSessionModel.fromJson(body);
  }

  @override
  Future<AuthSessionModel> login(LoginRequestModel request) async {
    final Map<String, dynamic> body =
        await _client.postObject('/auth/login', body: request.toJson());
    return AuthSessionModel.fromJson(body);
  }

  @override
  Future<AccountModel> me() async {
    final Map<String, dynamic> body = await _client.getObject('/auth/me');
    return AccountModel.fromJson(body);
  }

  @override
  Future<void> logout() => _client.postNoContent('/auth/logout');
}
