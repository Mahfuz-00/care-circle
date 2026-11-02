import '../../../../core/network/api_client.dart';

/// The three one-tap dose actions.
abstract interface class DoseRemoteDataSource {
  Future<void> takeDose({required String doseId, String? photoBase64});

  Future<void> skipDose({required String doseId, String? reason});

  Future<void> snoozeDose({required String doseId, required int minutes});
}

class DoseRemoteDataSourceImpl implements DoseRemoteDataSource {
  const DoseRemoteDataSourceImpl(this._client);

  final ApiClient _client;

  @override
  Future<void> takeDose({required String doseId, String? photoBase64}) {
    final Map<String, dynamic> body = <String, dynamic>{
      if (photoBase64 != null && photoBase64.isNotEmpty) 'photo': photoBase64,
    };
    return _client.postNoContent('/doses/$doseId/take', body: body);
  }

  @override
  Future<void> skipDose({required String doseId, String? reason}) {
    final Map<String, dynamic> body = <String, dynamic>{
      if (reason != null && reason.trim().isNotEmpty) 'reason': reason.trim(),
    };
    return _client.postNoContent('/doses/$doseId/skip', body: body);
  }

  @override
  Future<void> snoozeDose({required String doseId, required int minutes}) =>
      _client.postNoContent(
        '/doses/$doseId/snooze',
        body: <String, dynamic>{'minutes': minutes},
      );
}
