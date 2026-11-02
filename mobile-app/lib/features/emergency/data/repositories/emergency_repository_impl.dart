import '../../../../core/error/result.dart';
import '../../../../core/network/failure_mapper.dart';
import '../../domain/entities/emergency_alert.dart';
import '../../domain/repositories/emergency_repository.dart';
import '../datasources/emergency_remote_data_source.dart';
import '../models/emergency_alert_model.dart';

class EmergencyRepositoryImpl implements EmergencyRepository {
  const EmergencyRepositoryImpl(this._remote);

  final EmergencyRemoteDataSource _remote;

  @override
  Future<Result<EmergencyAlert>> raise({
    required EmergencyType type,
    double? latitude,
    double? longitude,
    String? locationLabel,
    String? note,
  }) async {
    try {
      final EmergencyAlertModel model = await _remote.raise(
        type: type,
        latitude: latitude,
        longitude: longitude,
        locationLabel: locationLabel,
        note: note,
      );
      return Ok<EmergencyAlert>(model.toEntity());
    } catch (error) {
      return Err<EmergencyAlert>(failureFromException(error));
    }
  }

  @override
  Future<Result<EmergencyAlert>> getAlert(String alertId) async {
    try {
      final EmergencyAlertModel model = await _remote.getAlert(alertId);
      return Ok<EmergencyAlert>(model.toEntity());
    } catch (error) {
      return Err<EmergencyAlert>(failureFromException(error));
    }
  }

  @override
  Future<Result<void>> acknowledge(String alertId) async {
    try {
      await _remote.acknowledge(alertId);
      return const Ok<void>(null);
    } catch (error) {
      return Err<void>(failureFromException(error));
    }
  }
}
