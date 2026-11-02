import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/failure.dart';
import '../../../../core/error/result.dart';
import '../../domain/entities/care_circle_details.dart';
import '../../domain/usecases/get_care_circle.dart';
import 'care_circle_event.dart';
import 'care_circle_state.dart';

/// Shows the senior exactly who has access to their care circle (PRD §5.3).
class CareCircleBloc extends Bloc<CareCircleEvent, CareCircleState> {
  CareCircleBloc({required GetCareCircle getCareCircle})
      : _getCareCircle = getCareCircle,
        super(const CareCircleState()) {
    on<CareCircleRequested>(_onRequested);
    on<CareCircleRefreshed>(_onRefreshed);
  }

  final GetCareCircle _getCareCircle;

  Future<void> _onRequested(
    CareCircleRequested event,
    Emitter<CareCircleState> emit,
  ) =>
      _load(emit, showSpinner: state.details == null);

  Future<void> _onRefreshed(
    CareCircleRefreshed event,
    Emitter<CareCircleState> emit,
  ) =>
      _load(emit, showSpinner: false);

  Future<void> _load(Emitter<CareCircleState> emit, {required bool showSpinner}) async {
    if (showSpinner) emit(state.copyWith(status: CareCircleStatus.loading));

    final Result<CareCircleDetails> result = await _getCareCircle();

    switch (result) {
      case Ok<CareCircleDetails>(value: final CareCircleDetails details):
        emit(
          state.copyWith(
            status: CareCircleStatus.ready,
            details: details,
            message: null,
          ),
        );
      case Err<CareCircleDetails>(failure: final Failure failure):
        emit(
          state.copyWith(
            status: CareCircleStatus.error,
            message: failure.message,
          ),
        );
    }
  }
}
