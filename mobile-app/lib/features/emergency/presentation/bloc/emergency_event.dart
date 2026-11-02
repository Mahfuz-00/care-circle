import 'package:equatable/equatable.dart';

import '../../domain/entities/emergency_alert.dart';

/// Events for the emergency button (PRD §5.5).
sealed class EmergencyEvent extends Equatable {
  const EmergencyEvent();

  @override
  List<Object?> get props => const <Object?>[];
}

/// One deliberate press raises exactly one alert.
final class EmergencyRaiseRequested extends EmergencyEvent {
  const EmergencyRaiseRequested({
    required this.type,
    this.latitude,
    this.longitude,
    this.locationLabel,
    this.note,
  });

  final EmergencyType type;
  final double? latitude;
  final double? longitude;
  final String? locationLabel;
  final String? note;

  @override
  List<Object?> get props => <Object?>[type, latitude, longitude, locationLabel, note];
}

/// Re-read the alert so the screen can show who answered.
final class EmergencyAlertRequested extends EmergencyEvent {
  const EmergencyAlertRequested();
}

/// A caregiver confirms they have seen the alert.
final class EmergencyAcknowledgeRequested extends EmergencyEvent {
  const EmergencyAcknowledgeRequested();
}

final class EmergencyMessageCleared extends EmergencyEvent {
  const EmergencyMessageCleared();
}

/// Forgets the finished alert so a new one can be raised.
final class EmergencyReset extends EmergencyEvent {
  const EmergencyReset();
}
