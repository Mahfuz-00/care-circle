import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/failure.dart';
import '../../../../core/error/result.dart';
import '../../domain/entities/medication.dart';
import '../../domain/usecases/list_medications.dart';
import 'medications_event.dart';
import 'medications_state.dart';

/// The medication list (read-only here: the API exposes no create/update
/// endpoint on the mobile surface yet).
class MedicationsBloc extends Bloc<MedicationsEvent, MedicationsState> {
  MedicationsBloc({required ListMedications listMedications})
      : _listMedications = listMedications,
        super(const MedicationsState()) {
    on<MedicationsRequested>(_onRequested);
    on<MedicationsRefreshed>(_onRefreshed);
    on<MedicationsMessageCleared>(_onMessageCleared);
  }

  final ListMedications _listMedications;

  Future<void> _onRequested(
    MedicationsRequested event,
    Emitter<MedicationsState> emit,
  ) =>
      _load(emit, showSpinner: state.medications.isEmpty);

  Future<void> _onRefreshed(
    MedicationsRefreshed event,
    Emitter<MedicationsState> emit,
  ) =>
      _load(emit, showSpinner: false);

  void _onMessageCleared(
    MedicationsMessageCleared event,
    Emitter<MedicationsState> emit,
  ) {
    if (state.message == null) return;
    emit(state.copyWith(message: null));
  }

  Future<void> _load(Emitter<MedicationsState> emit, {required bool showSpinner}) async {
    if (showSpinner) emit(state.copyWith(status: MedicationsStatus.loading));

    final Result<List<Medication>> result = await _listMedications();

    switch (result) {
      case Ok<List<Medication>>(value: final List<Medication> medications):
        emit(
          state.copyWith(
            status: MedicationsStatus.ready,
            medications: medications,
            message: null,
          ),
        );
      case Err<List<Medication>>(failure: final Failure failure):
        emit(
          state.copyWith(
            status: MedicationsStatus.error,
            message: failure.message,
            messageIsError: true,
          ),
        );
    }
  }
}
