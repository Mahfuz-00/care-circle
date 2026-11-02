import '../../../../core/error/result.dart';
import '../entities/today_summary.dart';

/// The Today view of the active care circle.
abstract interface class TodayRepository {
  /// `GET /mobile/v1/today`.
  Future<Result<TodaySummary>> getToday();
}
