import '../../../../core/error/result.dart';
import '../entities/emergency_alert.dart';
import '../repositories/emergency_repository.dart';

/// Raises the alarm to the whole care circle.
class RaiseEmergency {
  const RaiseEmergency(this._repository);

  final EmergencyRepository _repository;

  Future<Result<EmergencyAlert>> call({
    required EmergencyType type,
    double? latitude,
    double? longitude,
    String? locationLabel,
    String? note,
  }) =>
      _repository.raise(
        type: type,
        latitude: latitude,
        longitude: longitude,
        locationLabel: locationLabel,
        note: note,
      );
}
