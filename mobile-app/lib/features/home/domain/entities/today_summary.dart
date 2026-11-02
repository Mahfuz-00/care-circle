import 'package:equatable/equatable.dart';

import '../../../appointments/domain/entities/appointment.dart';
import '../../../auth/domain/entities/care_circle.dart';
import '../../../medications/domain/entities/dose.dart';

/// Everything the Today screen needs, from one call (PRD §5.1/§5.4/§5.3).
class TodaySummary extends Equatable {
  const TodaySummary({
    required this.doses,
    required this.appointments,
    required this.careCircle,
    required this.unreadAlerts,
  });

  /// Today's doses, in the order the API returned them (already time-sorted).
  final List<Dose> doses;

  /// Today's appointments (the API returns only today's on this endpoint).
  final List<Appointment> appointments;

  final CareCircle careCircle;
  final int unreadAlerts;

  List<Dose> get actionableDoses =>
      doses.where((Dose dose) => dose.needsAction).toList(growable: false);

  bool get hasAnythingToDo => actionableDoses.isNotEmpty || appointments.isNotEmpty;

  @override
  List<Object?> get props => <Object?>[doses, appointments, careCircle, unreadAlerts];
}
