import 'package:equatable/equatable.dart';

import '../../domain/entities/medication.dart';

enum MedicationsStatus { initial, loading, ready, error }

class MedicationsState extends Equatable {
  const MedicationsState({
    this.status = MedicationsStatus.initial,
    this.medications = const <Medication>[],
    this.message,
    this.messageIsError = false,
  });

  final MedicationsStatus status;
  final List<Medication> medications;
  final String? message;
  final bool messageIsError;

  bool get isLoading => status == MedicationsStatus.loading;

  bool get hasFailed => status == MedicationsStatus.error;

  List<Medication> get lowStock =>
      medications.where((Medication m) => m.isRunningLow).toList(growable: false);

  Medication? byId(String id) {
    for (final Medication medication in medications) {
      if (medication.id == id) return medication;
    }
    return null;
  }

  MedicationsState copyWith({
    MedicationsStatus? status,
    List<Medication>? medications,
    String? message,
    bool? messageIsError,
  }) =>
      MedicationsState(
        status: status ?? this.status,
        medications: medications ?? this.medications,
        message: message,
        messageIsError: messageIsError ?? false,
      );

  @override
  List<Object?> get props => <Object?>[status, medications, message, messageIsError];
}
