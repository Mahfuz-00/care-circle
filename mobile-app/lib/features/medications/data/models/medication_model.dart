import '../../../../core/network/json.dart';
import '../../domain/entities/medication.dart';

/// DTO for `GET /mobile/v1/medications`.
class MedicationModel {
  const MedicationModel({
    required this.id,
    required this.name,
    required this.dosage,
    required this.frequency,
    required this.times,
    required this.withFood,
    this.daysRemaining,
    this.isLowStock = false,
    this.pharmacyName,
    this.pharmacyPhone,
  });

  factory MedicationModel.fromJson(Map<String, dynamic> json) => MedicationModel(
        id: Json.requiredString(json['id'], 'medication.id'),
        name: Json.asString(json['name']) ?? '',
        dosage: Json.asString(json['dosage']) ?? '',
        frequency: Json.asString(json['frequency']) ?? '',
        times: Json.asStringList(json['times']),
        withFood: Json.asBool(json['with_food']),
        daysRemaining: Json.asInt(json['days_remaining']),
        isLowStock: Json.asBool(json['is_low_stock']),
        pharmacyName: Json.asString(json['pharmacy_name']),
        pharmacyPhone: Json.asString(json['pharmacy_phone']),
      );

  final String id;
  final String name;
  final String dosage;
  final String frequency;
  final List<String> times;
  final bool withFood;
  final int? daysRemaining;
  final bool isLowStock;
  final String? pharmacyName;
  final String? pharmacyPhone;

  Medication toEntity() => Medication(
        id: id,
        name: name,
        dosage: dosage,
        frequency: frequency,
        times: times,
        withFood: withFood,
        daysRemaining: daysRemaining,
        isLowStock: isLowStock,
        pharmacyName: pharmacyName,
        pharmacyPhone: pharmacyPhone,
      );
}
