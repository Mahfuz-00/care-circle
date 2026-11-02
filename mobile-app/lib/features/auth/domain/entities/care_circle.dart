import 'package:equatable/equatable.dart';

/// The care circle a person is looking at.
class CareCircle extends Equatable {
  const CareCircle({required this.id, required this.name});

  final String id;
  final String name;

  @override
  List<Object?> get props => <Object?>[id, name];
}
