import '../../../../core/error/result.dart';
import '../repositories/dose_repository.dart';

/// Marks a dose as taken — one tap, from notification or screen.
class TakeDose {
  const TakeDose(this._repository);

  final DoseRepository _repository;

  Future<Result<void>> call({required String doseId, String? photoBase64}) =>
      _repository.takeDose(doseId: doseId, photoBase64: photoBase64);
}
