import '../../../../core/error/result.dart';
import '../entities/care_circle_details.dart';

/// Who has access to this care circle.
abstract interface class CareCircleRepository {
  /// `GET /mobile/v1/care-circle`.
  Future<Result<CareCircleDetails>> getCareCircle();
}
