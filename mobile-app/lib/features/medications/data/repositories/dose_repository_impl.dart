import '../../../../core/error/result.dart';
import '../../../../core/network/failure_mapper.dart';
import '../../domain/repositories/dose_repository.dart';
import '../datasources/dose_remote_data_source.dart';

/// The API answers dose actions with the updated dose; the app reloads
/// `/today` afterwards, so only success or failure matters here.
class DoseRepositoryImpl implements DoseRepository {
  const DoseRepositoryImpl(this._remote);

  final DoseRemoteDataSource _remote;

  @override
  Future<Result<void>> takeDose({required String doseId, String? photoBase64}) async {
    try {
      await _remote.takeDose(doseId: doseId, photoBase64: photoBase64);
      return const Ok<void>(null);
    } catch (error) {
      return Err<void>(failureFromException(error));
    }
  }

  @override
  Future<Result<void>> skipDose({required String doseId, String? reason}) async {
    try {
      await _remote.skipDose(doseId: doseId, reason: reason);
      return const Ok<void>(null);
    } catch (error) {
      return Err<void>(failureFromException(error));
    }
  }

  @override
  Future<Result<void>> snoozeDose({required String doseId, required int minutes}) async {
    try {
      await _remote.snoozeDose(doseId: doseId, minutes: minutes);
      return const Ok<void>(null);
    } catch (error) {
      return Err<void>(failureFromException(error));
    }
  }
}
