import '../../../../core/error/result.dart';
import '../entities/today_summary.dart';
import '../repositories/today_repository.dart';

/// Loads the Today summary (doses, appointments, care circle, unread alerts).
class GetToday {
  const GetToday(this._repository);

  final TodayRepository _repository;

  Future<Result<TodaySummary>> call() => _repository.getToday();
}
