import '../../../../core/error/result.dart';

/// The one-tap dose actions (PRD §5.1, PRD §13).
///
/// Each action is a single call: it can be triggered from a notification
/// action or from the screen without extra navigation.
abstract interface class DoseRepository {
  /// `POST /mobile/v1/doses/{id}/take`.
  ///
  /// [photoBase64] carries the optional photo confirmation when the client has
  /// one; the API treats it as optional (`{photo?}`).
  Future<Result<void>> takeDose({required String doseId, String? photoBase64});

  /// `POST /mobile/v1/doses/{id}/skip` — the reason is recorded when given
  /// (PRD §7: skipped actions are recorded with the reason).
  Future<Result<void>> skipDose({required String doseId, String? reason});

  /// `POST /mobile/v1/doses/{id}/snooze`.
  Future<Result<void>> snoozeDose({required String doseId, required int minutes});
}
