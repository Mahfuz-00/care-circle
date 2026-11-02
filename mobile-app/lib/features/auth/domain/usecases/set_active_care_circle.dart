import '../../../../core/error/result.dart';
import '../repositories/auth_repository.dart';

/// Switches the care circle the app is showing.
class SetActiveCareCircle {
  const SetActiveCareCircle(this._repository);

  final AuthRepository _repository;

  Future<Result<void>> call(String careCircleId) =>
      _repository.setActiveCareCircle(careCircleId);
}
