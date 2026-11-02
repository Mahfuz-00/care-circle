import 'package:equatable/equatable.dart';

/// The situations a senior can report with the emergency button (PRD §5.5).
///
/// These are situation labels only — the app never suggests a diagnosis.
enum EmergencyType {
  medical('medical', 'Medical help'),
  fall('fall', 'I have fallen'),
  heartAttack('heart_attack', 'Heart attack'),
  severeSymptoms('severe_symptoms', 'Severe symptoms'),
  other('other', 'Something else');

  const EmergencyType(this.apiValue, this.label);

  final String apiValue;
  final String label;

  static EmergencyType fromApi(Object? value) {
    if (value is! String) return EmergencyType.other;
    for (final EmergencyType type in values) {
      if (type.apiValue == value) return type;
    }
    return EmergencyType.other;
  }
}

/// Lifecycle of an emergency alert.
enum EmergencyStatus {
  open('open', 'Waiting for someone to answer'),
  acknowledged('acknowledged', 'Someone is coming'),
  resolved('resolved', 'Closed'),
  cancelled('cancelled', 'Cancelled');

  const EmergencyStatus(this.apiValue, this.label);

  final String apiValue;
  final String label;

  static EmergencyStatus fromApi(Object? value) {
    if (value is! String) return EmergencyStatus.open;
    for (final EmergencyStatus status in values) {
      if (status.apiValue == value) return status;
    }
    return EmergencyStatus.open;
  }

  bool get isWaitingForHelp => this == EmergencyStatus.open;
}

/// Someone in the care circle.
class EmergencyActor extends Equatable {
  const EmergencyActor({required this.id, required this.name});

  final String id;
  final String name;

  @override
  List<Object?> get props => <Object?>[id, name];
}

/// An emergency raised by a senior (PRD §5.5, PRD §13).
class EmergencyAlert extends Equatable {
  const EmergencyAlert({
    required this.id,
    required this.type,
    required this.status,
    required this.raisedBy,
    required this.createdAt,
    this.acknowledgedBy,
    this.acknowledgedAt,
  });

  final String id;
  final EmergencyType type;
  final EmergencyStatus status;
  final EmergencyActor raisedBy;
  final DateTime createdAt;
  final EmergencyActor? acknowledgedBy;
  final DateTime? acknowledgedAt;

  bool get isAcknowledged => acknowledgedBy != null;

  @override
  List<Object?> get props => <Object?>[
        id,
        type,
        status,
        raisedBy,
        createdAt,
        acknowledgedBy,
        acknowledgedAt,
      ];
}
