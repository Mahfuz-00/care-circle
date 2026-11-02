import '../../../../core/error/result.dart';
import '../entities/medication.dart';

/// The medication list of the active care circle.
abstract interface class MedicationRepository {
  /// `GET /mobile/v1/medications`.
  Future<Result<List<Medication>>> listMedications();
}
