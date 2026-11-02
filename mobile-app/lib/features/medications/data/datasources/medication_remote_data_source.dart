import '../../../../core/network/api_client.dart';
import '../models/medication_model.dart';

/// `GET /mobile/v1/medications`.
abstract interface class MedicationRemoteDataSource {
  Future<List<MedicationModel>> listMedications();
}

class MedicationRemoteDataSourceImpl implements MedicationRemoteDataSource {
  const MedicationRemoteDataSourceImpl(this._client);

  final ApiClient _client;

  @override
  Future<List<MedicationModel>> listMedications() async {
    final List<Map<String, dynamic>> body = await _client.getObjects('/medications');
    return body.map(MedicationModel.fromJson).toList(growable: false);
  }
}
