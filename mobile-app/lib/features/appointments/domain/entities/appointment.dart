import 'package:equatable/equatable.dart';

/// A doctor, lab or procedure appointment (PRD §5.4).
class Appointment extends Equatable {
  const Appointment({
    required this.id,
    required this.title,
    required this.type,
    required this.location,
    required this.startsAt,
    this.notes,
  });

  final String id;
  final String title;

  /// Free-form type from the API (`doctor`, `lab`, `procedure`, ...).
  final String type;

  final String location;
  final DateTime startsAt;
  final String? notes;

  bool get hasNotes => notes != null && notes!.trim().isNotEmpty;

  @override
  List<Object?> get props =>
      <Object?>[id, title, type, location, startsAt, notes];
}
