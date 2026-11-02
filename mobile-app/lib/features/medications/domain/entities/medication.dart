import 'package:equatable/equatable.dart';

/// A medication tracked in a care circle (PRD §5.1).
class Medication extends Equatable {
  const Medication({
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

  final String id;

  /// Never truncated in the UI — always wrapped (AGENTS.md conventions).
  final String name;

  final String dosage;
  final String frequency;

  /// Daily reminder times, as sent by the API (e.g. `08:00`).
  final List<String> times;

  final bool withFood;

  /// Days of stock left, when the API can compute it.
  final int? daysRemaining;

  /// Whether the API flagged low stock.
  final bool isLowStock;

  final String? pharmacyName;
  final String? pharmacyPhone;

  /// Low stock either because the API says so, or because a week or less of
  /// stock is left (PRD §5.1: stock should never run out silently).
  bool get isRunningLow {
    if (isLowStock) return true;
    final int? days = daysRemaining;
    return days != null && days <= 7;
  }

  bool get hasPharmacyContact =>
      (pharmacyPhone != null && pharmacyPhone!.isNotEmpty) ||
      (pharmacyName != null && pharmacyName!.isNotEmpty);

  String get scheduleSummary {
    if (times.isEmpty) return frequency;
    return frequency.isEmpty ? times.join(', ') : '$frequency · ${times.join(', ')}';
  }

  @override
  List<Object?> get props => <Object?>[
        id,
        name,
        dosage,
        frequency,
        times,
        withFood,
        daysRemaining,
        isLowStock,
        pharmacyName,
        pharmacyPhone,
      ];
}
