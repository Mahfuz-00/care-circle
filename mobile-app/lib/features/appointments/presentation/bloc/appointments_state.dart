import 'package:equatable/equatable.dart';

import '../../domain/entities/appointment.dart';

enum AppointmentsStatus { initial, loading, ready, error }

class AppointmentsState extends Equatable {
  const AppointmentsState({
    this.status = AppointmentsStatus.initial,
    this.appointments = const <Appointment>[],
    this.message,
  });

  final AppointmentsStatus status;
  final List<Appointment> appointments;
  final String? message;

  bool get isLoading => status == AppointmentsStatus.loading;

  bool get hasFailed => status == AppointmentsStatus.error;

  AppointmentsState copyWith({
    AppointmentsStatus? status,
    List<Appointment>? appointments,
    String? message,
  }) =>
      AppointmentsState(
        status: status ?? this.status,
        appointments: appointments ?? this.appointments,
        message: message,
      );

  @override
  List<Object?> get props => <Object?>[status, appointments, message];
}
