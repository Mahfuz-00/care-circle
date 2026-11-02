import 'package:equatable/equatable.dart';

/// Status of a scheduled dose (PRD §5.1).
enum DoseStatus {
  pending('pending', 'Due now'),
  snoozed('snoozed', 'Snoozed'),
  taken('taken', 'Taken'),
  skipped('skipped', 'Skipped'),
  missed('missed', 'Missed');

  const DoseStatus(this.apiValue, this.label);

  final String apiValue;
  final String label;

  static DoseStatus fromApi(Object? value) {
    if (value is! String) return DoseStatus.pending;
    for (final DoseStatus status in values) {
      if (status.apiValue == value) return status;
    }
    return DoseStatus.pending;
  }

  /// Whether the person can still act on this dose in one tap.
  bool get needsAction => this == DoseStatus.pending || this == DoseStatus.snoozed;
}

/// The medication a dose belongs to, as embedded in `/today`.
class DoseMedication extends Equatable {
  const DoseMedication({
    required this.id,
    required this.name,
    required this.dosage,
  });

  final String id;
  final String name;
  final String dosage;

  @override
  List<Object?> get props => <Object?>[id, name, dosage];
}

/// One scheduled intake.
class Dose extends Equatable {
  const Dose({
    required this.id,
    required this.medication,
    required this.scheduledFor,
    required this.status,
    this.takenAt,
    this.skipReason,
  });

  final String id;
  final DoseMedication medication;
  final DateTime scheduledFor;
  final DoseStatus status;
  final DateTime? takenAt;
  final String? skipReason;

  bool get needsAction => status.needsAction;

  /// Overdue = still pending/snoozed and the scheduled time has passed.
  bool isOverdue(DateTime now) => needsAction && scheduledFor.isBefore(now);

  @override
  List<Object?> get props =>
      <Object?>[id, medication, scheduledFor, status, takenAt, skipReason];
}
