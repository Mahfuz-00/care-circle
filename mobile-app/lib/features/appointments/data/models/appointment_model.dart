import '../../../../core/network/json.dart';
import '../../domain/entities/appointment.dart';

/// DTO for `GET /mobile/v1/appointments`.
class AppointmentModel {
  const AppointmentModel({
    required this.id,
    required this.title,
    required this.type,
    required this.location,
    required this.startsAt,
    this.notes,
  });

  factory AppointmentModel.fromJson(Map<String, dynamic> json) => AppointmentModel(
        id: Json.requiredString(json['id'], 'appointment.id'),
        title: Json.asString(json['title']) ?? '',
        type: Json.asString(json['type']) ?? '',
        location: Json.asString(json['location']) ?? '',
        startsAt: Json.asDateTime(json['starts_at']) ?? DateTime.now(),
        notes: Json.asString(json['notes']),
      );

  final String id;
  final String title;
  final String type;
  final String location;
  final DateTime startsAt;
  final String? notes;

  Appointment toEntity() => Appointment(
        id: id,
        title: title,
        type: type,
        location: location,
        startsAt: startsAt,
        notes: notes,
      );
}
