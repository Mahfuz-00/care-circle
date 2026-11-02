import '../../../../core/network/json.dart';
import '../../domain/entities/care_circle.dart';

/// DTO for `care_circle` / `active_care_circle` objects.
class CareCircleModel {
  const CareCircleModel({required this.id, required this.name});

  factory CareCircleModel.fromJson(Map<String, dynamic> json) => CareCircleModel(
        id: Json.requiredString(json['id'], 'care_circle.id'),
        name: Json.asString(json['name']) ?? '',
      );

  final String id;
  final String name;

  CareCircle toEntity() => CareCircle(id: id, name: name);
}
