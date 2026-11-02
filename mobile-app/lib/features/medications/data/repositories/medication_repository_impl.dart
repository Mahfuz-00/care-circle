import '../../../../core/error/result.dart';
import '../../../../core/network/failure_mapper.dart';
import '../../domain/entities/medication.dart';
import '../../domain/repositories/medication_repository.dart';
import '../datasources/medication_remote_data_source.dart';
import '../models/medication_model.dart';

class MedicationRepositoryImpl implements MedicationRepository {
  const MedicationRepositoryImpl(this._remote);

  final MedicationRemoteDataSource _remote;

  @override
  Future<Result<List<Medication>>> listMedications() async {
    try {
      final List<MedicationModel> models = await _remote.listMedications();
      return Ok<List<Medication>>(
        models.map((MedicationModel model) => model.toEntity()).toList(growable: false),
      );
    } catch (error) {
      return Err<List<Medication>>(failureFromException(error));
    }
  }
}
