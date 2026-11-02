import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/failure.dart';
import '../../../../core/error/result.dart';
import '../../domain/entities/emergency_alert.dart';
import '../../domain/usecases/acknowledge_emergency.dart';
import '../../domain/usecases/get_emergency_alert.dart';
import '../../domain/usecases/raise_emergency.dart';
import 'emergency_event.dart';
import 'emergency_state.dart';

/// Raises and tracks the emergency alert.
///
/// Safety rules encoded here:
/// * a press while an alert is still open never creates a second alert;
/// * a press already in flight is never duplicated by an impatient double tap;
/// * the raised alert stays in state, so the senior always sees that help was
///   asked for and whether someone has answered.
class EmergencyBloc extends Bloc<EmergencyEvent, EmergencyState> {
  EmergencyBloc({
    required RaiseEmergency raiseEmergency,
    required GetEmergencyAlert getEmergencyAlert,
    required AcknowledgeEmergency acknowledgeEmergency,
  })  : _raiseEmergency = raiseEmergency,
        _getEmergencyAlert = getEmergencyAlert,
        _acknowledgeEmergency = acknowledgeEmergency,
        super(const EmergencyState()) {
    on<EmergencyRaiseRequested>(_onRaiseRequested);
    on<EmergencyAlertRequested>(_onAlertRequested);
    on<EmergencyAcknowledgeRequested>(_onAcknowledgeRequested);
    on<EmergencyMessageCleared>(_onMessageCleared);
    on<EmergencyReset>(_onReset);
  }

  final RaiseEmergency _raiseEmergency;
  final GetEmergencyAlert _getEmergencyAlert;
  final AcknowledgeEmergency _acknowledgeEmergency;

  Future<void> _onRaiseRequested(
    EmergencyRaiseRequested event,
    Emitter<EmergencyState> emit,
  ) async {
    if (state.isRaising) return;
    if (state.isWaitingForHelp) {
      emit(
        state.copyWith(
          message: 'Your care circle already has your alert.',
          messageIsError: false,
        ),
      );
      return;
    }

    emit(
      state.copyWith(
        phase: EmergencyPhase.raising,
        requestedType: event.type,
        busy: true,
        message: null,
        messageIsError: false,
      ),
    );

    final Result<EmergencyAlert> result = await _raiseEmergency(
      type: event.type,
      latitude: event.latitude,
      longitude: event.longitude,
      locationLabel: event.locationLabel,
      note: event.note,
    );

    switch (result) {
      case Ok<EmergencyAlert>(value: final EmergencyAlert alert):
        emit(
          EmergencyState(
            phase: EmergencyPhase.active,
            alert: alert,
            message: 'Your care circle has been told you need help.',
          ),
        );
      case Err<EmergencyAlert>(failure: final Failure failure):
        emit(
          EmergencyState(
            phase: EmergencyPhase.failed,
            message: failure.message,
            messageIsError: true,
          ),
        );
    }
  }

  Future<void> _onAlertRequested(
    EmergencyAlertRequested event,
    Emitter<EmergencyState> emit,
  ) async {
    final EmergencyAlert? current = state.alert;
    if (current == null) return;

    emit(state.copyWith(refreshing: true));
    final Result<EmergencyAlert> result = await _getEmergencyAlert(current.id);

    switch (result) {
      case Ok<EmergencyAlert>(value: final EmergencyAlert alert):
        emit(
          state.copyWith(
            refreshing: false,
            alert: alert,
            phase: EmergencyPhase.active,
          ),
        );
      case Err<EmergencyAlert>(failure: final Failure failure):
        emit(
          state.copyWith(
            refreshing: false,
            message: failure.message,
            messageIsError: true,
          ),
        );
    }
  }

  Future<void> _onAcknowledgeRequested(
    EmergencyAcknowledgeRequested event,
    Emitter<EmergencyState> emit,
  ) async {
    final EmergencyAlert? current = state.alert;
    if (current == null || state.busy) return;

    emit(state.copyWith(busy: true, message: null, messageIsError: false));

    final Result<void> result = await _acknowledgeEmergency(current.id);

    switch (result) {
      case Ok<void>():
        final Result<EmergencyAlert> refreshed = await _getEmergencyAlert(current.id);
        emit(
          state.copyWith(
            busy: false,
            alert: refreshed.valueOrNull,
            message: 'Marked as answered.',
          ),
        );
      case Err<void>(failure: final Failure failure):
        emit(
          state.copyWith(
            busy: false,
            message: failure.message,
            messageIsError: true,
          ),
        );
    }
  }

  void _onMessageCleared(EmergencyMessageCleared event, Emitter<EmergencyState> emit) {
    if (state.message == null) return;
    emit(state.copyWith(message: null, messageIsError: false));
  }

  void _onReset(EmergencyReset event, Emitter<EmergencyState> emit) {
    emit(const EmergencyState());
  }
}
