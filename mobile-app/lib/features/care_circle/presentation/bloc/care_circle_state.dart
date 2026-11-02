import 'package:equatable/equatable.dart';

import '../../domain/entities/care_circle_details.dart';

enum CareCircleStatus { initial, loading, ready, error }

class CareCircleState extends Equatable {
  const CareCircleState({
    this.status = CareCircleStatus.initial,
    this.details,
    this.message,
  });

  final CareCircleStatus status;
  final CareCircleDetails? details;
  final String? message;

  bool get isLoading => status == CareCircleStatus.loading;

  bool get hasFailed => status == CareCircleStatus.error;

  CareCircleState copyWith({
    CareCircleStatus? status,
    CareCircleDetails? details,
    String? message,
  }) =>
      CareCircleState(
        status: status ?? this.status,
        details: details ?? this.details,
        message: message,
      );

  @override
  List<Object?> get props => <Object?>[status, details, message];
}
