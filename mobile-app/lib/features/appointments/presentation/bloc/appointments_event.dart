import 'package:equatable/equatable.dart';

/// Events for the appointment list.
sealed class AppointmentsEvent extends Equatable {
  const AppointmentsEvent();

  @override
  List<Object?> get props => const <Object?>[];
}

final class AppointmentsRequested extends AppointmentsEvent {
  const AppointmentsRequested();
}

final class AppointmentsRefreshed extends AppointmentsEvent {
  const AppointmentsRefreshed();
}
