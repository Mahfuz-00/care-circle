import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/failure.dart';
import '../../../../core/error/result.dart';
import '../../domain/entities/appointment.dart';
import '../../domain/usecases/list_appointments.dart';
import 'appointments_event.dart';
import 'appointments_state.dart';

/// The appointment list (PRD §5.4).
class AppointmentsBloc extends Bloc<AppointmentsEvent, AppointmentsState> {
  AppointmentsBloc({required ListAppointments listAppointments})
      : _listAppointments = listAppointments,
        super(const AppointmentsState()) {
    on<AppointmentsRequested>(_onRequested);
    on<AppointmentsRefreshed>(_onRefreshed);
  }

  final ListAppointments _listAppointments;

  Future<void> _onRequested(
    AppointmentsRequested event,
    Emitter<AppointmentsState> emit,
  ) =>
      _load(emit, showSpinner: state.appointments.isEmpty);

  Future<void> _onRefreshed(
    AppointmentsRefreshed event,
    Emitter<AppointmentsState> emit,
  ) =>
      _load(emit, showSpinner: false);

  Future<void> _load(
    Emitter<AppointmentsState> emit, {
    required bool showSpinner,
  }) async {
    if (showSpinner) emit(state.copyWith(status: AppointmentsStatus.loading));

    final Result<List<Appointment>> result = await _listAppointments();

    switch (result) {
      case Ok<List<Appointment>>(value: final List<Appointment> appointments):
        emit(
          state.copyWith(
            status: AppointmentsStatus.ready,
            appointments: appointments,
            message: null,
          ),
        );
      case Err<List<Appointment>>(failure: final Failure failure):
        emit(
          state.copyWith(
            status: AppointmentsStatus.error,
            message: failure.message,
          ),
        );
    }
  }
}
