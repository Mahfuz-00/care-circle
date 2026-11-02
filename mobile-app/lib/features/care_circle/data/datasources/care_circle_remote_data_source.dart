import '../../../../core/network/api_client.dart';
import '../models/care_circle_details_model.dart';

/// `GET /mobile/v1/care-circle`.
abstract interface class CareCircleRemoteDataSource {
  Future<CareCircleDetailsModel> getCareCircle();
}

class CareCircleRemoteDataSourceImpl implements CareCircleRemoteDataSource {
  const CareCircleRemoteDataSourceImpl(this._client);

  final ApiClient _client;

  @override
  Future<CareCircleDetailsModel> getCareCircle() async {
    final Map<String, dynamic> body = await _client.getObject('/care-circle');
    return CareCircleDetailsModel.fromJson(body);
  }
}
