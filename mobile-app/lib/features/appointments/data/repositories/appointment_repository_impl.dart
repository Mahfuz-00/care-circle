import '../../../../core/error/result.dart';
import '../../../../core/network/failure_mapper.dart';
import '../../domain/entities/appointment.dart';
import '../../domain/repositories/appointment_repository.dart';
import '../datasources/appointment_remote_data_source.dart';
import '../models/appointment_model.dart';

class AppointmentRepositoryImpl implements AppointmentRepository {
  const AppointmentRepositoryImpl(this._remote);

  final AppointmentRemoteDataSource _remote;

  @override
  Future<Result<List<Appointment>>> listAppointments() async {
    try {
      final List<AppointmentModel> models = await _remote.listAppointments();
      return Ok<List<Appointment>>(
        models
            .map((AppointmentModel model) => model.toEntity())
            .toList(growable: false),
      );
    } catch (error) {
      return Err<List<Appointment>>(failureFromException(error));
    }
  }
}
