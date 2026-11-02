import '../../../../core/error/result.dart';
import '../entities/emergency_alert.dart';
import '../repositories/emergency_repository.dart';

/// Re-reads an alert so the screen can show who answered.
class GetEmergencyAlert {
  const GetEmergencyAlert(this._repository);

  final EmergencyRepository _repository;

  Future<Result<EmergencyAlert>> call(String alertId) =>
      _repository.getAlert(alertId);
}
