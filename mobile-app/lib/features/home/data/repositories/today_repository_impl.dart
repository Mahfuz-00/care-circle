import '../../../../core/error/result.dart';
import '../../../../core/network/failure_mapper.dart';
import '../../domain/entities/today_summary.dart';
import '../../domain/repositories/today_repository.dart';
import '../datasources/today_remote_data_source.dart';
import '../models/today_summary_model.dart';

class TodayRepositoryImpl implements TodayRepository {
  const TodayRepositoryImpl(this._remote);

  final TodayRemoteDataSource _remote;

  @override
  Future<Result<TodaySummary>> getToday() async {
    try {
      final TodaySummaryModel model = await _remote.getToday();
      return Ok<TodaySummary>(model.toEntity());
    } catch (error) {
      return Err<TodaySummary>(failureFromException(error));
    }
  }
}
