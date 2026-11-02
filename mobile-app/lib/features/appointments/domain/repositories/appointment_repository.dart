import '../../../../core/error/result.dart';
import '../entities/appointment.dart';

/// Appointments for the active care circle.
abstract interface class AppointmentRepository {
  /// `GET /mobile/v1/appointments`.
  Future<Result<List<Appointment>>> listAppointments();
}
