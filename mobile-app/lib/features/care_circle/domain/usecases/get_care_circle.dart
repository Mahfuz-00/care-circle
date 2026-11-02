import '../../../../core/error/result.dart';
import '../entities/care_circle_details.dart';
import '../repositories/care_circle_repository.dart';

/// Loads the care circle and its members.
class GetCareCircle {
  const GetCareCircle(this._repository);

  final CareCircleRepository _repository;

  Future<Result<CareCircleDetails>> call() => _repository.getCareCircle();
}
