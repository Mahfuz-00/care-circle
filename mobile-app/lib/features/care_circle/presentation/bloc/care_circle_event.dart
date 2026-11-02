import 'package:equatable/equatable.dart';

/// Events for the care-circle screen.
sealed class CareCircleEvent extends Equatable {
  const CareCircleEvent();

  @override
  List<Object?> get props => const <Object?>[];
}

final class CareCircleRequested extends CareCircleEvent {
  const CareCircleRequested();
}

final class CareCircleRefreshed extends CareCircleEvent {
  const CareCircleRefreshed();
}
