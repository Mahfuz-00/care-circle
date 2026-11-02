import '../../../../core/error/result.dart';
import '../entities/emergency_alert.dart';

/// Raising, reading and acknowledging emergency alerts (PRD §5.5).
abstract interface class EmergencyRepository {
  /// `POST /mobile/v1/emergency` — the single deliberate press.
  Future<Result<EmergencyAlert>> raise({
    required EmergencyType type,
    double? latitude,
    double? longitude,
    String? locationLabel,
    String? note,
  });

  /// `GET /mobile/v1/emergency/{id}`.
  Future<Result<EmergencyAlert>> getAlert(String alertId);

  /// `POST /mobile/v1/emergency/{id}/acknowledge`.
  Future<Result<void>> acknowledge(String alertId);
}
