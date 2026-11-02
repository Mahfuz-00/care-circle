import '../../../../core/network/json.dart';
import '../../domain/entities/care_role.dart';
import '../../domain/entities/user.dart';

/// DTO for the `user` object of `/mobile/v1`.
class UserModel {
  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.timezone,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        id: Json.requiredString(json['id'], 'user.id'),
        name: Json.asString(json['name']) ?? '',
        email: Json.asString(json['email']) ?? '',
        role: CareRole.fromApi(json['role']),
        timezone: Json.asString(json['timezone']),
      );

  final String id;
  final String name;
  final String email;
  final CareRole role;
  final String? timezone;

  User toEntity() => User(
        id: id,
        name: name,
        email: email,
        role: role,
        timezone: timezone,
      );
}
