import '../../../../core/error/result.dart';
import '../repositories/dose_repository.dart';

/// Marks a dose as skipped, recording the reason when the person gives one.
class SkipDose {
  const SkipDose(this._repository);

  final DoseRepository _repository;

  Future<Result<void>> call({required String doseId, String? reason}) =>
      _repository.skipDose(doseId: doseId, reason: reason);
}
