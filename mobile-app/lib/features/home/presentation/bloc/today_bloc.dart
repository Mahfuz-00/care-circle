import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/failure.dart';
import '../../../../core/error/result.dart';
import '../../../medications/domain/usecases/skip_dose.dart';
import '../../../medications/domain/usecases/snooze_dose.dart';
import '../../../medications/domain/usecases/take_dose.dart';
import '../../domain/entities/today_summary.dart';
import '../../domain/usecases/get_today.dart';
import 'today_event.dart';
import 'today_state.dart';

/// The Today view: today's doses, today's appointments, and the one-tap dose
/// actions (PRD §5.1, §13).
///
/// It composes the medications domain's dose use cases so the dose state
/// machine lives in exactly one place, reachable from both the home screen and
/// a notification action.
class TodayBloc extends Bloc<TodayEvent, TodayState> {
  TodayBloc({
    required GetToday getToday,
    required TakeDose takeDose,
    required SkipDose skipDose,
    required SnoozeDose snoozeDose,
  })  : _getToday = getToday,
        _takeDose = takeDose,
        _skipDose = skipDose,
        _snoozeDose = snoozeDose,
        super(const TodayState()) {
    on<TodayRequested>(_onRequested);
    on<TodayRefreshed>(_onRefreshed);
    on<TodayTakeDoseRequested>(_onTakeDose);
    on<TodaySkipDoseRequested>(_onSkipDose);
    on<TodaySnoozeDoseRequested>(_onSnoozeDose);
    on<TodayMessageCleared>(_onMessageCleared);
  }

  final GetToday _getToday;
  final TakeDose _takeDose;
  final SkipDose _skipDose;
  final SnoozeDose _snoozeDose;

  Future<void> _onRequested(TodayRequested event, Emitter<TodayState> emit) =>
      _load(emit, keepContent: false);

  Future<void> _onRefreshed(TodayRefreshed event, Emitter<TodayState> emit) =>
      _load(emit, keepContent: true);

  Future<void> _onTakeDose(
    TodayTakeDoseRequested event,
    Emitter<TodayState> emit,
  ) =>
      _runDoseAction(
        emit,
        doseId: event.doseId,
        action: () => _takeDose(doseId: event.doseId, photoBase64: event.photoBase64),
        successMessage: 'Dose marked as taken.',
      );

  Future<void> _onSkipDose(
    TodaySkipDoseRequested event,
    Emitter<TodayState> emit,
  ) =>
      _runDoseAction(
        emit,
        doseId: event.doseId,
        action: () => _skipDose(doseId: event.doseId, reason: event.reason),
        successMessage: 'Dose marked as skipped.',
      );

  Future<void> _onSnoozeDose(
    TodaySnoozeDoseRequested event,
    Emitter<TodayState> emit,
  ) =>
      _runDoseAction(
        emit,
        doseId: event.doseId,
        action: () => _snoozeDose(doseId: event.doseId, minutes: event.minutes),
        successMessage: 'Snoozed for ${event.minutes} minutes.',
      );

  void _onMessageCleared(TodayMessageCleared event, Emitter<TodayState> emit) {
    if (state.message == null) return;
    emit(state.copyWith(message: null, messageIsError: false));
  }

  /// Runs one dose action, then reloads so the list matches the server.
  Future<void> _runDoseAction(
    Emitter<TodayState> emit, {
    required String doseId,
    required Future<Result<void>> Function() action,
    required String successMessage,
  }) async {
    if (state.isDoseBusy(doseId)) return;

    emit(
      state.copyWith(
        busyDoseIds: <String>{...state.busyDoseIds, doseId},
        message: null,
        messageIsError: false,
      ),
    );

    final Result<void> result = await action();
    final Set<String> busy = <String>{...state.busyDoseIds}..remove(doseId);

    switch (result) {
      case Ok<void>():
        emit(
          state.copyWith(
            busyDoseIds: busy,
            message: successMessage,
            messageIsError: false,
          ),
        );
        await _load(emit, keepContent: true);
      case Err<void>(failure: final Failure failure):
        emit(
          state.copyWith(
            busyDoseIds: busy,
            message: failure.message,
            messageIsError: true,
          ),
        );
    }
  }

  /// Loads `/today`. [keepContent] keeps the current list on screen while the
  /// refresh is in flight (so the emergency button and doses never disappear).
  Future<void> _load(Emitter<TodayState> emit, {required bool keepContent}) async {
    if (!keepContent || state.summary == null) {
      emit(state.copyWith(status: TodayStatus.loading));
    }

    final Result<TodaySummary> result = await _getToday();

    switch (result) {
      case Ok<TodaySummary>(value: final TodaySummary summary):
        emit(
          state.copyWith(
            status: TodayStatus.ready,
            summary: summary,
            busyDoseIds: const <String>{},
          ),
        );
      case Err<TodaySummary>(failure: final Failure failure):
        emit(
          state.copyWith(
            status: TodayStatus.error,
            message: failure.message,
            messageIsError: true,
          ),
        );
    }
  }
}
