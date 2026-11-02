import '../../../../core/network/json.dart';
import '../../domain/entities/emergency_alert.dart';

/// DTO for `POST /emergency` and `GET /emergency/{id}`.
class EmergencyAlertModel {
  const EmergencyAlertModel({
    required this.id,
    required this.type,
    required this.status,
    required this.raisedBy,
    required this.createdAt,
    this.acknowledgedBy,
    this.acknowledgedAt,
  });

  factory EmergencyAlertModel.fromJson(Map<String, dynamic> json) {
    final Map<String, dynamic>? acknowledgedBy = json['acknowledged_by'] == null
        ? null
        : Json.asMap(json['acknowledged_by']);

    return EmergencyAlertModel(
      id: Json.requiredString(json['id'], 'emergency.id'),
      type: EmergencyType.fromApi(json['type']),
      status: EmergencyStatus.fromApi(json['status']),
      raisedBy: EmergencyActorModel.fromJson(Json.asMap(json['raised_by'])),
      createdAt: Json.asDateTime(json['created_at']) ?? DateTime.now(),
      acknowledgedBy:
          acknowledgedBy == null ? null : EmergencyActorModel.fromJson(acknowledgedBy),
      acknowledgedAt: Json.asDateTime(json['acknowledged_at']),
    );
  }

  final String id;
  final EmergencyType type;
  final EmergencyStatus status;
  final EmergencyActorModel raisedBy;
  final DateTime createdAt;
  final EmergencyActorModel? acknowledgedBy;
  final DateTime? acknowledgedAt;

  EmergencyAlert toEntity() => EmergencyAlert(
        id: id,
        type: type,
        status: status,
        raisedBy: raisedBy.toEntity(),
        createdAt: createdAt,
        acknowledgedBy: acknowledgedBy?.toEntity(),
        acknowledgedAt: acknowledgedAt,
      );
}

/// DTO for `raised_by` / `acknowledged_by`.
class EmergencyActorModel {
  const EmergencyActorModel({required this.id, required this.name});

  factory EmergencyActorModel.fromJson(Map<String, dynamic> json) =>
      EmergencyActorModel(
        id: Json.asString(json['id']) ?? '',
        name: Json.asString(json['name']) ?? '',
      );

  final String id;
  final String name;

  EmergencyActor toEntity() => EmergencyActor(id: id, name: name);
}
