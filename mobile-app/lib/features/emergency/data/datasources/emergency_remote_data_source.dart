import '../../../../core/network/api_client.dart';
import '../../domain/entities/emergency_alert.dart';
import '../models/emergency_alert_model.dart';

/// `/mobile/v1/emergency/*`.
abstract interface class EmergencyRemoteDataSource {
  Future<EmergencyAlertModel> raise({
    required EmergencyType type,
    double? latitude,
    double? longitude,
    String? locationLabel,
    String? note,
  });

  Future<EmergencyAlertModel> getAlert(String alertId);

  Future<void> acknowledge(String alertId);
}

class EmergencyRemoteDataSourceImpl implements EmergencyRemoteDataSource {
  const EmergencyRemoteDataSourceImpl(this._client);

  final ApiClient _client;

  @override
  Future<EmergencyAlertModel> raise({
    required EmergencyType type,
    double? latitude,
    double? longitude,
    String? locationLabel,
    String? note,
  }) async {
    final Map<String, dynamic> body = <String, dynamic>{
      'type': type.apiValue,
      'latitude': ?latitude,
      'longitude': ?longitude,
      if (locationLabel != null && locationLabel.isNotEmpty)
        'location_label': locationLabel,
      if (note != null && note.trim().isNotEmpty) 'note': note.trim(),
    };
    final Map<String, dynamic> response =
        await _client.postObject('/emergency', body: body);
    return EmergencyAlertModel.fromJson(response);
  }

  @override
  Future<EmergencyAlertModel> getAlert(String alertId) async {
    final Map<String, dynamic> response =
        await _client.getObject('/emergency/$alertId');
    return EmergencyAlertModel.fromJson(response);
  }

  @override
  Future<void> acknowledge(String alertId) =>
      _client.postNoContent('/emergency/$alertId/acknowledge');
}
