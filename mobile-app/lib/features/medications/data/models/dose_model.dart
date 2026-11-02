import '../../../../core/network/json.dart';
import '../../domain/entities/dose.dart';

/// DTO for the dose objects returned by `/today` and the dose actions.
class DoseModel {
  const DoseModel({
    required this.id,
    required this.medication,
    required this.scheduledFor,
    required this.status,
    this.takenAt,
    this.skipReason,
  });

  factory DoseModel.fromJson(Map<String, dynamic> json) {
    final Map<String, dynamic> medication = Json.asMap(json['medication']);
    return DoseModel(
      id: Json.requiredString(json['id'], 'dose.id'),
      medication: DoseMedicationModel.fromJson(medication),
      scheduledFor: Json.asDateTime(json['scheduled_for']) ?? DateTime.now(),
      status: DoseStatus.fromApi(json['status']),
      takenAt: Json.asDateTime(json['taken_at']),
      skipReason: Json.asString(json['skip_reason']),
    );
  }

  final String id;
  final DoseMedicationModel medication;
  final DateTime scheduledFor;
  final DoseStatus status;
  final DateTime? takenAt;
  final String? skipReason;

  Dose toEntity() => Dose(
        id: id,
        medication: medication.toEntity(),
        scheduledFor: scheduledFor,
        status: status,
        takenAt: takenAt,
        skipReason: skipReason,
      );
}

/// DTO for the medication summary embedded in a dose.
class DoseMedicationModel {
  const DoseMedicationModel({
    required this.id,
    required this.name,
    required this.dosage,
  });

  factory DoseMedicationModel.fromJson(Map<String, dynamic> json) =>
      DoseMedicationModel(
        id: Json.asString(json['id']) ?? '',
        name: Json.asString(json['name']) ?? '',
        dosage: Json.asString(json['dosage']) ?? '',
      );

  final String id;
  final String name;
  final String dosage;

  DoseMedication toEntity() =>
      DoseMedication(id: id, name: name, dosage: dosage);
}
