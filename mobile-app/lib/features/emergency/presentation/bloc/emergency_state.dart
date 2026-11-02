import 'package:equatable/equatable.dart';

import '../../domain/entities/emergency_alert.dart';

const Object _unset = Object();

enum EmergencyPhase { idle, raising, active, failed }

class EmergencyState extends Equatable {
  const EmergencyState({
    this.phase = EmergencyPhase.idle,
    this.alert,
    this.requestedType,
    this.refreshing = false,
    this.busy = false,
    this.message,
    this.messageIsError = false,
  });

  final EmergencyPhase phase;
  final EmergencyAlert? alert;

  /// The situation the last press reported, so a retry sends the same thing.
  final EmergencyType? requestedType;

  final bool refreshing;
  final bool busy;
  final String? message;
  final bool messageIsError;

  bool get isRaising => phase == EmergencyPhase.raising;

  bool get hasAlert => alert != null;

  /// An alert that nobody has answered yet.
  bool get isWaitingForHelp => alert?.status.isWaitingForHelp ?? false;

  EmergencyState copyWith({
    EmergencyPhase? phase,
    Object? alert = _unset,
    Object? requestedType = _unset,
    bool? refreshing,
    bool? busy,
    Object? message = _unset,
    bool? messageIsError,
  }) =>
      EmergencyState(
        phase: phase ?? this.phase,
        alert: identical(alert, _unset) ? this.alert : alert as EmergencyAlert?,
        requestedType: identical(requestedType, _unset)
            ? this.requestedType
            : requestedType as EmergencyType?,
        refreshing: refreshing ?? this.refreshing,
        busy: busy ?? this.busy,
        message: identical(message, _unset) ? this.message : message as String?,
        messageIsError: messageIsError ?? this.messageIsError,
      );

  @override
  List<Object?> get props => <Object?>[
        phase,
        alert,
        requestedType,
        refreshing,
        busy,
        message,
        messageIsError,
      ];
}
