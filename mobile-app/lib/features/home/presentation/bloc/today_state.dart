import 'package:equatable/equatable.dart';

import '../../domain/entities/today_summary.dart';

const Object _unset = Object();

enum TodayStatus { initial, loading, ready, error }

class TodayState extends Equatable {
  const TodayState({
    this.status = TodayStatus.initial,
    this.summary,
    this.busyDoseIds = const <String>{},
    this.message,
    this.messageIsError = false,
  });

  final TodayStatus status;
  final TodaySummary? summary;

  /// Doses with an action in flight — their buttons show a spinner and are
  /// disabled so a dose can never be marked twice by an accidental double tap.
  final Set<String> busyDoseIds;

  /// Confirmation or problem, shown in a live-region banner and announced.
  final String? message;

  final bool messageIsError;

  bool get isLoading => status == TodayStatus.loading;

  bool get isRefreshing => status == TodayStatus.loading && summary != null;

  bool get hasFailed => status == TodayStatus.error;

  bool isDoseBusy(String doseId) => busyDoseIds.contains(doseId);

  TodayState copyWith({
    TodayStatus? status,
    Object? summary = _unset,
    Set<String>? busyDoseIds,
    Object? message = _unset,
    bool? messageIsError,
  }) =>
      TodayState(
        status: status ?? this.status,
        summary: identical(summary, _unset) ? this.summary : summary as TodaySummary?,
        busyDoseIds: busyDoseIds ?? this.busyDoseIds,
        message: identical(message, _unset) ? this.message : message as String?,
        messageIsError: messageIsError ?? this.messageIsError,
      );

  @override
  List<Object?> get props =>
      <Object?>[status, summary, busyDoseIds, message, messageIsError];
}
