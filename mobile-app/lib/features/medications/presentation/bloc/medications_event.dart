import 'package:equatable/equatable.dart';

/// Events for the medication list.
sealed class MedicationsEvent extends Equatable {
  const MedicationsEvent();

  @override
  List<Object?> get props => const <Object?>[];
}

final class MedicationsRequested extends MedicationsEvent {
  const MedicationsRequested();
}

final class MedicationsRefreshed extends MedicationsEvent {
  const MedicationsRefreshed();
}

final class MedicationsMessageCleared extends MedicationsEvent {
  const MedicationsMessageCleared();
}
