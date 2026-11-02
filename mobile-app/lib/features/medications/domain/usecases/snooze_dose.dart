import '../../../../core/error/result.dart';
import '../repositories/dose_repository.dart';

/// Pushes a dose back by [minutes].
class SnoozeDose {
  const SnoozeDose(this._repository);

  final DoseRepository _repository;

  Future<Result<void>> call({required String doseId, required int minutes}) =>
      _repository.snoozeDose(doseId: doseId, minutes: minutes);
}
