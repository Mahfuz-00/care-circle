import '../../../../core/error/result.dart';
import '../entities/medication.dart';
import '../repositories/medication_repository.dart';

/// Loads every medication in the active care circle.
class ListMedications {
  const ListMedications(this._repository);

  final MedicationRepository _repository;

  Future<Result<List<Medication>>> call() => _repository.listMedications();
}
