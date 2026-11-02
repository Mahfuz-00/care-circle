import '../../../../core/network/json.dart';
import '../../domain/entities/auth_session.dart';
import 'care_circle_model.dart';
import 'user_model.dart';

/// DTO for `POST /auth/register` and `POST /auth/login` payloads.
class AuthSessionModel {
  const AuthSessionModel({
    required this.user,
    required this.token,
    this.careCircle,
  });

  factory AuthSessionModel.fromJson(Map<String, dynamic> json) {
    final Map<String, dynamic>? careCircle = json['care_circle'] == null
        ? null
        : Json.asMap(json['care_circle']);

    return AuthSessionModel(
      user: UserModel.fromJson(Json.asMap(json['user'])),
      token: Json.requiredString(json['token'], 'token'),
      careCircle: careCircle == null ? null : CareCircleModel.fromJson(careCircle),
    );
  }

  final UserModel user;
  final String token;
  final CareCircleModel? careCircle;

  AuthSession toEntity() => AuthSession(
        user: user.toEntity(),
        token: token,
        careCircle: careCircle?.toEntity(),
      );
}
