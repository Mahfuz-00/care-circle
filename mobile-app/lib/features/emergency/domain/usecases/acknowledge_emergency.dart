import '../../../../core/error/result.dart';
import '../repositories/emergency_repository.dart';

/// Records that a caregiver has seen the alert (PRD §5.5).
class AcknowledgeEmergency {
  const AcknowledgeEmergency(this._repository);

  final EmergencyRepository _repository;

  Future<Result<void>> call(String alertId) => _repository.acknowledge(alertId);
}
