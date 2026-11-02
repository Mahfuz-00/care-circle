import '../../../../core/network/api_client.dart';
import '../models/today_summary_model.dart';

/// `GET /mobile/v1/today`.
abstract interface class TodayRemoteDataSource {
  Future<TodaySummaryModel> getToday();
}

class TodayRemoteDataSourceImpl implements TodayRemoteDataSource {
  const TodayRemoteDataSourceImpl(this._client);

  final ApiClient _client;

  @override
  Future<TodaySummaryModel> getToday() async {
    final Map<String, dynamic> body = await _client.getObject('/today');
    return TodaySummaryModel.fromJson(body);
  }
}
