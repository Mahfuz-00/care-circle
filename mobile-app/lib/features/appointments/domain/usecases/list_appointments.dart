import '../../../../core/error/result.dart';
import '../entities/appointment.dart';
import '../repositories/appointment_repository.dart';

/// Loads upcoming appointments.
class ListAppointments {
  const ListAppointments(this._repository);

  final AppointmentRepository _repository;

  Future<Result<List<Appointment>>> call() => _repository.listAppointments();
}
