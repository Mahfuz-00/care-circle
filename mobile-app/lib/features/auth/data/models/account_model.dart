import '../../../../core/network/json.dart';
import '../../domain/entities/auth_session.dart';
import 'care_circle_model.dart';
import 'user_model.dart';

/// DTO for `GET /auth/me`.
class AccountModel {
  const AccountModel({
    required this.user,
    required this.careCircles,
    this.activeCareCircle,
  });

  factory AccountModel.fromJson(Map<String, dynamic> json) => AccountModel(
        user: UserModel.fromJson(Json.asMap(json['user'])),
        careCircles: Json
            .asMapList(json['care_circles'])
            .map(CareCircleModel.fromJson)
            .toList(growable: false),
        activeCareCircle: json['active_care_circle'] == null
            ? null
            : CareCircleModel.fromJson(Json.asMap(json['active_care_circle'])),
      );

  final UserModel user;
  final List<CareCircleModel> careCircles;
  final CareCircleModel? activeCareCircle;

  AuthAccount toEntity() => AuthAccount(
        user: user.toEntity(),
        careCircles:
            careCircles.map((CareCircleModel model) => model.toEntity()).toList(growable: false),
        activeCareCircle: activeCareCircle?.toEntity(),
      );
}
