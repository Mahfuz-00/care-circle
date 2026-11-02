import '../../../../core/network/json.dart';
import '../../../auth/domain/entities/care_role.dart';
import '../../domain/entities/care_circle_details.dart';

/// DTO for `GET /mobile/v1/care-circle`.
class CareCircleDetailsModel {
  const CareCircleDetailsModel({
    required this.id,
    required this.name,
    required this.members,
  });

  factory CareCircleDetailsModel.fromJson(Map<String, dynamic> json) =>
      CareCircleDetailsModel(
        id: Json.requiredString(json['id'], 'care_circle.id'),
        name: Json.asString(json['name']) ?? '',
        members: Json
            .asMapList(json['members'])
            .map(CareCircleMemberModel.fromJson)
            .toList(growable: false),
      );

  final String id;
  final String name;
  final List<CareCircleMemberModel> members;

  CareCircleDetails toEntity() => CareCircleDetails(
        id: id,
        name: name,
        members: members
            .map((CareCircleMemberModel model) => model.toEntity())
            .toList(growable: false),
      );
}

/// DTO for a member entry: `{id, user: {id, name}, role}`.
class CareCircleMemberModel {
  const CareCircleMemberModel({
    required this.id,
    required this.name,
    required this.role,
  });

  factory CareCircleMemberModel.fromJson(Map<String, dynamic> json) {
    final Map<String, dynamic> user = Json.asMap(json['user']);
    return CareCircleMemberModel(
      id: Json.asString(json['id']) ?? Json.asString(user['id']) ?? '',
      name: Json.asString(user['name']) ?? '',
      role: CareRole.fromApi(json['role']),
    );
  }

  final String id;
  final String name;
  final CareRole role;

  CareCircleMember toEntity() =>
      CareCircleMember(id: id, name: name, role: role);
}
