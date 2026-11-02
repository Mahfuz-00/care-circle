import '../../../../core/error/result.dart';
import '../../../../core/network/failure_mapper.dart';
import '../../domain/entities/care_circle_details.dart';
import '../../domain/repositories/care_circle_repository.dart';
import '../datasources/care_circle_remote_data_source.dart';
import '../models/care_circle_details_model.dart';

class CareCircleRepositoryImpl implements CareCircleRepository {
  const CareCircleRepositoryImpl(this._remote);

  final CareCircleRemoteDataSource _remote;

  @override
  Future<Result<CareCircleDetails>> getCareCircle() async {
    try {
      final CareCircleDetailsModel model = await _remote.getCareCircle();
      return Ok<CareCircleDetails>(model.toEntity());
    } catch (error) {
      return Err<CareCircleDetails>(failureFromException(error));
    }
  }
}
