import '../../../../core/network/api_client.dart';
import '../models/appointment_model.dart';

/// `GET /mobile/v1/appointments`.
abstract interface class AppointmentRemoteDataSource {
  Future<List<AppointmentModel>> listAppointments();
}

class AppointmentRemoteDataSourceImpl implements AppointmentRemoteDataSource {
  const AppointmentRemoteDataSourceImpl(this._client);

  final ApiClient _client;

  @override
  Future<List<AppointmentModel>> listAppointments() async {
    final List<Map<String, dynamic>> body = await _client.getObjects('/appointments');
    return body.map(AppointmentModel.fromJson).toList(growable: false);
  }
}
